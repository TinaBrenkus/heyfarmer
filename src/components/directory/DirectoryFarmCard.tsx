'use client'

import Link from 'next/link'
import { MapPin, Store } from 'lucide-react'
import { DirectoryFarm } from '@/lib/database'
import { getFarmTypeLabel } from '@/lib/directoryUtils'
import { COUNTY_DATA } from '@/lib/countyUtils'

interface DirectoryFarmCardProps {
  farm: DirectoryFarm
  variant?: 'grid' | 'list'
}

export default function DirectoryFarmCard({ farm, variant = 'grid' }: DirectoryFarmCardProps) {
  const href = farm.status === 'claimed' && farm.claimed_by
    ? `/profile/${farm.claimed_by}`
    : `/farm/${farm.slug}`

  const countyName = COUNTY_DATA[farm.county]?.displayName || farm.county

  if (variant === 'list') {
    return (
      <Link
        href={href}
        className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {farm.cover_image_url ? (
              <img
                src={farm.cover_image_url}
                alt={farm.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Store size={24} className="text-gray-400" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">{farm.name}</h3>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium flex-shrink-0">
                {getFarmTypeLabel(farm.farm_type)}
              </span>
            </div>
            {farm.tagline && (
              <p className="text-sm text-gray-600 mb-1 truncate">{farm.tagline}</p>
            )}
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin size={12} />
              <span>{farm.city ? `${farm.city}, ` : ''}{countyName}, TX</span>
            </div>
            {farm.products.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {farm.products.slice(0, 4).map((p, i) => (
                  <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                    {p}
                  </span>
                ))}
                {farm.products.length > 4 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                    +{farm.products.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    )
  }

  // Grid variant
  return (
    <Link
      href={href}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-[4/3] bg-gray-100 relative">
        {farm.cover_image_url ? (
          <img
            src={farm.cover_image_url}
            alt={farm.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Store size={32} className="text-gray-400" />
          </div>
        )}
        <span className="absolute top-2 left-2 px-2 py-1 bg-white/90 rounded text-xs font-medium text-gray-700">
          {getFarmTypeLabel(farm.farm_type)}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{farm.name}</h3>
        {farm.tagline && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-1">{farm.tagline}</p>
        )}
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
          <MapPin size={12} />
          <span>{farm.city ? `${farm.city}, ` : ''}{countyName}</span>
        </div>
        {farm.products.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {farm.products.slice(0, 3).map((product, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs"
              >
                {product}
              </span>
            ))}
            {farm.products.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                +{farm.products.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
