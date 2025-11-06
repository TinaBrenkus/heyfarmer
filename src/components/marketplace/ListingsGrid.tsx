'use client'

import { useState } from 'react'
import { Grid, List, Search } from 'lucide-react'
import { Post } from '@/lib/database'
import ListingCard from './ListingCard'

interface ListingsGridProps {
  listings: (Post & {
    profiles?: {
      id: string
      full_name: string
      farm_name?: string
      avatar_url?: string
      county: string
      city?: string
      user_type: string
    }
  })[]
  loading?: boolean
  onContact?: (listing: Post) => void
  onSave?: (listing: Post) => void
}

export default function ListingsGrid({
  listings,
  loading = false,
  onContact,
  onSave
}: ListingsGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-80 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* View Mode Toggle and Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          {listings.length} {listings.length === 1 ? 'listing' : 'listings'} found
        </p>
        
        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-green-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            title="Grid view"
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-green-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            title="List view"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Listings Grid/List */}
      {listings.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Search size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
          <p className="text-gray-600">Try adjusting your search or filters above</p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onContact={() => onContact?.(listing)}
              onSave={() => onSave?.(listing)}
            />
          ))}
        </div>
      )}
    </div>
  )
}