'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, MapPin, User, Calendar, Package, DollarSign, Truck, MessageCircle, Edit } from 'lucide-react'
import { Post, UserType } from '@/lib/database'
import FarmLogo from '@/components/icons/FarmLogo'
import FarmerBadge from '@/components/badges/FarmerBadge'
import Linkify from '@/components/common/Linkify'

interface ListingCardProps {
  listing: Post & {
    profiles?: {
      id: string
      full_name: string
      farm_name?: string
      avatar_url?: string
      county: string
      city?: string
      user_type: UserType
      verified?: boolean
    }
  }
  onSave?: () => void
  onContact?: () => void
  showActions?: boolean
  currentUserId?: string
}

export default function ListingCard({
  listing,
  onSave,
  onContact,
  showActions = true,
  currentUserId
}: ListingCardProps) {
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = () => {
    setIsSaved(!isSaved)
    onSave?.()
  }

  const isOwnListing = currentUserId && listing.user_id === currentUserId

  const formatPrice = (price?: number, unit?: string) => {
    if (!price) return 'Price on request'
    return `$${price}${unit ? `/${unit}` : ''}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getPostTypeIcon = (postType: string) => {
    switch (postType) {
      case 'produce': return Package
      case 'equipment': return Truck
      default: return Package
    }
  }

  const getPostTypeColor = (postType: string) => {
    switch (postType) {
      case 'produce': return '#2E7D32'
      case 'equipment': return '#1976D2'
      case 'resource': return '#FFA726'
      default: return '#2E7D32'
    }
  }

  const PostTypeIcon = getPostTypeIcon(listing.post_type)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image placeholder */}
      <div
        className="h-48 bg-gray-100 relative cursor-pointer"
        onClick={() => router.push(`/listing/${listing.id}`)}
      >
        {listing.thumbnail_url ? (
          <img 
            src={listing.thumbnail_url} 
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PostTypeIcon 
              size={48} 
              className="text-gray-400"
            />
          </div>
        )}
        
        {/* Post type badge */}
        <div 
          className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium text-white"
          style={{ backgroundColor: getPostTypeColor(listing.post_type) }}
        >
          {listing.post_type.charAt(0).toUpperCase() + listing.post_type.slice(1)}
        </div>

        {/* Save button */}
        {showActions && (
          <button
            onClick={handleSave}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
          >
            <Heart 
              size={16} 
              className={`${isSaved ? 'text-red-500 fill-current' : 'text-gray-600'}`}
            />
          </button>
        )}
      </div>

      <div className="p-4">
        {/* Title and Price */}
        <div
          className="flex justify-between items-start mb-2 cursor-pointer"
          onClick={() => router.push(`/listing/${listing.id}`)}
        >
          <h3 className="font-semibold text-gray-900 flex-1 mr-2 hover:text-green-600 transition-colors">{listing.title}</h3>
          {!listing.products && (
            <div className="text-right">
              <p className="font-bold text-lg" style={{ color: getPostTypeColor(listing.post_type) }}>
                {formatPrice(listing.price, listing.unit)}
              </p>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="text-gray-600 text-sm mb-3 line-clamp-2">
          <Linkify text={listing.description} />
        </div>

        {/* Multiple Products List */}
        {listing.products && listing.products.length > 0 && (
          <div className="mb-3 space-y-2">
            <p className="text-xs font-medium text-gray-700 uppercase">Available Products:</p>
            <div className="space-y-1">
              {listing.products.slice(0, 3).map((product, index) => (
                <div key={index} className="flex items-center justify-between text-sm bg-gray-50 rounded px-2 py-1">
                  <span className="font-medium text-gray-900">{product.name}</span>
                  {product.price && (
                    <span className="text-green-600 font-semibold">
                      ${product.price}{product.unit ? `/${product.unit}` : ''}
                    </span>
                  )}
                </div>
              ))}
              {listing.products.length > 3 && (
                <p className="text-xs text-gray-500 italic">+{listing.products.length - 3} more</p>
              )}
            </div>
          </div>
        )}

        {/* Quantity and availability */}
        {!listing.products && listing.quantity_available && (
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
            <Package size={14} />
            <span>{listing.quantity_available} available</span>
            {listing.available_until && (
              <>
                <span className="mx-2">•</span>
                <Calendar size={14} />
                <span>Until {formatDate(listing.available_until)}</span>
              </>
            )}
          </div>
        )}

        {/* Seller info */}
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
          {listing.profiles ? (
            <Link href={`/profile/${listing.profiles.id}`} className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                {listing.profiles.avatar_url ? (
                  <img 
                    src={listing.profiles.avatar_url} 
                    alt={listing.profiles.full_name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <FarmLogo size={16} className="text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate hover:text-green-600 transition-colors">
                    {listing.profiles.farm_name || listing.profiles.full_name}
                  </p>
                  <FarmerBadge
                    userType={listing.profiles.user_type}
                    verified={false}
                    size="sm"
                    showLabel={false}
                  />
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin size={12} />
                  <span>
                    {listing.city && `${listing.city}, `}
                    {listing.county.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} County
                  </span>
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <FarmLogo size={16} className="text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500 truncate">
                  Unknown Farmer
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin size={12} />
                  <span>
                    {listing.city && `${listing.city}, `}
                    {listing.county.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} County
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delivery options */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          {listing.pickup_available && (
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              Pickup
            </span>
          )}
          {listing.delivery_available && (
            <span className="flex items-center gap-1">
              <Truck size={12} />
              Delivery
              {listing.delivery_radius_miles && ` (${listing.delivery_radius_miles}mi)`}
            </span>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            {isOwnListing ? (
              <button
                onClick={() => router.push(`/sell/${listing.id}`)}
                className="flex-1 py-2 px-3 rounded-lg font-medium text-white transition-colors flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Edit size={14} />
                Edit Listing
              </button>
            ) : (
              <button
                onClick={onContact}
                className="flex-1 py-2 px-3 rounded-lg font-medium text-white transition-colors flex items-center justify-center gap-2"
                style={{ backgroundColor: getPostTypeColor(listing.post_type) }}
              >
                <MessageCircle size={14} />
                Contact
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}