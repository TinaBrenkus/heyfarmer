'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { UserType } from '@/lib/database'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CreateListingForm from '@/components/marketplace/CreateListingForm'

export default function EditListingPage() {
  const router = useRouter()
  const params = useParams()
  const listingId = params.id as string

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkUserAndListing()
  }, [])

  const checkUserAndListing = async () => {
    try {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login?redirect=/sell')
        return
      }

      setUser(user)

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
        setError('Could not load profile')
        setLoading(false)
        return
      }

      setProfile(profileData)

      // Get the listing
      const { data: listingData, error: listingError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', listingId)
        .single()

      if (listingError) {
        console.error('Error fetching listing:', listingError)
        setError('Listing not found')
        setLoading(false)
        return
      }

      // Check if user owns this listing
      if (listingData.user_id !== user.id) {
        setError('You do not have permission to edit this listing')
        setLoading(false)
        return
      }

      setListing(listingData)
    } catch (error) {
      console.error('Error:', error)
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleListingSuccess = (listing: any) => {
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading listing...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {error}
            </h1>

            <button
              onClick={() => router.push('/dashboard')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
        </main>

        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Edit Listing
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Update your listing details
          </p>
        </div>

        {/* Edit Listing Form */}
        <CreateListingForm
          existingListing={listing}
          onSuccess={handleListingSuccess}
          onCancel={() => router.push('/dashboard')}
        />
      </main>

      <Footer />
    </div>
  )
}
