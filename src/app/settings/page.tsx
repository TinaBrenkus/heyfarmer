'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Settings as SettingsIcon,
  Camera,
  X,
  Plus,
  Eye,
  EyeOff,
  Save,
  User,
  AlertCircle
} from 'lucide-react'
import Navigation from '@/components/navigation/Navigation'
import FarmerBadge from '@/components/badges/FarmerBadge'
import { supabase } from '@/lib/supabase'
import { UserType, TexasTriangleCounty } from '@/lib/database'

interface ProfileData {
  full_name: string
  farm_name: string
  bio: string
  county: TexasTriangleCounty
  city: string
  exact_address: string
  phone: string
  email: string
  user_type: UserType
  grow_tags: string[]
  profile_photo?: File | null
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
}

export default function ProfileSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    farm_name: '',
    bio: '',
    county: 'dallas',
    city: '',
    exact_address: '',
    phone: '',
    email: '',
    user_type: 'backyard_grower',
    grow_tags: [],
    profile_photo: null,
    contact_preferences: {
      platform_messages: true,
      show_phone: false,
      show_email: false
    },
    privacy_settings: {
      show_in_marketplace: true,
      allow_reviews: true,
      include_in_search: true
    }
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newTag, setNewTag] = useState('')
  const [photoPreview, setPhotoPreview] = useState('')

  useEffect(() => {
    checkAuthAndFetchProfile()
  }, [])

  const checkAuthAndFetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    setCurrentUser(user)
    
    if (profile) {
      setProfileData({
        full_name: profile.full_name || '',
        farm_name: profile.farm_name || '',
        bio: profile.bio || '',
        county: profile.county || 'dallas',
        city: profile.city || '',
        exact_address: profile.exact_address || '',
        phone: profile.phone || '',
        email: profile.email || user.email || '',
        user_type: profile.user_type || 'backyard_grower',
        grow_tags: profile.grow_tags || [],
        avatar_url: profile.avatar_url,
        contact_preferences: {
          platform_messages: profile.platform_messages ?? true,
          show_phone: profile.show_phone ?? false,
          show_email: profile.show_email ?? false
        },
        privacy_settings: {
          show_in_marketplace: profile.show_in_marketplace ?? true,
          allow_reviews: profile.allow_reviews ?? true,
          include_in_search: profile.include_in_search ?? true
        },
        profile_photo: null
      })
    }
    
    setLoading(false)
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, photo: 'Image must be less than 5MB' }))
        return
      }
      
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, photo: 'Please select an image file' }))
        return
      }

      // Clear photo error
      setErrors(prev => ({ ...prev, photo: '' }))
      
      setProfileData(prev => ({ ...prev, profile_photo: file }))
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setProfileData(prev => ({ ...prev, profile_photo: null, avatar_url: '' }))
    setPhotoPreview('')
    setErrors(prev => ({ ...prev, photo: '' }))
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const addGrowTag = () => {
    const trimmedTag = newTag.trim()
    if (trimmedTag && !profileData.grow_tags.includes(trimmedTag)) {
      if (profileData.grow_tags.length >= 15) {
        setErrors(prev => ({ ...prev, tags: 'Maximum 15 tags allowed' }))
        return
      }
      
      setProfileData(prev => ({
        ...prev,
        grow_tags: [...prev.grow_tags, trimmedTag]
      }))
      setNewTag('')
      setErrors(prev => ({ ...prev, tags: '' }))
    } else if (profileData.grow_tags.includes(trimmedTag)) {
      setErrors(prev => ({ ...prev, tags: 'Tag already exists' }))
    }
  }

  const removeGrowTag = (tagToRemove: string) => {
    setProfileData(prev => ({
      ...prev,
      grow_tags: prev.grow_tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!profileData.full_name.trim()) {
      newErrors.full_name = 'Name is required'
    }

    if (!profileData.bio.trim()) {
      newErrors.bio = 'Bio is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setSaving(true)
    setErrors({ submit: '' })

    try {
      // Upload photo if there's a new one
      let avatarUrl = profileData.avatar_url
      if (profileData.profile_photo) {
        // Here you would upload the photo to Supabase storage
        console.log('Would upload photo:', profileData.profile_photo)
        // avatarUrl = await uploadPhoto(profileData.profile_photo)
      }

      // Prepare profile data for database
      const updateData = {
        full_name: profileData.full_name,
        farm_name: profileData.farm_name || null,
        bio: profileData.bio,
        county: profileData.county,
        city: profileData.city || null,
        exact_address: profileData.exact_address || null,
        phone: profileData.phone || null,
        email: profileData.email,
        user_type: profileData.user_type,
        grow_tags: profileData.grow_tags,
        avatar_url: avatarUrl,
        platform_messages: profileData.contact_preferences.platform_messages,
        show_phone: profileData.contact_preferences.show_phone,
        show_email: profileData.contact_preferences.show_email,
        show_in_marketplace: profileData.privacy_settings.show_in_marketplace,
        allow_reviews: profileData.privacy_settings.allow_reviews,
        include_in_search: profileData.privacy_settings.include_in_search,
        updated_at: new Date().toISOString()
      }

      // Here you would update the database
      console.log('Saving profile:', updateData)
      
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Clear the uploaded photo from state since it's now saved
      if (profileData.profile_photo) {
        setProfileData(prev => ({ 
          ...prev, 
          profile_photo: null, 
          avatar_url: avatarUrl 
        }))
        setPhotoPreview('')
      }
      
      // Success feedback
      alert('Profile updated successfully! ✅')
      
    } catch (error) {
      console.error('Error saving profile:', error)
      setErrors({ submit: 'Failed to save profile. Please check your connection and try again.' })
    } finally {
      setSaving(false)
    }
  }

  const counties = [
    { value: 'collin', label: 'Collin County' },
    { value: 'dallas', label: 'Dallas County' },
    { value: 'denton', label: 'Denton County' },
    { value: 'tarrant', label: 'Tarrant County' },
    { value: 'wise', label: 'Wise County' },
    { value: 'parker', label: 'Parker County' }
  ]

  const commonTags = [
    '🥚 Eggs', '🍅 Tomatoes', '🌿 Herbs', '🥒 Cucumbers', 
    '🥕 Carrots', '🌶️ Peppers', '🥬 Lettuce', '🧄 Garlic',
    '🥔 Potatoes', '🌽 Corn', '🫛 Beans', '🥦 Broccoli'
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <span className="text-4xl">⚙️</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600">Manage your public profile and privacy settings</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-8">
            {/* Section Header */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Public Profile (What customers see):
              </h2>
              <p className="text-sm text-gray-600">
                This information will be visible to customers browsing the marketplace
              </p>
            </div>

            {/* Profile Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                📷 Profile Photo
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : profileData.avatar_url ? (
                    <img
                      src={profileData.avatar_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div className="flex gap-2">
                  <label className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    {photoPreview || profileData.avatar_url ? 'Change Photo' : 'Upload Photo'}
                  </label>
                  {(photoPreview || profileData.avatar_url) && (
                    <button
                      onClick={removePhoto}
                      className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              {errors.photo && (
                <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                  <AlertCircle size={16} />
                  <span>{errors.photo}</span>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Recommended: Square image, at least 200x200px, max 5MB
              </p>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.full_name ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.full_name && (
                  <div className="flex items-center gap-2 mt-1 text-red-600 text-sm">
                    <AlertCircle size={16} />
                    <span>{errors.full_name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Farm Name
                </label>
                <input
                  type="text"
                  value={profileData.farm_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, farm_name: e.target.value }))}
                  placeholder="e.g., Smith Family Garden"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio <span className="text-red-500">*</span>
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                placeholder="Tell customers about your farm, growing practices, and what makes your products special..."
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${
                  errors.bio ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.bio && (
                <div className="flex items-center gap-2 mt-1 text-red-600 text-sm">
                  <AlertCircle size={16} />
                  <span>{errors.bio}</span>
                </div>
              )}
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">This will be shown on your public profile</p>
                <span className="text-xs text-gray-400">{profileData.bio.length} characters</span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-xs text-gray-500">(Public)</span>
                </label>
                <select
                  value={profileData.county}
                  onChange={(e) => setProfileData(prev => ({ ...prev, county: e.target.value as TexasTriangleCounty }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {counties.map(county => (
                    <option key={county.value} value={county.value}>
                      {county.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City/Town
                </label>
                <input
                  type="text"
                  value={profileData.city}
                  onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="e.g., Decatur"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exact Address <span className="text-xs text-gray-500">(Private - for pickups only)</span>
              </label>
              <input
                type="text"
                value={profileData.exact_address}
                onChange={(e) => setProfileData(prev => ({ ...prev, exact_address: e.target.value }))}
                placeholder="Full address for customer pickups"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will only be shared with customers who purchase from you
              </p>
            </div>

            {/* What I Grow */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What I Grow
              </label>
              
              {/* Current Tags */}
              {profileData.grow_tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {profileData.grow_tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => removeGrowTag(tag)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add New Tag */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => {
                    setNewTag(e.target.value)
                    if (errors.tags) setErrors(prev => ({ ...prev, tags: '' }))
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && addGrowTag()}
                  placeholder="Add what you grow..."
                  className={`flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.tags ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <button
                  onClick={addGrowTag}
                  disabled={!newTag.trim()}
                  className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              {errors.tags && (
                <div className="flex items-center gap-2 mb-4 text-red-600 text-sm">
                  <AlertCircle size={16} />
                  <span>{errors.tags}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">
                  Tags help customers find what you offer ({profileData.grow_tags.length}/15)
                </p>
                {profileData.grow_tags.length > 0 && (
                  <button
                    onClick={() => setProfileData(prev => ({ ...prev, grow_tags: [] }))}
                    className="text-sm text-red-600 hover:text-red-800 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Common Tags */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Common items:</p>
                <div className="flex flex-wrap gap-2">
                  {commonTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        if (!profileData.grow_tags.includes(tag)) {
                          setProfileData(prev => ({
                            ...prev,
                            grow_tags: [...prev.grow_tags, tag]
                          }))
                        }
                      }}
                      disabled={profileData.grow_tags.includes(tag)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Preferences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Contact Preferences:
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={profileData.contact_preferences.platform_messages}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      contact_preferences: {
                        ...prev.contact_preferences,
                        platform_messages: e.target.checked
                      }
                    }))}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Platform messages</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={profileData.contact_preferences.show_phone}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      contact_preferences: {
                        ...prev.contact_preferences,
                        show_phone: e.target.checked
                      }
                    }))}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Show phone number</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={profileData.contact_preferences.show_email}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      contact_preferences: {
                        ...prev.contact_preferences,
                        show_email: e.target.checked
                      }
                    }))}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Show email address</span>
                </label>
              </div>
            </div>

            {/* Privacy Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                🔒 Privacy Settings:
              </label>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={profileData.privacy_settings.show_in_marketplace}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        privacy_settings: {
                          ...prev.privacy_settings,
                          show_in_marketplace: e.target.checked
                        }
                      }))}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">Show in public marketplace</span>
                        <span className="text-lg">{profileData.privacy_settings.show_in_marketplace ? '🟢' : '🔴'}</span>
                      </div>
                      <p className="text-xs text-gray-500">When enabled, customers can discover and contact you through the marketplace</p>
                    </div>
                  </label>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={profileData.privacy_settings.allow_reviews}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        privacy_settings: {
                          ...prev.privacy_settings,
                          allow_reviews: e.target.checked
                        }
                      }))}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">Allow customer reviews</span>
                        <span className="text-lg">{profileData.privacy_settings.allow_reviews ? '⭐' : '❌'}</span>
                      </div>
                      <p className="text-xs text-gray-500">Customers can leave reviews and ratings on your profile</p>
                    </div>
                  </label>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={profileData.privacy_settings.include_in_search}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        privacy_settings: {
                          ...prev.privacy_settings,
                          include_in_search: e.target.checked
                        }
                      }))}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">Include in search results</span>
                        <span className="text-lg">{profileData.privacy_settings.include_in_search ? '🔍' : '🚫'}</span>
                      </div>
                      <p className="text-xs text-gray-500">Your profile appears when customers search for products or farmers</p>
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-lg">💡</span>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Privacy Tip</p>
                    <p className="text-xs text-blue-700">
                      You can always update these settings later. Having a public profile helps customers find and trust your products.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => router.push('/profile/preview')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye size={16} />
              Preview Public Profile
            </button>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>

          {errors.submit && (
            <div className="flex items-center gap-2 mt-4 text-red-600 text-sm">
              <AlertCircle size={16} />
              <span>{errors.submit}</span>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}