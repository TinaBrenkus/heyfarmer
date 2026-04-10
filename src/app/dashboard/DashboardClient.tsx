'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Settings, LogOut, Plus, MapPin, Users, Calendar, ShoppingCart, Tractor, MessageCircle, HelpCircle } from 'lucide-react'
import FarmLogo from '@/components/icons/FarmLogo'
import TomatoMark from '@/components/icons/TomatoMark'
import { supabase } from '@/lib/supabase'
import { UserType } from '@/lib/database'
import FarmerBadge from '@/components/badges/FarmerBadge'
import Navigation from '@/components/navigation/Navigation'
import QuickTour, { WelcomeTour } from '@/components/onboarding/QuickTour'
import { useWeather } from '@/hooks/useWeather'
import { ChartBar, HandWaving, Lightbulb, Target, TrendUp, User } from '@phosphor-icons/react'

interface Profile {
  id: string
  email: string
  full_name: string
  farm_name?: string
  user_type: UserType
  county: string
  city?: string
  phone?: string
  bio?: string
  avatar_url?: string
  created_at: string
}

export default function DashboardClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [showTour, setShowTour] = useState(false)
  const [showStepTour, setShowStepTour] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [activeListings, setActiveListings] = useState(0)
  const [listings, setListings] = useState<any[]>([])

  // Fetch real weather based on user's location (must be called before any returns)
  const { weather, loading: weatherLoading, error: weatherError } = useWeather(profile?.city, profile?.county)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (profile) {
      loadUnreadMessages()
      loadActiveListings()
      loadUserListings()
    }
  }, [profile])
  
  useEffect(() => {
    // Check if tour should be shown via URL parameter
    if (searchParams.get('tour') === 'true') {
      setShowTour(true)
    }
  }, [searchParams])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Get user profile - handle potential 406 error gracefully
      let profileData = null
      let error = null
      
      try {
        const result = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle() // Use maybeSingle to avoid error if no rows
        
        profileData = result.data
        error = result.error
      } catch (e) {
        console.error('Error fetching profile:', e)
        // Ignore fetch errors and try to create/use profile anyway
      }

      // Profile doesn't exist or couldn't be fetched
      if (!profileData) {
        // Profile doesn't exist, create it from auth metadata
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          const newProfile = {
            id: authUser.id,
            email: authUser.email!,
            full_name: authUser.user_metadata.full_name || 'User',
            user_type: authUser.user_metadata.user_type || 'consumer',
            county: authUser.user_metadata.county || 'dallas',
            farm_name: authUser.user_metadata.farm_name,
            city: authUser.user_metadata.city,
            phone: authUser.user_metadata.phone,
            bio: authUser.user_metadata.bio || `Hi! I'm a ${authUser.user_metadata.user_type?.replace('_', ' ') || 'food lover'} from ${authUser.user_metadata.county || 'Texas Triangle'}. Excited to connect with the local farming community!`,
            avatar_url: authUser.user_metadata.avatar_url || null
          }
          
          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single()
          
          if (createError) {
            // Check if profile already exists (race condition or 409 conflict)
            if (createError.code === '23505' || createError.code === '409' || createError.message?.includes('duplicate')) {
              // Use the profile data we tried to create as it should match what's in the database
              setProfile({
                id: authUser.id,
                email: authUser.email!,
                full_name: authUser.user_metadata.full_name || 'User',
                user_type: authUser.user_metadata.user_type || 'consumer',
                county: authUser.user_metadata.county || 'dallas',
                farm_name: authUser.user_metadata.farm_name,
                city: authUser.user_metadata.city,
                phone: authUser.user_metadata.phone,
                bio: authUser.user_metadata.bio || `Hi! I'm a ${authUser.user_metadata.user_type?.replace('_', ' ') || 'food lover'} from ${authUser.user_metadata.county || 'Texas Triangle'}. Excited to connect with the local farming community!`,
                avatar_url: authUser.user_metadata.avatar_url || null,
                created_at: new Date().toISOString()
              })
              // Show tour for new users (conflict means profile was just created)
              setShowTour(true)
              return
            }
            console.error('Error creating profile:', createError)
            // Use the profile data anyway
            setProfile({
              id: authUser.id,
              email: authUser.email!,
              full_name: authUser.user_metadata.full_name || 'User',
              user_type: authUser.user_metadata.user_type || 'consumer',
              county: authUser.user_metadata.county || 'dallas',
              farm_name: authUser.user_metadata.farm_name,
              city: authUser.user_metadata.city,
              phone: authUser.user_metadata.phone,
              bio: authUser.user_metadata.bio || `Hi! I'm a ${authUser.user_metadata.user_type?.replace('_', ' ') || 'food lover'} from ${authUser.user_metadata.county || 'Texas Triangle'}. Excited to connect with the local farming community!`,
              avatar_url: authUser.user_metadata.avatar_url || null,
              created_at: new Date().toISOString()
            })
            return
          }
          
          if (createdProfile) {
            setProfile(createdProfile)
            // Show tour for new users
            setShowTour(true)
          }
        }
      } else if (profileData) {
        // Profile exists, use it
        setProfile(profileData)
      }
    } catch (error) {
      console.error('Error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadUnreadMessages = async () => {
    if (!profile) return

    try {
      const { data, error } = await supabase
        .from('conversation_participants')
        .select('unread_count')
        .eq('user_id', profile.id)

      if (error) {
        // Silently handle the case where the table doesn't exist or user has no conversations
        if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          setUnreadMessages(0)
          return
        }
        console.error('Error loading unread messages:', error)
        return
      }

      const totalUnread = data?.reduce((sum, participant) => sum + (participant.unread_count || 0), 0) || 0
      setUnreadMessages(totalUnread)
    } catch (error) {
      console.error('Error loading unread messages:', error)
      setUnreadMessages(0)
    }
  }

  const loadActiveListings = async () => {
    if (!profile) return

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id')
        .eq('user_id', profile.id)

      if (error) {
        console.error('Error loading active listings:', error)
        setActiveListings(0)
        return
      }

      setActiveListings(data?.length || 0)
    } catch (error) {
      console.error('Error loading active listings:', error)
      setActiveListings(0)
    }
  }

  const loadUserListings = async () => {
    if (!profile) return

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', profile.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error loading user listings:', error)
        setListings([])
        return
      }

      setListings(data || [])
    } catch (error) {
      console.error('Error loading user listings:', error)
      setListings([])
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleContactSupport = () => {
    const subject = 'Hey Farmer Support Request'
    const userInfo = `User: ${profile?.full_name} (${profile?.email})
User Type: ${getUserTypeLabel(profile?.user_type || 'consumer')}
${profile?.farm_name ? `Farm: ${profile.farm_name}` : ''}
Location: ${profile?.city ? `${profile.city}, ` : ''}${profile?.county}

Issue Description:`
    
    const body = `Hi Hey Farmer Support Team,

${userInfo}

[Please describe your issue or question here]

Best regards,
${profile?.full_name}`

    window.location.href = `mailto:admin@heyfarmer.farm?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-terra-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-soil-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading profile</p>
        </div>
      </div>
    )
  }

  const getUserTypeIcon = (userType: UserType) => {
    switch (userType) {
      case 'consumer': return ShoppingCart
      case 'backyard_grower': return FarmLogo
      case 'market_gardener': return User
      case 'production_farmer': return Tractor
      default: return User
    }
  }

  const getUserTypeLabel = (userType: UserType) => {
    switch (userType) {
      case 'consumer': return 'Food Lover'
      case 'backyard_grower': return 'Backyard Grower'
      case 'market_gardener': return 'Market Gardener'
      case 'production_farmer': return 'Production Farmer'
      default: return 'User'
    }
  }

  const UserTypeIcon = getUserTypeIcon(profile.user_type)
  const isFarmer = profile.user_type !== 'consumer'

  return (
    <div className="min-h-screen bg-soil-50 pb-20 md:pb-0">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Mobile-First Greeting Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl"></div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-soil-800">
                  Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {profile.full_name.split(' ')[0]}!
                </h2>
                <div className="flex items-center gap-2 text-sm text-soil-500">
                  <FarmerBadge 
                    userType={profile.user_type} 
                    verified={false}
                    size="sm"
                  />
                  {profile.farm_name && (
                    <span className="hidden sm:inline">• {profile.farm_name}</span>
                  )}
                </div>
              </div>
            </div>
            {/* Desktop weather */}
            <div className="text-right hidden md:block">
              {weatherLoading ? (
                <div className="flex items-center gap-2 text-soil-400">
                  <div className="w-4 h-4 border-2 border-warm-border border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Loading weather...</span>
                </div>
              ) : weatherError ? (
                <div className="text-sm text-soil-400">Weather unavailable</div>
              ) : weather ? (
                <>
                  <div className="flex items-center gap-2 text-lg font-semibold text-soil-800">
                    <span className="text-2xl">{weather.icon}</span>
                    <span>{weather.temp}°F</span>
                    <span className="text-sm text-soil-500">{weather.description}</span>
                  </div>
                  <p className="text-xs text-soil-400 mt-1">{weather.city}, TX</p>
                </>
              ) : null}
            </div>
            {/* Mobile weather */}
            <div className="md:hidden">
              <div className="text-right">
                {weatherLoading ? (
                  <div className="w-4 h-4 border-2 border-warm-border border-t-transparent rounded-full animate-spin"></div>
                ) : weatherError ? (
                  <div className="text-xs text-soil-400">--</div>
                ) : weather ? (
                  <div className="text-lg">{weather.icon} {weather.temp}°F</div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Summary Card */}
        {(profile.bio || profile.avatar_url) && (
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4 md:mb-6">
            <h3 className="text-lg font-semibold text-soil-800 mb-4 flex items-center gap-2">
              <User size={24} weight="regular" />
              Your Profile
            </h3>
            <div className="flex items-start gap-4">
              {/* Profile Photo */}
              {profile.avatar_url && (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-warm-border flex-shrink-0">
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {/* Bio */}
              <div className="flex-1">
                <h4 className="font-medium text-soil-800 mb-2">{profile.full_name}</h4>
                {profile.farm_name && (
                  <p className="text-sm text-soil-500 mb-2">{profile.farm_name}</p>
                )}
                {profile.bio && (
                  <p className="text-sm text-soil-700 leading-relaxed">{profile.bio}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Card Layout */}
        <div className="md:hidden space-y-4 mb-6">
          {/* Activity Card */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold text-soil-800 mb-3 flex items-center gap-2">
              <ChartBar size={24} weight="regular" />
              Quick Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-lg bg-farm-green-50 border border-warm-border">
                <div className="text-xl font-bold text-farm-green-800 mb-1">
                  {isFarmer ? '0' : '-'}
                </div>
                <div className="text-xs text-farm-green-800">Listings</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-terra-50 border border-terra-100">
                <div className="text-xl font-bold text-terra-600 mb-1">{unreadMessages}</div>
                <div className="text-xs text-terra-700">Messages</div>
              </div>
            </div>
          </div>

          {/* Getting Started Card */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-soil-800 flex items-center gap-2">
                <TrendUp size={24} weight="regular" />
                Get Started
              </h3>
            </div>
            <div className="space-y-2">
              {isFarmer ? (
                <>
                  <div className="flex items-center gap-3 p-2 bg-farm-green-50 rounded-lg border border-warm-border">
                    <div className="w-2 h-2 bg-farm-green-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-soil-800 truncate">Create first listing</p>
                    </div>
                    <button 
                      onClick={() => router.push('/sell')}
                      className="text-xs bg-farm-green-800 text-white px-2 py-1 rounded-md"
                    >
                      Go
                    </button>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-terra-50 rounded-lg border border-terra-100">
                    <div className="w-2 h-2 bg-terra-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-soil-800 truncate">Join farmer network</p>
                    </div>
                    <button 
                      onClick={() => router.push('/network')}
                      className="text-xs bg-terra-600 text-white px-2 py-1 rounded-md"
                    >
                      Go
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 p-2 bg-farm-green-50 rounded-lg border border-warm-border">
                    <div className="w-2 h-2 bg-farm-green-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-soil-800 truncate">Browse marketplace</p>
                    </div>
                    <button 
                      onClick={() => router.push('/marketplace')}
                      className="text-xs bg-farm-green-800 text-white px-2 py-1 rounded-md"
                    >
                      Go
                    </button>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-terra-50 rounded-lg border border-terra-100">
                    <div className="w-2 h-2 bg-terra-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-soil-800 truncate">Complete profile</p>
                    </div>
                    <button 
                      onClick={() => router.push('/settings')}
                      className="text-xs bg-terra-600 text-white px-2 py-1 rounded-md"
                    >
                      Go
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Post Button - Farmers Only */}
          {isFarmer && (
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-sm p-4 text-center">
              <button
                onClick={() => router.push('/post')}
                className="w-full flex items-center justify-center gap-2 text-white font-semibold"
              >
                <Plus className="h-5 w-5" />
                Quick Post
              </button>
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          {/* Activity Stats */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-soil-800 mb-4 flex items-center gap-2">
              <ChartBar size={24} weight="regular" />
              Quick Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-farm-green-50 border border-warm-border">
                <div className="text-2xl font-bold text-farm-green-800 mb-1">
                  {isFarmer ? activeListings : '-'}
                </div>
                <div className="text-sm text-soil-500">Active Listings</div>
                <p className="text-xs text-soil-400 mt-1">
                  {isFarmer ? 'Products for sale' : 'For farmers only'}
                </p>
              </div>
              <div className="text-center p-4 rounded-lg bg-terra-50 border border-terra-200">
                <div className="text-2xl font-bold text-terra-600 mb-1">{unreadMessages}</div>
                <div className="text-sm text-soil-500">Messages</div>
                <p className="text-xs text-soil-400 mt-1">Unread conversations</p>
              </div>
            </div>
            {!isFarmer && (
              <div className="mt-4 p-3 bg-terra-50 border border-terra-200 rounded-lg">
                <p className="text-sm text-terra-800">
                  <strong>Tip:</strong> Browse the marketplace to find fresh local produce from farmers near you!
                </p>
              </div>
            )}
          </div>

          {/* My Listings Section */}
          {isFarmer && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-soil-800 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-farm-green-800" />
                  My Listings
                </h3>
                <button
                  onClick={() => router.push('/sell')}
                  className="text-sm text-farm-green-800 hover:text-farm-green-800 font-medium flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  New Listing
                </button>
              </div>

              {listings.length === 0 ? (
                <div className="text-center py-8 text-soil-400">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm mb-2">No active listings yet</p>
                  <button
                    onClick={() => router.push('/sell')}
                    className="text-farm-green-800 hover:text-farm-green-800 text-sm font-medium"
                  >
                    Create your first listing →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {listings.map((listing) => (
                    <div key={listing.id} className="border border-warm-border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-soil-800 mb-1">{listing.title}</h4>
                          <p className="text-sm text-soil-500 mb-2 line-clamp-1">{listing.description}</p>
                          <div className="flex items-center gap-4 text-xs text-soil-400">
                            {listing.price && (
                              <span className="font-semibold text-farm-green-800">
                                ${listing.price}{listing.unit ? `/${listing.unit}` : ''}
                              </span>
                            )}
                            {listing.products && listing.products.length > 0 && (
                              <span className="text-terra-600 font-medium">
                                {listing.products.length} products
                              </span>
                            )}
                            {listing.quantity_available && !listing.products && (
                              <span>{listing.quantity_available} available</span>
                            )}
                            <span>•</span>
                            <span>{new Date(listing.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => router.push(`/sell/${listing.id}`)}
                            className="px-3 py-1.5 text-sm bg-terra-600 text-white rounded-lg hover:bg-terra-700 transition-colors flex items-center gap-1"
                          >
                            <Tractor className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => router.push(`/listing/${listing.id}`)}
                            className="px-3 py-1.5 text-sm border border-warm-border text-soil-700 rounded-lg hover:bg-soil-50 transition-colors"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {listings.length > 0 && (
                    <button
                      onClick={() => router.push('/marketplace')}
                      className="w-full text-center text-sm text-soil-500 hover:text-soil-800 py-2"
                    >
                      View all in marketplace →
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Help & Support Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-soil-800 mb-4 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-terra-600" />
              Need Help?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleContactSupport}
                className="flex items-center gap-3 p-4 bg-terra-50 hover:bg-terra-100 rounded-lg border border-terra-200 transition-colors group"
              >
                <MessageCircle className="h-5 w-5 text-terra-600" />
                <div className="text-left">
                  <p className="font-medium text-soil-800 group-hover:text-terra-700">Contact Support</p>
                  <p className="text-sm text-soil-500">Get help with your account</p>
                </div>
              </button>
              
              <button
                onClick={() => setShowTour(true)}
                className="flex items-center gap-3 p-4 bg-farm-green-50 hover:bg-farm-green-100 rounded-lg border border-warm-border transition-colors group"
              >
                <Target size={24} weight="regular" />
                <div className="text-left">
                  <p className="font-medium text-soil-800 group-hover:text-farm-green-800">Show Welcome Tour</p>
                  <p className="text-sm text-soil-500">Review the basics</p>
                </div>
              </button>
            </div>
          </div>

          {/* Settings Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-soil-800 mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-soil-500" />
              Account Settings
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/settings')}
                className="w-full flex items-center justify-between p-3 hover:bg-soil-50 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-soil-400" />
                  <div className="text-left">
                    <p className="font-medium text-soil-800">Edit Profile</p>
                    <p className="text-sm text-soil-400">Update your information</p>
                  </div>
                </div>
                <span className="text-soil-400 group-hover:text-soil-500">→</span>
              </button>
              
              <button
                onClick={() => router.push('/settings')}
                className="w-full flex items-center justify-between p-3 hover:bg-soil-50 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-soil-400" />
                  <div className="text-left">
                    <p className="font-medium text-soil-800">Preferences</p>
                    <p className="text-sm text-soil-400">Manage your settings</p>
                  </div>
                </div>
                <span className="text-soil-400 group-hover:text-soil-500">→</span>
              </button>
              
              <div className="pt-3 border-t border-warm-border">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg transition-colors group"
                >
                  <LogOut className="h-5 w-5 text-red-500" />
                  <p className="font-medium text-red-600 group-hover:text-red-700">Sign Out</p>
                </button>
              </div>
            </div>
          </div>

          {/* Create New Post CTA - Farmers Only */}
          {isFarmer && (
            <div className="text-center">
              <button
                onClick={() => router.push('/post')}
                className="inline-flex items-center gap-3 px-8 py-4 bg-farm-green-800 text-white rounded-xl font-semibold text-lg shadow-lg hover:bg-farm-green-800 transition-all transform hover:scale-105"
              >
                <Plus className="h-6 w-6" />
                Create New Post
              </button>
              <p className="text-sm text-soil-500 mt-2">Share what you're growing or what you need</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Help Button */}
      <button
        onClick={handleContactSupport}
        className="fixed bottom-6 right-6 bg-terra-600 hover:bg-terra-700 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-105 z-50 md:bottom-8 md:right-8"
        title="Contact Support"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
      
      {/* Tour Modal */}
      {showTour && profile && (
        <>
          <WelcomeTour
            userType={profile.user_type}
            onComplete={() => {
              // For MVP: Just close the welcome card
              setShowTour(false)
              // Commented out for MVP - can re-enable full tour later
              // setShowStepTour(true)
            }}
            onSkip={() => {
              setShowTour(false)
              // Clear the tour parameter from URL
              const newUrl = window.location.pathname
              window.history.replaceState({}, '', newUrl)
            }}
          />
        </>
      )}
      
      {/* Step-by-step Tour - Hidden for MVP */}
      {/* {showStepTour && profile && (
        <QuickTour
          userType={profile.user_type}
          onComplete={() => {
            setShowStepTour(false)
            // Clear the tour parameter from URL
            const newUrl = window.location.pathname
            window.history.replaceState({}, '', newUrl)
          }}
          onSkip={() => {
            setShowStepTour(false)
            // Clear the tour parameter from URL
            const newUrl = window.location.pathname
            window.history.replaceState({}, '', newUrl)
          }}
        />
      )} */}
    </div>
  )
}