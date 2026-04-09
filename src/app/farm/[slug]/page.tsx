'use client'

import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import {
  MapPin, Globe, Phone, Mail, ExternalLink,
  ChevronLeft, Eye
} from 'lucide-react'
import Navigation from '@/components/navigation/Navigation'
import ClaimCTA from '@/components/directory/ClaimCTA'
import { supabase } from '@/lib/supabase'
import { DirectoryFarm } from '@/lib/database'
import { db } from '@/lib/database'
import { getFarmTypeLabel, buildFarmJsonLd } from '@/lib/directoryUtils'
import { COUNTY_DATA, getSlugFromCounty } from '@/lib/countyUtils'

export default function FarmPage() {
  const params = useParams()
  const slug = params.slug as string

  const [farm, setFarm] = useState<DirectoryFarm | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFoundState, setNotFoundState] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchFarm()
    checkUser()
  }, [slug])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchFarm = async () => {
    try {
      const data = await db.directoryFarms.get(slug)
      if (!data || (data.status !== 'published' && data.status !== 'claimed')) {
        setNotFoundState(true)
        return
      }
      setFarm(data)

      // Increment view count (fire and forget)
      db.directoryFarms.incrementViewCount(data.id).catch(() => {})
    } catch {
      setNotFoundState(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-soil-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-farm-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-soil-500">Loading farm...</p>
          </div>
        </div>
      </div>
    )
  }

  if (notFoundState || !farm) {
    return notFound()
  }

  const countyName = COUNTY_DATA[farm.county]?.displayName || farm.county
  const countySlug = getSlugFromCounty(farm.county)
  const jsonLd = buildFarmJsonLd(farm)

  return (
    <div className="min-h-screen bg-soil-50 pb-20 md:pb-0">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-soil-400 mb-6">
          <Link href="/directory" className="hover:text-farm-green-800 transition-colors">
            Farm Directory
          </Link>
          <span>/</span>
          <Link href={`/${countySlug}`} className="hover:text-farm-green-800 transition-colors">
            {countyName}
          </Link>
          <span>/</span>
          <span className="text-soil-800">{farm.name}</span>
        </div>

        {/* Hero / Cover Image */}
        {farm.cover_image_url && (
          <div className="aspect-[21/9] rounded-xl overflow-hidden mb-6">
            <img
              src={farm.cover_image_url}
              alt={farm.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Farm Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-soil-800">{farm.name}</h1>
                <span className="px-3 py-1 bg-farm-green-100 text-farm-green-800 rounded-full text-sm font-medium">
                  {getFarmTypeLabel(farm.farm_type)}
                </span>
              </div>

              {farm.tagline && (
                <p className="text-lg text-soil-500 mb-3">{farm.tagline}</p>
              )}

              <div className="flex items-center gap-1 text-soil-400">
                <MapPin size={16} />
                <Link
                  href={`/${countySlug}`}
                  className="hover:text-farm-green-800 transition-colors"
                >
                  {farm.city ? `${farm.city}, ` : ''}{countyName}, Texas
                </Link>
              </div>
            </div>

            {/* Claimed banner */}
            {farm.status === 'claimed' && farm.claimed_by && (
              <Link
                href={`/profile/${farm.claimed_by}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-terra-50 text-terra-700 rounded-lg text-sm font-medium hover:bg-terra-100 transition-colors"
              >
                <Eye size={16} />
                View Full Profile
              </Link>
            )}
          </div>
        </div>

        {/* The Story */}
        {farm.description && (
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-6">
            <h2 className="text-xl font-semibold text-soil-800 mb-4">About {farm.name}</h2>
            <div className="prose prose-green max-w-none text-soil-700 whitespace-pre-wrap">
              {farm.description}
            </div>
          </div>
        )}

        {/* Products */}
        {farm.products.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-6">
            <h2 className="text-xl font-semibold text-soil-800 mb-4">What They Grow</h2>
            <div className="flex flex-wrap gap-2">
              {farm.products.map((product, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-farm-green-100 text-farm-green-900 rounded-full font-medium"
                >
                  {product}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Specialties */}
        {farm.specialties.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-6">
            <h2 className="text-xl font-semibold text-soil-800 mb-4">Specialties</h2>
            <div className="flex flex-wrap gap-2">
              {farm.specialties.map((specialty, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-terra-100 text-terra-800 rounded-full font-medium"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Contact Info */}
        {(farm.website_url || farm.facebook_url || farm.instagram_url || farm.phone || farm.email) && (
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-6">
            <h2 className="text-xl font-semibold text-soil-800 mb-4">Contact</h2>
            <div className="space-y-3">
              {farm.website_url && (
                <a
                  href={farm.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-soil-700 hover:text-farm-green-800 transition-colors"
                >
                  <Globe size={18} className="text-soil-400" />
                  <span>{farm.website_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                  <ExternalLink size={14} className="text-soil-400" />
                </a>
              )}
              {farm.phone && (
                <a
                  href={`tel:${farm.phone}`}
                  className="flex items-center gap-3 text-soil-700 hover:text-farm-green-800 transition-colors"
                >
                  <Phone size={18} className="text-soil-400" />
                  <span>{farm.phone}</span>
                </a>
              )}
              {farm.email && (
                <a
                  href={`mailto:${farm.email}`}
                  className="flex items-center gap-3 text-soil-700 hover:text-farm-green-800 transition-colors"
                >
                  <Mail size={18} className="text-soil-400" />
                  <span>{farm.email}</span>
                </a>
              )}
              {farm.facebook_url && (
                <a
                  href={farm.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-soil-700 hover:text-terra-600 transition-colors"
                >
                  <svg className="w-[18px] h-[18px] text-soil-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  <span>Facebook</span>
                  <ExternalLink size={14} className="text-soil-400" />
                </a>
              )}
              {farm.instagram_url && (
                <a
                  href={farm.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-soil-700 hover:text-pink-600 transition-colors"
                >
                  <svg className="w-[18px] h-[18px] text-soil-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  <span>Instagram</span>
                  <ExternalLink size={14} className="text-soil-400" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Image Gallery */}
        {farm.additional_images.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-6">
            <h2 className="text-xl font-semibold text-soil-800 mb-4">Photos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {farm.additional_images.map((image, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`${farm.name} photo ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Claim CTA - only for unclaimed farms */}
        {farm.status === 'published' && (
          <div className="mb-6">
            <ClaimCTA farmName={farm.name} farmSlug={farm.slug} />
          </div>
        )}

        {/* Claimed banner */}
        {farm.status === 'claimed' && farm.claimed_by && (
          <div className="bg-terra-50 border border-terra-200 rounded-xl p-6 mb-6 text-center">
            <p className="text-terra-700 font-medium mb-2">
              This farm has been claimed by its owner
            </p>
            <Link
              href={`/profile/${farm.claimed_by}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-terra-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              View Full Profile
            </Link>
          </div>
        )}

        {/* Back to directory */}
        <div className="text-center">
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 text-soil-400 hover:text-farm-green-800 transition-colors text-sm"
          >
            <ChevronLeft size={16} />
            Back to Farm Directory
          </Link>
        </div>
      </main>
    </div>
  )
}
