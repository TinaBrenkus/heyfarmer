'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Users, ShoppingBag, ArrowRight, Store } from 'lucide-react'
import Navigation from '@/components/navigation/Navigation'
import { supabase } from '@/lib/supabase'
import {
  getCountyFromSlug,
  getCountyDisplayName,
  getCountyMetro,
  getNeighboringCounties,
  getSlugFromCounty,
  isValidCountySlug
} from '@/lib/countyUtils'
import type { TexasTriangleCounty } from '@/lib/database'

interface Listing {
  id: string
  title: string
  description: string
  price?: number
  unit?: string
  post_type: string
  images?: string[]
  thumbnail_url?: string
  created_at: string
  profiles: {
    id: string
    full_name: string
    farm_name?: string
    avatar_url?: string
  }
}

interface Farmer {
  id: string
  full_name: string
  farm_name?: string
  avatar_url?: string
  user_type: string
  bio?: string
  city?: string
}

export default function CountyPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.county as string

  const [loading, setLoading] = useState(true)
  const [countyId, setCountyId] = useState<TexasTriangleCounty | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [listingCount, setListingCount] = useState(0)
  const [farmerCount, setFarmerCount] = useState(0)

  useEffect(() => {
    // Validate the slug
    if (!isValidCountySlug(slug)) {
      // Let Next.js handle 404
      router.push('/404')
      return
    }

    const county = getCountyFromSlug(slug)
    if (county) {
      setCountyId(county)
      fetchCountyData(county)
    }
  }, [slug, router])

  const fetchCountyData = async (county: TexasTriangleCounty) => {
    setLoading(true)

    try {
      // Fetch listings for this county
      const { data: listingsData, error: listingsError } = await supabase
        .from('posts')
        .select(`
          id, title, description, price, unit, post_type, images, thumbnail_url, created_at,
          profiles!posts_user_id_fkey (
            id, full_name, farm_name, avatar_url
          )
        `)
        .eq('county', county)
        .eq('status', 'active')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(8)

      if (!listingsError && listingsData) {
        setListings(listingsData as unknown as Listing[])
      }

      // Get total listing count
      const { count: totalListings } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('county', county)
        .eq('status', 'active')
        .eq('visibility', 'public')

      setListingCount(totalListings || 0)

      // Fetch farmers in this county
      const { data: farmersData, error: farmersError } = await supabase
        .from('profiles')
        .select('id, full_name, farm_name, avatar_url, user_type, bio, city')
        .eq('county', county)
        .eq('show_in_directory', true)
        .in('user_type', ['backyard_grower', 'market_gardener', 'production_farmer'])
        .limit(6)

      if (!farmersError && farmersData) {
        setFarmers(farmersData as Farmer[])
      }

      // Get total farmer count
      const { count: totalFarmers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('county', county)
        .eq('show_in_directory', true)
        .in('user_type', ['backyard_grower', 'market_gardener', 'production_farmer'])

      setFarmerCount(totalFarmers || 0)

    } catch (error) {
      console.error('Error fetching county data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUserTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'backyard_grower': 'Backyard Grower',
      'market_gardener': 'Market Gardener',
      'production_farmer': 'Production Farmer'
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading county information...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!countyId) {
    return notFound()
  }

  const countyName = getCountyDisplayName(countyId)
  const metro = getCountyMetro(countyId)
  const neighbors = getNeighboringCounties(countyId)

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <MapPin size={20} />
                <span className="text-sm font-medium">{metro}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {countyName}, Texas
              </h1>
              <p className="text-gray-600">
                Fresh local produce and farm products from your neighbors
              </p>
            </div>

            <div className="flex gap-4 mt-6 md:mt-0">
              <div className="text-center px-4 py-2 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                  <Users size={18} />
                  <span className="text-2xl font-bold">{farmerCount}</span>
                </div>
                <span className="text-sm text-gray-600">Local Farmers</span>
              </div>
              <div className="text-center px-4 py-2 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
                  <ShoppingBag size={18} />
                  <span className="text-2xl font-bold">{listingCount}</span>
                </div>
                <span className="text-sm text-gray-600">Active Listings</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <Link
              href={`/marketplace?county=${countyId}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Browse All {countyName} Listings
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* Active Listings Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Active Listings</h2>
            {listingCount > 8 && (
              <Link
                href={`/marketplace?county=${countyId}`}
                className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1"
              >
                View all {listingCount} listings
                <ArrowRight size={16} />
              </Link>
            )}
          </div>

          {listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/listing/${listing.id}`}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-[4/3] bg-gray-100 relative">
                    {listing.thumbnail_url || listing.images?.[0] ? (
                      <img
                        src={listing.thumbnail_url || listing.images?.[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Store size={32} />
                      </div>
                    )}
                    <span className="absolute top-2 left-2 px-2 py-1 bg-white/90 rounded text-xs font-medium text-gray-700 capitalize">
                      {listing.post_type}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                      {listing.title}
                    </h3>
                    {listing.price && (
                      <p className="text-green-600 font-medium">
                        ${listing.price}{listing.unit ? `/${listing.unit}` : ''}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      by {listing.profiles?.farm_name || listing.profiles?.full_name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Store size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
              <p className="text-gray-600 mb-4">
                Be the first to list your products in {countyName}!
              </p>
              <Link
                href="/sell"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Create a Listing
              </Link>
            </div>
          )}
        </div>

        {/* Local Farmers Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Local Farmers</h2>
            {farmerCount > 6 && (
              <Link
                href={`/farmers?county=${countyId}`}
                className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1"
              >
                View all {farmerCount} farmers
                <ArrowRight size={16} />
              </Link>
            )}
          </div>

          {farmers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {farmers.map((farmer) => (
                <Link
                  key={farmer.id}
                  href={`/profile/${farmer.id}`}
                  className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow flex items-start gap-4"
                >
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    {farmer.avatar_url ? (
                      <img
                        src={farmer.avatar_url}
                        alt={farmer.full_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-green-600">
                        {farmer.full_name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {farmer.farm_name || farmer.full_name}
                    </h3>
                    <p className="text-sm text-green-600">
                      {getUserTypeLabel(farmer.user_type)}
                    </p>
                    {farmer.city && (
                      <p className="text-sm text-gray-500 mt-1">{farmer.city}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No farmers listed yet</h3>
              <p className="text-gray-600 mb-4">
                Are you a farmer in {countyName}? Join our community!
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Sign Up as a Farmer
              </Link>
            </div>
          )}
        </div>

        {/* Nearby Counties Section */}
        {neighbors.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Nearby Counties</h2>
            <div className="flex flex-wrap gap-3">
              {neighbors.map((neighborId) => (
                <Link
                  key={neighborId}
                  href={`/${getSlugFromCounty(neighborId)}`}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
                >
                  {getCountyDisplayName(neighborId)}
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
