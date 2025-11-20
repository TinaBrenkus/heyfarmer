'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, MapPin, Calendar, Package, Truck, MessageCircle, User as UserIcon } from 'lucide-react'
import Navigation from '@/components/navigation/Navigation'
import FarmerBadge from '@/components/badges/FarmerBadge'
import Linkify from '@/components/common/Linkify'
import { supabase } from '@/lib/supabase'
import { Post } from '@/lib/database'

export default function ListingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const listingId = params.id as string

  const [loading, setLoading] = useState(true)
  const [listing, setListing] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    checkCurrentUser()
    fetchListing()
  }, [listingId])

  const checkCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const fetchListing = async () => {
    if (!listingId) return

    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            id,
            full_name,
            farm_name,
            avatar_url,
            county,
            city,
            user_type
          )
        `)
        .eq('id', listingId)
        .single()

      if (error) {
        console.error('Error fetching listing:', error)
        setError('Listing not found')
        return
      }

      setListing(data)
    } catch (error) {
      console.error('Error:', error)
      setError('Error loading listing')
    } finally {
      setLoading(false)
    }
  }

  const handleContact = async () => {
    if (!currentUser) {
      router.push('/login?redirect=' + encodeURIComponent(`/listing/${listingId}`))
      return
    }

    if (!listing?.profiles?.id) return

    router.push(`/messages?contact=${listing.profiles.id}&post=${listingId}`)
  }

  const isOwnListing = currentUser?.id === listing?.user_id
  const images = listing?.images || (listing?.thumbnail_url ? [listing.thumbnail_url] : [])

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading listing...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="text-6xl mb-4">😞</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {error || 'Listing not found'}
            </h2>
            <button
              onClick={() => router.push('/marketplace')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mt-4"
            >
              <ArrowLeft size={16} />
              Back to Marketplace
            </button>
          </div>
        </div>
      </div>
    )
  }

  const getPostTypeColor = (postType: string) => {
    switch (postType) {
      case 'produce': return '#2E7D32'
      case 'equipment': return '#1976D2'
      case 'resource': return '#FFA726'
      default: return '#2E7D32'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header with Image Gallery */}
          <div className="h-96 bg-gray-100 relative flex items-center justify-center">
            {images.length > 0 ? (
              <>
                <img
                  src={images[currentImageIndex]}
                  alt={`${listing.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Image Navigation */}
                {images.length > 1 && (
                  <>
                    {/* Previous Button */}
                    <button
                      onClick={previousImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Next Button */}
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/70 text-white rounded-full text-sm">
                      {currentImageIndex + 1} / {images.length}
                    </div>

                    {/* Thumbnail Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <Package size={64} className="text-gray-400" />
            )}

            {/* Post Type Badge */}
            <div
              className="absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: getPostTypeColor(listing.post_type) }}
            >
              {listing.post_type.charAt(0).toUpperCase() + listing.post_type.slice(1)}
            </div>

            {/* Edit Button for Own Listing */}
            {isOwnListing && (
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => router.push(`/sell/${listing.id}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Edit Listing
                </button>
              </div>
            )}
          </div>

          <div className="p-8">
            {/* Title and Price */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
              {!listing.products && listing.price && (
                <p className="text-3xl font-bold" style={{ color: getPostTypeColor(listing.post_type) }}>
                  ${listing.price}{listing.unit ? `/${listing.unit}` : ''}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                <Linkify text={listing.description} />
              </div>
            </div>

            {/* Multiple Products */}
            {listing.products && listing.products.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Available Products</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {listing.products.map((product: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        {product.price && (
                          <span className="text-lg font-bold text-green-600">
                            ${product.price}{product.unit ? `/${product.unit}` : ''}
                          </span>
                        )}
                      </div>
                      {product.quantity_available && (
                        <p className="text-sm text-gray-500 mt-1">
                          {product.quantity_available} available
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Availability */}
              {(listing.available_from || listing.available_until) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Calendar size={16} />
                    Availability
                  </h3>
                  <div className="text-gray-700 space-y-1">
                    {listing.available_from && (
                      <p>From: {new Date(listing.available_from).toLocaleDateString()}</p>
                    )}
                    {listing.available_until && (
                      <p>Until: {new Date(listing.available_until).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Quantity */}
              {!listing.products && listing.quantity_available && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Package size={16} />
                    Quantity
                  </h3>
                  <p className="text-gray-700">{listing.quantity_available} available</p>
                </div>
              )}

              {/* Delivery Options */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Truck size={16} />
                  Delivery Options
                </h3>
                <div className="text-gray-700 space-y-1">
                  {listing.pickup_available && <p>✓ Pickup available</p>}
                  {listing.delivery_available && (
                    <p>✓ Delivery available{listing.delivery_radius_miles && ` (${listing.delivery_radius_miles} miles)`}</p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <MapPin size={16} />
                  Location
                </h3>
                <p className="text-gray-700">
                  {listing.city && `${listing.city}, `}
                  {listing.county.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} County, Texas
                </p>
              </div>
            </div>

            {/* Tags */}
            {listing.tags && listing.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {listing.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Seller Info */}
            {listing.profiles && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Seller</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    {listing.profiles.avatar_url ? (
                      <img
                        src={listing.profiles.avatar_url}
                        alt={listing.profiles.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon size={32} className="text-gray-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">
                        {listing.profiles.farm_name || listing.profiles.full_name}
                      </h4>
                      <FarmerBadge
                        userType={listing.profiles.user_type}
                        verified={false}
                        size="sm"
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      {listing.profiles.city && `${listing.profiles.city}, `}
                      {listing.profiles.county.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} County
                    </p>
                  </div>
                </div>

                {!isOwnListing && (
                  <div className="flex gap-3">
                    <button
                      onClick={handleContact}
                      className="flex-1 py-3 px-6 rounded-lg font-medium text-white transition-colors flex items-center justify-center gap-2"
                      style={{ backgroundColor: getPostTypeColor(listing.post_type) }}
                    >
                      <MessageCircle size={18} />
                      Contact Seller
                    </button>
                    <button
                      onClick={() => router.push(`/profile/${listing.profiles.id}`)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      View Profile
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
