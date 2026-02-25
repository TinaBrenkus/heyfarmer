import type { DirectoryFarm } from './database'

/**
 * Generate a URL-safe slug from a farm name
 */
export function generateSlug(name: string, county?: string): string {
  let slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  if (county) {
    slug = `${slug}-${county}`
  }

  return slug
}

/**
 * Get display label for a farm type
 */
export function getFarmTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'backyard_grower': 'Backyard Grower',
    'market_gardener': 'Market Gardener',
    'production_farmer': 'Production Farmer',
    'ranch': 'Ranch',
    'orchard': 'Orchard',
    'vineyard': 'Vineyard',
    'apiary': 'Apiary',
    'nursery': 'Nursery',
    'other': 'Other'
  }
  return labels[type] || type
}

/**
 * Get farm type options for form dropdowns
 */
export function getFarmTypeOptions(): { value: string; label: string }[] {
  return [
    { value: 'backyard_grower', label: 'Backyard Grower' },
    { value: 'market_gardener', label: 'Market Gardener' },
    { value: 'production_farmer', label: 'Production Farmer' },
    { value: 'ranch', label: 'Ranch' },
    { value: 'orchard', label: 'Orchard' },
    { value: 'vineyard', label: 'Vineyard' },
    { value: 'apiary', label: 'Apiary (Bees/Honey)' },
    { value: 'nursery', label: 'Nursery' },
    { value: 'other', label: 'Other' }
  ]
}

/**
 * Get data source options for admin form
 */
export function getDataSourceOptions(): { value: string; label: string }[] {
  return [
    { value: 'usda', label: 'USDA Organic Integrity Database' },
    { value: 'tx_dept_ag', label: 'TX Dept of Agriculture / Go Texan' },
    { value: 'farmers_market', label: 'Farmers Market Vendor List' },
    { value: 'local_harvest', label: 'LocalHarvest.org' },
    { value: 'google_places', label: 'Google Maps / Places' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'county_extension', label: 'County Extension Office' },
    { value: 'personal_knowledge', label: 'Personal Knowledge' },
    { value: 'other', label: 'Other' }
  ]
}

/**
 * Get status display info
 */
export function getStatusInfo(status: string): { label: string; color: string; bgColor: string } {
  const statusMap: Record<string, { label: string; color: string; bgColor: string }> = {
    'draft': { label: 'Draft', color: 'text-gray-700', bgColor: 'bg-gray-100' },
    'published': { label: 'Published', color: 'text-green-700', bgColor: 'bg-green-100' },
    'claimed': { label: 'Claimed', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    'removed': { label: 'Removed', color: 'text-red-700', bgColor: 'bg-red-100' }
  }
  return statusMap[status] || { label: status, color: 'text-gray-700', bgColor: 'bg-gray-100' }
}

/**
 * Build JSON-LD structured data for a farm
 */
export function buildFarmJsonLd(farm: DirectoryFarm): object {
  const jsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: farm.name,
    description: farm.description || farm.tagline || `${farm.name} - local farm in ${farm.city || ''}, Texas`,
  }

  if (farm.address || farm.city) {
    jsonLd.address = {
      '@type': 'PostalAddress',
      addressLocality: farm.city,
      addressRegion: 'TX',
      postalCode: farm.zip_code,
      streetAddress: farm.address
    }
  }

  if (farm.phone) {
    jsonLd.telephone = farm.phone
  }

  if (farm.email) {
    jsonLd.email = farm.email
  }

  if (farm.website_url) {
    jsonLd.url = farm.website_url
  }

  if (farm.cover_image_url) {
    jsonLd.image = farm.cover_image_url
  }

  if (farm.products && farm.products.length > 0) {
    jsonLd.makesOffer = farm.products.map(product => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Product',
        name: product
      }
    }))
  }

  return jsonLd
}
