'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, MapPin, ArrowRight, Heart, Loader2 } from 'lucide-react'
import Navigation from '@/components/navigation/Navigation'
import FarmLogo from '@/components/icons/FarmLogo'
import { supabase } from '@/lib/supabase'
import { db, DirectoryFarm } from '@/lib/database'
import { getFarmTypeLabel } from '@/lib/directoryUtils'
import { COUNTY_DATA } from '@/lib/countyUtils'

export default function ClaimFarmPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [farm, setFarm] = useState<DirectoryFarm | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [slug])

  const fetchData = async () => {
    try {
      // Fetch farm
      const farmData = await db.directoryFarms.get(slug)

      // If already claimed, redirect to profile
      if (farmData.status === 'claimed' && farmData.claimed_by) {
        router.push(`/profile/${farmData.claimed_by}`)
        return
      }

      setFarm(farmData)

      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Check if user already submitted a claim
      if (user) {
        const { data: existingClaim } = await supabase
          .from('directory_claim_requests')
          .select('id, status')
          .eq('directory_farm_id', farmData.id)
          .eq('user_id', user.id)
          .maybeSingle()

        if (existingClaim) {
          setSubmitted(true)
        }
      }
    } catch {
      router.push('/directory')
    } finally {
      setLoading(false)
    }
  }

  const handleClaim = async () => {
    if (!user || !farm) return

    setSubmitting(true)
    setError(null)

    try {
      await db.directoryFarms.submitClaimRequest(farm.id, message || undefined)
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!farm) return null

  const countyName = COUNTY_DATA[farm.county]?.displayName || farm.county

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-xl mx-auto px-4 py-16">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="p-4 bg-green-100 rounded-full inline-block mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Claim Request Submitted!
            </h1>
            <p className="text-gray-600 mb-6">
              We&apos;ve received your request to claim <span className="font-medium">{farm.name}</span>.
              We&apos;ll review it shortly and let you know when it&apos;s approved.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/farm/${farm.slug}`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                View Farm Page
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0" style={{ background: 'linear-gradient(to bottom right, #E8F5E8, #F8F9FA, #E8F5E8)' }}>
      <Navigation />

      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Farm Preview Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          {farm.cover_image_url && (
            <div className="aspect-[3/1] bg-gray-100">
              <img
                src={farm.cover_image_url}
                alt={farm.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">{farm.name}</h2>
            {farm.tagline && (
              <p className="text-gray-600 mb-2">{farm.tagline}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin size={14} />
              <span>{farm.city ? `${farm.city}, ` : ''}{countyName}, TX</span>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                {getFarmTypeLabel(farm.farm_type)}
              </span>
            </div>
          </div>
        </div>

        {/* Claim Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-full">
              <Heart className="h-5 w-5 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Claim Your Farm
            </h1>
          </div>

          <p className="text-gray-600 mb-6">
            We featured <span className="font-medium text-green-700">{farm.name}</span> in
            our directory because we think you&apos;re doing great work. Claiming your listing lets
            you manage your page, update your information, and connect with local buyers.
          </p>

          {!user ? (
            // Not logged in
            <div className="space-y-4">
              <p className="text-sm text-gray-500 mb-4">
                Sign up or log in to claim this farm listing.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/signup?claim=${slug}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Sign Up to Claim
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href={`/login?redirect=${encodeURIComponent(`/claim/${slug}`)}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Log In to Claim
                </Link>
              </div>
            </div>
          ) : (
            // Logged in - show claim form
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y"
                  placeholder="Tell us how you're connected to this farm..."
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                onClick={handleClaim}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Claim This Farm
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center">
                Your claim will be reviewed by our team. We&apos;ll notify you once it&apos;s approved.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
