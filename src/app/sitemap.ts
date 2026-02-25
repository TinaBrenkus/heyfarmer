import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const BASE_URL = 'https://heyfarmer.farm'

// All county slugs
const COUNTY_SLUGS = [
  'dallas-county', 'tarrant-county', 'denton-county', 'collin-county', 'rockwall-county',
  'kaufman-county', 'wise-county', 'parker-county', 'jack-county', 'grayson-county', 'hunt-county',
  'travis-county', 'williamson-county', 'hays-county', 'bastrop-county', 'caldwell-county',
  'lee-county', 'burnet-county', 'blanco-county',
  'bexar-county', 'comal-county', 'guadalupe-county', 'wilson-county', 'medina-county',
  'kendall-county', 'bandera-county', 'atascosa-county',
  'harris-county', 'fort-bend-county', 'montgomery-county', 'brazoria-county', 'galveston-county',
  'liberty-county', 'chambers-county', 'waller-county', 'austin-county-county',
  'mclennan-county', 'bell-county', 'brazos-county', 'grimes-county', 'burleson-county',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // Fetch published/claimed directory farms
  const { data: farms } = await supabase
    .from('directory_farms')
    .select('slug, updated_at, status, claimed_by')
    .in('status', ['published', 'claimed'])

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/directory`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/farmers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/marketplace`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/welcome`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/how-it-works`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/signup`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ]

  // County pages
  const countyPages: MetadataRoute.Sitemap = COUNTY_SLUGS.map(slug => ({
    url: `${BASE_URL}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Farm directory pages
  const farmPages: MetadataRoute.Sitemap = (farms || []).map(farm => ({
    url: `${BASE_URL}/farm/${farm.slug}`,
    lastModified: new Date(farm.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...countyPages, ...farmPages]
}
