'use client'

import { useEffect, useState, useRef } from 'react'
import { MapPin } from 'lucide-react'
import type { TexasTriangleCounty } from '@/lib/database'

// County center coordinates (approximate)
const COUNTY_CENTERS: Record<TexasTriangleCounty, [number, number]> = {
  // Dallas-Fort Worth Metro
  'dallas': [32.7767, -96.7970],
  'tarrant': [32.7555, -97.3308],
  'denton': [33.2148, -97.1331],
  'collin': [33.1972, -96.6155],
  'rockwall': [32.8998, -96.4597],
  'kaufman': [32.5838, -96.2880],
  'wise': [33.2171, -97.6595],
  'parker': [32.7777, -97.8047],
  'jack': [33.2312, -98.1717],
  'grayson': [33.6266, -96.6783],
  'hunt': [33.1298, -96.0855],
  // Austin Metro
  'travis': [30.2672, -97.7431],
  'williamson': [30.6477, -97.6789],
  'hays': [30.0593, -97.9977],
  'bastrop': [30.1108, -97.3155],
  'caldwell': [29.8376, -97.6203],
  'lee': [30.3166, -96.9736],
  'burnet': [30.7584, -98.2285],
  'blanco': [30.0997, -98.4258],
  // San Antonio Metro
  'bexar': [29.4241, -98.4936],
  'comal': [29.7467, -98.0894],
  'guadalupe': [29.5673, -97.9477],
  'wilson': [29.1733, -98.0858],
  'medina': [29.3569, -99.1009],
  'kendall': [29.9461, -98.7294],
  'bandera': [29.7266, -99.2456],
  'atascosa': [28.8934, -98.5269],
  // Houston Metro
  'harris': [29.7604, -95.3698],
  'fort-bend': [29.5285, -95.7707],
  'montgomery': [30.3007, -95.4574],
  'brazoria': [29.1669, -95.4349],
  'galveston': [29.3013, -94.7977],
  'liberty': [30.0580, -94.7954],
  'chambers': [29.7091, -94.6715],
  'waller': [30.0274, -95.9910],
  'austin-county': [29.8966, -96.2815],
  // Central Corridor
  'mclennan': [31.5514, -97.1467],
  'bell': [31.0340, -97.4828],
  'brazos': [30.6280, -96.3344],
  'grimes': [30.5473, -95.9838],
  'burleson': [30.4902, -96.6211],
}

interface Listing {
  id: string
  title: string
  price?: number
  unit?: string
  post_type: string
  thumbnail_url?: string
  images?: string[]
  latitude?: number
  longitude?: number
  profiles?: {
    farm_name?: string
    full_name?: string
    city?: string
  }
}

interface CountyListingsMapProps {
  county: TexasTriangleCounty
  listings: Listing[]
}

export default function CountyListingsMap({ county, listings }: CountyListingsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const center = COUNTY_CENTERS[county] || [31.0, -97.0]

  // For listings without coordinates, scatter them around the county center
  const getListingPosition = (index: number): [number, number] => {
    const angle = (index * 137.5) * (Math.PI / 180) // Golden angle
    const radius = 0.02 + (index * 0.005) // Increasing radius
    return [
      center[0] + radius * Math.cos(angle),
      center[1] + radius * Math.sin(angle)
    ]
  }

  const getMarkerColor = (postType: string) => {
    switch (postType) {
      case 'fresh_produce': return '#22c55e'
      case 'equipment': return '#f97316'
      case 'plants_seeds': return '#8b5cf6'
      case 'livestock': return '#ef4444'
      default: return '#6b7280'
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return

    let map: any = null

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default

        // Check if map already exists
        if (mapInstance) {
          mapInstance.remove()
        }

        // Create map
        map = L.map(mapRef.current!, {
          scrollWheelZoom: false,
        }).setView(center, 10)

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map)

        // Add markers for each listing
        listings.forEach((listing, index) => {
          const position = listing.latitude && listing.longitude
            ? [listing.latitude, listing.longitude] as [number, number]
            : getListingPosition(index)

          const color = getMarkerColor(listing.post_type)

          const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="
              background-color: ${color};
              width: 28px;
              height: 28px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 2px solid white;
              box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            "></div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 28],
            popupAnchor: [0, -28]
          })

          const marker = L.marker(position, { icon }).addTo(map)

          const imageHtml = (listing.thumbnail_url || listing.images?.[0])
            ? `<img src="${listing.thumbnail_url || listing.images?.[0]}" alt="${listing.title}" style="width:100%;height:80px;object-fit:cover;border-radius:4px;margin-bottom:8px;" />`
            : ''

          const priceHtml = listing.price
            ? `<p style="color:#16a34a;font-weight:600;font-size:13px;">$${listing.price}${listing.unit ? '/' + listing.unit : ''}</p>`
            : ''

          const sellerInfo = listing.profiles?.farm_name || listing.profiles?.full_name || ''
          const cityInfo = listing.profiles?.city ? ` • ${listing.profiles.city}` : ''

          marker.bindPopup(`
            <div style="min-width:180px;max-width:220px;">
              ${imageHtml}
              <h3 style="font-weight:600;color:#111;font-size:14px;margin:0 0 4px 0;">${listing.title}</h3>
              ${priceHtml}
              <p style="font-size:11px;color:#666;margin:4px 0 0 0;">${sellerInfo}${cityInfo}</p>
              <a href="/listing/${listing.id}" style="display:inline-block;margin-top:8px;font-size:12px;color:#16a34a;font-weight:500;text-decoration:none;">View Details →</a>
            </div>
          `)
        })

        setMapInstance(map)
        setIsLoading(false)
      } catch (error) {
        console.error('Error initializing map:', error)
        setIsLoading(false)
      }
    }

    initMap()

    return () => {
      if (map) {
        map.remove()
      }
    }
  }, [county, listings.length])

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <div
        ref={mapRef}
        style={{ height: '400px', width: '100%' }}
        className="bg-gray-100"
      >
        {isLoading && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPin className="w-8 h-8 mx-auto mb-2 animate-pulse" />
              <p>Loading map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="bg-white p-3 border-t border-gray-200">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="text-gray-600 font-medium">Legend:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Fresh Produce</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>Equipment</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span>Plants & Seeds</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Livestock</span>
          </div>
        </div>
      </div>
    </div>
  )
}
