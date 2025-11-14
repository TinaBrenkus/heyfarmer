'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, User, MapPin, Phone, FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import ProfilePhotoUpload from '@/components/profile/ProfilePhotoUpload'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      setProfile(profileData)
    } catch (err: any) {
      console.error('Error loading profile:', err)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          farm_name: profile.farm_name,
          phone: profile.phone,
          bio: profile.bio
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)

    } catch (err: any) {
      console.error('Update error:', err)
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile((prev: any) => ({
      ...prev,
      [name]: value
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load profile</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline mt-4 inline-block">
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account information and profile photo</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
          {/* Profile Photo Section */}
          <div className="p-6">
            <ProfilePhotoUpload
              userId={user.id}
              currentPhotoUrl={profile.avatar_url}
              onUploadComplete={(url) => {
                setProfile((prev: any) => ({ ...prev, avatar_url: url }))
              }}
            />
          </div>

          {/* Profile Information */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </div>
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={profile.full_name || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Farm Name (if farmer) */}
              {profile.user_type !== 'consumer' && (
                <div>
                  <label htmlFor="farm_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Farm/Garden Name
                  </label>
                  <input
                    id="farm_name"
                    name="farm_name"
                    type="text"
                    value={profile.farm_name || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </div>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={profile.phone || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Bio
                  </div>
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={profile.bio || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  placeholder="Tell others about yourself..."
                />
              </div>

              {/* Read-only fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-700">
                    {user.email}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      County
                    </div>
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-700">
                    {profile.county?.replace(/-/g, ' ')?.replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Not set'}
                  </div>
                </div>
              </div>

              {/* Success Message */}
              {success && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-sm text-green-700">Profile updated successfully!</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 flex items-center gap-2"
                  style={{ backgroundColor: saving ? '#94a3b8' : '#2E7D32' }}
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
