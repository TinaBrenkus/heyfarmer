'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { UserType } from '@/lib/database'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CreateListingForm from '@/components/marketplace/CreateListingForm'

export default function SellPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login?redirect=/sell')
        return
      }

      setUser(user)

      // Get user profile to check if they're a farmer
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
      } else {
        setProfile(profileData)
      }
    } catch (error) {
      console.error('Error:', error)
      router.push('/login?redirect=/sell')
    } finally {
      setLoading(false)
    }
  }

  const handleListingSuccess = (listing: any) => {
    // Navigate to the marketplace or show success message
    router.push('/marketplace')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Check if user is a farmer (can create listings)
  const canCreateListings = profile && ['backyard_grower', 'market_gardener', 'production_farmer'].includes(profile.user_type)

  if (!canCreateListings) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Farmer Account Required
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Only registered farmers (Backyard Growers, Market Gardeners, and Production Farmers) can create listings on Hey Farmer. 
              Consumers can browse and purchase from our marketplace.
            </p>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 max-w-md mx-auto">
              <h3 className="font-semibold text-gray-900 mb-4">Want to become a farmer on Hey Farmer?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Update your account type in your profile settings to start selling produce, equipment, and resources.
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-2 px-4 rounded-lg font-medium text-white transition-colors"
                style={{ backgroundColor: '#2E7D32' }}
              >
                Go to Profile Settings
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => router.push('/marketplace')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Browse Marketplace Instead
              </button>
            </div>
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
            Sell on <span style={{ color: '#2E7D32' }}>Hey Farmer</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            List your produce, equipment, or farming resources to connect with the Texas Triangle farming community
          </p>
        </div>

        {/* Create Listing Form */}
        <CreateListingForm 
          onSuccess={handleListingSuccess}
          onCancel={() => router.push('/marketplace')}
        />
      </main>

      <Footer />
    </div>
  )
}