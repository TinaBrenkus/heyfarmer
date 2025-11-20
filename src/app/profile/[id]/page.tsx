'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft,
  MapPin,
  Star,
  Phone,
  Mail,
  MessageCircle,
  ExternalLink,
  Package,
  Calendar,
  CheckCircle
} from 'lucide-react'
import Navigation from '@/components/navigation/Navigation'
import FarmerBadge from '@/components/badges/FarmerBadge'
import ListingCard from '@/components/marketplace/ListingCard'
import Linkify from '@/components/common/Linkify'
import { supabase } from '@/lib/supabase'
import { UserType, Post } from '@/lib/database'

interface Profile {
  id: string
  full_name: string
  farm_name?: string
  bio?: string
  county: string
  city?: string
  user_type: UserType
  grow_tags?: string[]
  avatar_url?: string
  verified?: boolean
  platform_messages?: boolean
  show_phone?: boolean
  show_email?: boolean
  phone?: string
  email?: string
  show_in_marketplace?: boolean
  allow_reviews?: boolean
  include_in_search?: boolean
  created_at: string
}

export default function PublicProfilePage() {
  const router = useRouter()
  const params = useParams()
  const profileId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [listings, setListings] = useState<Post[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkCurrentUser()
    fetchProfile()
    fetchUserListings()
  }, [profileId])

  const checkCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const fetchProfile = async () => {
    if (!profileId) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Profile not found')
        } else {
          setError('Error loading profile')
        }
        console.error('Error fetching profile:', error)
        return
      }

      // Check if profile should be visible
      if (data.show_in_marketplace === false) {
        setError('This profile is not publicly visible')
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Error loading profile')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserListings = async () => {
    if (!profileId) return

    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            id,
            full_name,
            farm_name,
            avatar_url,
            user_type
          )
        `)
        .eq('user_id', profileId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6)

      if (error) {
        // Handle missing posts table gracefully
        if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          setListings([])
          return
        }
        console.error('Error fetching listings:', error)
        return
      }

      console.log('Fetched listings for profile:', profileId, 'Count:', data?.length, 'Data:', data)
      setListings(data || [])
    } catch (error) {
      console.error('Error fetching listings:', error)
      setListings([])
    }
  }

  const handleContact = async () => {
    if (!currentUser) {
      router.push('/login?redirect=' + encodeURIComponent(`/profile/${profileId}`))
      return
    }

    if (!profile) return

    try {
      // Get or create conversation
      const { data: conversationId, error } = await supabase.rpc('get_or_create_conversation', {
        p_user1_id: currentUser.id,
        p_user2_id: profile.id
      })

      if (error) throw error

      // Send initial message
      const initialMessage = `Hi ${profile.farm_name || profile.full_name}! I found your profile on Hey Farmer and would love to learn more about what you grow.`
      
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: currentUser.id,
        content: initialMessage
      })

      router.push('/messages')
    } catch (error) {
      console.error('Error starting conversation:', error)
      router.push('/messages')
    }
  }

  const handleListingContact = async (listing: Post) => {
    if (!currentUser) {
      router.push('/login?redirect=' + encodeURIComponent(`/profile/${profileId}`))
      return
    }

    try {
      const { data: conversationId, error } = await supabase.rpc('get_or_create_conversation', {
        p_user1_id: currentUser.id,
        p_user2_id: listing.user_id
      })

      if (error) throw error

      const initialMessage = `Hi! I'm interested in your listing: "${listing.title}". Could you tell me more about it?`
      
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: currentUser.id,
        content: initialMessage
      })

      router.push('/messages')
    } catch (error) {
      console.error('Error starting conversation:', error)
      router.push('/messages')
    }
  }

  const getCountyDisplayName = (county: string) => {
    const counties = {
      'collin': 'Collin County',
      'dallas': 'Dallas County', 
      'denton': 'Denton County',
      'tarrant': 'Tarrant County',
      'wise': 'Wise County',
      'parker': 'Parker County',
      'jack': 'Jack County',
      'grayson': 'Grayson County',
      'hunt': 'Hunt County',
      'kaufman': 'Kaufman County',
      'rockwall': 'Rockwall County'
    }
    return counties[county as keyof typeof counties] || county.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) + ' County'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="text-6xl mb-4">😞</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {error || 'Profile not found'}
            </h2>
            <p className="text-gray-600 mb-4">
              This profile may be private or no longer exist.
            </p>
            <button
              onClick={() => router.push('/marketplace')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Marketplace
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === profile.id

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          
          {isOwnProfile && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              <CheckCircle size={16} />
              This is your profile
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Hero Section */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8">
                <div className="flex items-start gap-6">
                  {/* Profile Photo */}
                  <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">👤</span>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900 truncate">{profile.full_name}</h1>
                      <FarmerBadge 
                        userType={profile.user_type}
                        verified={profile.verified}
                        size="md"
                      />
                    </div>

                    {profile.farm_name && (
                      <p className="text-lg text-gray-700 mb-2">{profile.farm_name}</p>
                    )}

                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <MapPin size={16} />
                      <span>
                        {profile.city ? `${profile.city}, ` : ''}{getCountyDisplayName(profile.county)}, Texas
                      </span>
                    </div>

                    {/* Contact Buttons */}
                    <div className="flex flex-wrap items-center gap-3">
                      {profile.platform_messages && !isOwnProfile && (
                        <button 
                          onClick={handleContact}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                          <MessageCircle size={16} />
                          Message
                        </button>
                      )}
                      
                      {profile.show_phone && profile.phone && (
                        <a
                          href={`tel:${profile.phone}`}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Phone size={16} />
                          Call
                        </a>
                      )}
                      
                      {profile.show_email && profile.email && (
                        <a
                          href={`mailto:${profile.email}`}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Mail size={16} />
                          Email
                        </a>
                      )}

                      {isOwnProfile && (
                        <button
                          onClick={() => router.push('/settings')}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <ExternalLink size={16} />
                          Edit Profile
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {/* Showcase Section - What I Always Sell */}
                {profile.grow_tags && profile.grow_tags.length > 0 && (
                  <div className="mb-8 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Package size={24} className="text-green-600" />
                      <h2 className="text-xl font-bold text-gray-900">What I Grow & Sell</h2>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      These are the products I typically have available throughout the growing season
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {profile.grow_tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-4 py-2 bg-white border-2 border-green-300 text-green-800 rounded-lg text-base font-semibold shadow-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* About Section */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MessageCircle size={20} />
                    About {profile.farm_name || profile.full_name}
                  </h2>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    <Linkify text={profile.bio || 'No bio provided yet.'} />
                  </div>
                </div>

                {/* Current Listings Section */}
                {listings.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Calendar size={20} className="text-blue-600" />
                          Available Right Now
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">Current listings from this farmer</p>
                      </div>
                      <button
                        onClick={() => router.push(`/marketplace?farmer=${profile.id}`)}
                        className="text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        View All →
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {listings.slice(0, 4).map((listing) => (
                        <div key={listing.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-3">
                            <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              {listing.thumbnail_url ? (
                                <img
                                  src={listing.thumbnail_url}
                                  alt={listing.title}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <Package size={24} className="text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 mb-1">{listing.title}</h3>
                              <p className="text-green-600 font-bold text-lg mb-2">
                                ${listing.price || 'Price on request'}
                                {listing.unit && `/${listing.unit}`}
                              </p>
                              
                              {listing.quantity_available && (
                                <p className="text-xs text-gray-500 mb-2">
                                  {listing.quantity_available} available
                                </p>
                              )}

                              <div className="flex gap-2">
                                {isOwnProfile ? (
                                  <>
                                    <button
                                      onClick={() => router.push(`/sell/${listing.id}`)}
                                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => router.push(`/listing/${listing.id}`)}
                                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                    >
                                      View Listing
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleListingContact(listing)}
                                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                    >
                                      Buy Now
                                    </button>
                                    <button
                                      onClick={() => handleListingContact(listing)}
                                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                    >
                                      Ask Question
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Member Since */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar size={16} />
                  <span>Member since {new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Listings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package size={20} />
                  Current Listings
                </h2>
                {listings.length > 0 && (
                  <button
                    onClick={() => router.push(`/marketplace?farmer=${profile.id}`)}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    View All →
                  </button>
                )}
              </div>

              {listings.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Package size={32} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No active listings</p>
                  {isOwnProfile && (
                    <button
                      onClick={() => router.push('/sell')}
                      className="mt-2 text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      Create your first listing →
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {listings.slice(0, 3).map((listing) => (
                    <div key={listing.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          {listing.thumbnail_url ? (
                            <img
                              src={listing.thumbnail_url}
                              alt={listing.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package size={20} className="text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm mb-1">{listing.title}</h3>
                          <p className="text-green-600 font-bold text-base mb-2">
                            ${listing.price || 'Price on request'}
                            {listing.unit && `/${listing.unit}`}
                          </p>
                          
                          {/* Quantity and availability */}
                          {listing.quantity_available && (
                            <p className="text-xs text-gray-500 mb-2">
                              {listing.quantity_available} available
                              {listing.available_until && (
                                <span> • Until {new Date(listing.available_until).toLocaleDateString()}</span>
                              )}
                            </p>
                          )}

                          {/* Delivery options */}
                          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                            {listing.pickup_available && (
                              <span className="flex items-center gap-1">
                                <Package size={10} />
                                Pickup
                              </span>
                            )}
                            {listing.delivery_available && (
                              <span className="flex items-center gap-1">
                                <Package size={10} />
                                Delivery
                              </span>
                            )}
                          </div>

                          {isOwnProfile ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => router.push(`/sell/${listing.id}`)}
                                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => router.push(`/listing/${listing.id}`)}
                                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium"
                              >
                                View
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleListingContact(listing)}
                                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium"
                              >
                                Buy Now
                              </button>
                              <button
                                onClick={() => handleListingContact(listing)}
                                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium"
                              >
                                Ask Question
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews Section (placeholder) */}
            {profile.allow_reviews && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Star size={20} />
                  Reviews
                </h2>
                
                <div className="text-center py-6 text-gray-500">
                  <Star size={32} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No reviews yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Reviews will appear here after purchases
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}