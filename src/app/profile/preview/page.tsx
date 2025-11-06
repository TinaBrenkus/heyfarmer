'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  MapPin,
  Star,
  Phone,
  Mail,
  MessageCircle,
  Edit
} from 'lucide-react'
import Navigation from '@/components/navigation/Navigation'
import FarmerBadge from '@/components/badges/FarmerBadge'
import { supabase } from '@/lib/supabase'
import { UserType } from '@/lib/database'

interface ProfilePreviewData {
  full_name: string
  farm_name: string
  bio: string
  county: string
  city: string
  user_type: UserType
  grow_tags: string[]
  avatar_url?: string
  contact_preferences: {
    platform_messages: boolean
    show_phone: boolean
    show_email: boolean
  }
  privacy_settings: {
    show_in_marketplace: boolean
    allow_reviews: boolean
    include_in_search: boolean
  }
  phone?: string
  email?: string
  verified: boolean
}

export default function ProfilePreviewPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<ProfilePreviewData | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (profileData) {
      setProfile({
        full_name: profileData.full_name || 'Your Name',
        farm_name: profileData.farm_name || '',
        bio: profileData.bio || 'No bio provided yet.',
        county: profileData.county || 'dallas',
        city: profileData.city || '',
        user_type: profileData.user_type || 'backyard_grower',
        grow_tags: profileData.grow_tags || [],
        avatar_url: profileData.avatar_url,
        contact_preferences: {
          platform_messages: profileData.platform_messages ?? true,
          show_phone: profileData.show_phone ?? false,
          show_email: profileData.show_email ?? false
        },
        privacy_settings: {
          show_in_marketplace: profileData.show_in_marketplace ?? true,
          allow_reviews: profileData.allow_reviews ?? true,
          include_in_search: profileData.include_in_search ?? true
        },
        phone: profileData.phone,
        email: profileData.email || user.email,
        verified: profileData.verified || false
      })
    }
    
    setLoading(false)
  }

  const getCountyDisplayName = (county: string) => {
    const counties = {
      'collin': 'Collin County',
      'dallas': 'Dallas County',
      'denton': 'Denton County',
      'tarrant': 'Tarrant County',
      'wise': 'Wise County',
      'parker': 'Parker County'
    }
    return counties[county as keyof typeof counties] || county
  }

  const getUserTypeDisplayName = (userType: UserType) => {
    switch (userType) {
      case 'backyard_grower': return 'Backyard Grower'
      case 'market_gardener': return 'Market Gardener'
      case 'production_farmer': return 'Production Farm'
      case 'consumer': return 'Food Lover'
      default: return userType
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile preview...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Profile not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Settings
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span className="text-4xl">👁️</span>
              Profile Preview
            </h1>
            <p className="text-gray-600">This is how customers see your public profile</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8">
            <div className="flex items-start gap-6">
              {/* Profile Photo */}
              <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
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
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{profile.full_name}</h2>
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
                <div className="flex items-center gap-3">
                  {profile.contact_preferences.platform_messages && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                      <MessageCircle size={16} />
                      Message
                    </button>
                  )}
                  
                  {profile.contact_preferences.show_phone && profile.phone && (
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      <Phone size={16} />
                      Call
                    </button>
                  )}
                  
                  {profile.contact_preferences.show_email && (
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      <Mail size={16} />
                      Email
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* About Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
              <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
            </div>

            {/* What I Grow */}
            {profile.grow_tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What I Grow</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.grow_tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section (placeholder) */}
            {profile.privacy_settings.allow_reviews && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="text-yellow-400 fill-current" />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">4.8 (12 reviews)</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600 text-center py-4">
                    No reviews yet. Be the first to leave a review after purchasing from this farmer!
                  </p>
                </div>
              </div>
            )}

            {/* Marketplace Visibility Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-lg">ℹ️</span>
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Profile Visibility</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className={profile.privacy_settings.show_in_marketplace ? '✅' : '❌'}></span>
                      <span className="text-blue-700">
                        {profile.privacy_settings.show_in_marketplace ? 'Visible in marketplace' : 'Hidden from marketplace'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={profile.privacy_settings.include_in_search ? '✅' : '❌'}></span>
                      <span className="text-blue-700">
                        {profile.privacy_settings.include_in_search ? 'Appears in search results' : 'Hidden from search'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={profile.privacy_settings.allow_reviews ? '✅' : '❌'}></span>
                      <span className="text-blue-700">
                        {profile.privacy_settings.allow_reviews ? 'Reviews enabled' : 'Reviews disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/settings')}
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <Edit size={18} />
            Edit Profile Settings
          </button>
        </div>
      </main>
    </div>
  )
}