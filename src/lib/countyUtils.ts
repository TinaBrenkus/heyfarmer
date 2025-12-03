import { TexasTriangleCounty } from './database'

interface CountyInfo {
  displayName: string
  metro: string
  neighbors: TexasTriangleCounty[]
  seat: string
}

// Complete county data for all 39 Texas Triangle counties
export const COUNTY_DATA: Record<TexasTriangleCounty, CountyInfo> = {
  // Dallas-Fort Worth Metro
  'dallas': {
    displayName: 'Dallas County',
    metro: 'Dallas-Fort Worth',
    neighbors: ['tarrant', 'denton', 'collin', 'rockwall', 'kaufman'],
    seat: 'Dallas'
  },
  'tarrant': {
    displayName: 'Tarrant County',
    metro: 'Dallas-Fort Worth',
    neighbors: ['dallas', 'denton', 'wise', 'parker'],
    seat: 'Fort Worth'
  },
  'denton': {
    displayName: 'Denton County',
    metro: 'Dallas-Fort Worth',
    neighbors: ['dallas', 'tarrant', 'collin', 'wise', 'grayson'],
    seat: 'Denton'
  },
  'collin': {
    displayName: 'Collin County',
    metro: 'Dallas-Fort Worth',
    neighbors: ['dallas', 'denton', 'rockwall', 'hunt', 'grayson'],
    seat: 'McKinney'
  },
  'rockwall': {
    displayName: 'Rockwall County',
    metro: 'Dallas-Fort Worth',
    neighbors: ['dallas', 'collin', 'kaufman', 'hunt'],
    seat: 'Rockwall'
  },
  'kaufman': {
    displayName: 'Kaufman County',
    metro: 'Dallas-Fort Worth',
    neighbors: ['dallas', 'rockwall', 'hunt'],
    seat: 'Kaufman'
  },
  'wise': {
    displayName: 'Wise County',
    metro: 'Dallas-Fort Worth',
    neighbors: ['denton', 'tarrant', 'parker', 'jack'],
    seat: 'Decatur'
  },
  'parker': {
    displayName: 'Parker County',
    metro: 'Dallas-Fort Worth',
    neighbors: ['tarrant', 'wise', 'jack'],
    seat: 'Weatherford'
  },
  'jack': {
    displayName: 'Jack County',
    metro: 'Dallas-Fort Worth',
    neighbors: ['wise', 'parker'],
    seat: 'Jacksboro'
  },
  'grayson': {
    displayName: 'Grayson County',
    metro: 'Dallas-Fort Worth',
    neighbors: ['denton', 'collin'],
    seat: 'Sherman'
  },
  'hunt': {
    displayName: 'Hunt County',
    metro: 'Dallas-Fort Worth',
    neighbors: ['collin', 'rockwall', 'kaufman'],
    seat: 'Greenville'
  },

  // Austin Metro
  'travis': {
    displayName: 'Travis County',
    metro: 'Austin',
    neighbors: ['williamson', 'hays', 'bastrop', 'burnet', 'blanco'],
    seat: 'Austin'
  },
  'williamson': {
    displayName: 'Williamson County',
    metro: 'Austin',
    neighbors: ['travis', 'bell', 'burnet', 'lee'],
    seat: 'Georgetown'
  },
  'hays': {
    displayName: 'Hays County',
    metro: 'Austin',
    neighbors: ['travis', 'blanco', 'comal', 'caldwell'],
    seat: 'San Marcos'
  },
  'bastrop': {
    displayName: 'Bastrop County',
    metro: 'Austin',
    neighbors: ['travis', 'lee', 'caldwell'],
    seat: 'Bastrop'
  },
  'caldwell': {
    displayName: 'Caldwell County',
    metro: 'Austin',
    neighbors: ['hays', 'bastrop', 'guadalupe'],
    seat: 'Lockhart'
  },
  'lee': {
    displayName: 'Lee County',
    metro: 'Austin',
    neighbors: ['williamson', 'bastrop', 'burleson'],
    seat: 'Giddings'
  },
  'burnet': {
    displayName: 'Burnet County',
    metro: 'Austin',
    neighbors: ['travis', 'williamson', 'blanco', 'bell'],
    seat: 'Burnet'
  },
  'blanco': {
    displayName: 'Blanco County',
    metro: 'Austin',
    neighbors: ['travis', 'hays', 'burnet', 'kendall', 'comal'],
    seat: 'Johnson City'
  },

  // San Antonio Metro
  'bexar': {
    displayName: 'Bexar County',
    metro: 'San Antonio',
    neighbors: ['comal', 'guadalupe', 'wilson', 'medina', 'kendall', 'bandera', 'atascosa'],
    seat: 'San Antonio'
  },
  'comal': {
    displayName: 'Comal County',
    metro: 'San Antonio',
    neighbors: ['bexar', 'hays', 'guadalupe', 'kendall', 'blanco'],
    seat: 'New Braunfels'
  },
  'guadalupe': {
    displayName: 'Guadalupe County',
    metro: 'San Antonio',
    neighbors: ['bexar', 'comal', 'caldwell', 'wilson'],
    seat: 'Seguin'
  },
  'wilson': {
    displayName: 'Wilson County',
    metro: 'San Antonio',
    neighbors: ['bexar', 'guadalupe', 'atascosa'],
    seat: 'Floresville'
  },
  'medina': {
    displayName: 'Medina County',
    metro: 'San Antonio',
    neighbors: ['bexar', 'bandera', 'atascosa'],
    seat: 'Hondo'
  },
  'kendall': {
    displayName: 'Kendall County',
    metro: 'San Antonio',
    neighbors: ['bexar', 'comal', 'blanco', 'bandera'],
    seat: 'Boerne'
  },
  'bandera': {
    displayName: 'Bandera County',
    metro: 'San Antonio',
    neighbors: ['bexar', 'medina', 'kendall'],
    seat: 'Bandera'
  },
  'atascosa': {
    displayName: 'Atascosa County',
    metro: 'San Antonio',
    neighbors: ['bexar', 'wilson', 'medina'],
    seat: 'Jourdanton'
  },

  // Houston Metro
  'harris': {
    displayName: 'Harris County',
    metro: 'Houston',
    neighbors: ['montgomery', 'liberty', 'chambers', 'galveston', 'brazoria', 'fort-bend', 'waller'],
    seat: 'Houston'
  },
  'fort-bend': {
    displayName: 'Fort Bend County',
    metro: 'Houston',
    neighbors: ['harris', 'waller', 'austin-county', 'brazoria'],
    seat: 'Richmond'
  },
  'montgomery': {
    displayName: 'Montgomery County',
    metro: 'Houston',
    neighbors: ['harris', 'liberty', 'waller', 'grimes'],
    seat: 'Conroe'
  },
  'brazoria': {
    displayName: 'Brazoria County',
    metro: 'Houston',
    neighbors: ['harris', 'fort-bend', 'galveston'],
    seat: 'Angleton'
  },
  'galveston': {
    displayName: 'Galveston County',
    metro: 'Houston',
    neighbors: ['harris', 'brazoria', 'chambers'],
    seat: 'Galveston'
  },
  'liberty': {
    displayName: 'Liberty County',
    metro: 'Houston',
    neighbors: ['harris', 'montgomery', 'chambers'],
    seat: 'Liberty'
  },
  'chambers': {
    displayName: 'Chambers County',
    metro: 'Houston',
    neighbors: ['harris', 'liberty', 'galveston'],
    seat: 'Anahuac'
  },
  'waller': {
    displayName: 'Waller County',
    metro: 'Houston',
    neighbors: ['harris', 'montgomery', 'fort-bend', 'austin-county', 'grimes'],
    seat: 'Hempstead'
  },
  'austin-county': {
    displayName: 'Austin County',
    metro: 'Houston',
    neighbors: ['fort-bend', 'waller', 'burleson', 'grimes'],
    seat: 'Bellville'
  },

  // Central Corridor
  'mclennan': {
    displayName: 'McLennan County',
    metro: 'Central Corridor',
    neighbors: ['bell'],
    seat: 'Waco'
  },
  'bell': {
    displayName: 'Bell County',
    metro: 'Central Corridor',
    neighbors: ['mclennan', 'williamson', 'burnet'],
    seat: 'Belton'
  },
  'brazos': {
    displayName: 'Brazos County',
    metro: 'Central Corridor',
    neighbors: ['grimes', 'burleson'],
    seat: 'Bryan'
  },
  'grimes': {
    displayName: 'Grimes County',
    metro: 'Central Corridor',
    neighbors: ['brazos', 'montgomery', 'waller', 'austin-county', 'burleson'],
    seat: 'Anderson'
  },
  'burleson': {
    displayName: 'Burleson County',
    metro: 'Central Corridor',
    neighbors: ['brazos', 'lee', 'austin-county', 'grimes'],
    seat: 'Caldwell'
  }
}

// Get all valid county IDs
export const ALL_COUNTY_IDS = Object.keys(COUNTY_DATA) as TexasTriangleCounty[]

/**
 * Convert a URL slug (e.g., "wise-county") to a database county ID (e.g., "wise")
 */
export function getCountyFromSlug(slug: string): TexasTriangleCounty | null {
  // Remove "-county" suffix if present
  const countyId = slug.replace(/-county$/, '') as TexasTriangleCounty

  if (COUNTY_DATA[countyId]) {
    return countyId
  }

  return null
}

/**
 * Convert a database county ID to a URL slug
 */
export function getSlugFromCounty(county: TexasTriangleCounty): string {
  return `${county}-county`
}

/**
 * Get the display name for a county (e.g., "Wise County")
 */
export function getCountyDisplayName(county: TexasTriangleCounty): string {
  return COUNTY_DATA[county]?.displayName ||
    county.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) + ' County'
}

/**
 * Get the metro area for a county
 */
export function getCountyMetro(county: TexasTriangleCounty): string {
  return COUNTY_DATA[county]?.metro || 'Texas Triangle'
}

/**
 * Get neighboring counties for a given county
 */
export function getNeighboringCounties(county: TexasTriangleCounty): TexasTriangleCounty[] {
  return COUNTY_DATA[county]?.neighbors || []
}

/**
 * Get the county seat (main city) for a county
 */
export function getCountySeat(county: TexasTriangleCounty): string {
  return COUNTY_DATA[county]?.seat || ''
}

/**
 * Check if a URL slug is a valid county slug
 */
export function isValidCountySlug(slug: string): boolean {
  return getCountyFromSlug(slug) !== null
}

/**
 * Get all county info
 */
export function getCountyInfo(county: TexasTriangleCounty): CountyInfo | null {
  return COUNTY_DATA[county] || null
}

/**
 * Get counties grouped by metro area
 */
export function getCountiesByMetro(): Record<string, TexasTriangleCounty[]> {
  const grouped: Record<string, TexasTriangleCounty[]> = {}

  for (const [countyId, info] of Object.entries(COUNTY_DATA)) {
    if (!grouped[info.metro]) {
      grouped[info.metro] = []
    }
    grouped[info.metro].push(countyId as TexasTriangleCounty)
  }

  return grouped
}
