/**
 * Texas city-to-county lookup for auto-detecting county from city name.
 * Covers the Texas Triangle + edge counties.
 * Add more cities as needed — this grows over time.
 */

// Extended county info for counties outside the original Texas Triangle
export interface ExtendedCountyInfo {
  displayName: string
  metro: string
  seat: string
}

// Additional counties beyond the original 39
export const EXTENDED_COUNTIES: Record<string, ExtendedCountyInfo> = {
  'limestone': { displayName: 'Limestone County', metro: 'Central Texas', seat: 'Groesbeck' },
  'navarro': { displayName: 'Navarro County', metro: 'Central Texas', seat: 'Corsicana' },
  'freestone': { displayName: 'Freestone County', metro: 'Central Texas', seat: 'Fairfield' },
  'falls': { displayName: 'Falls County', metro: 'Central Texas', seat: 'Marlin' },
  'robertson': { displayName: 'Robertson County', metro: 'Central Texas', seat: 'Franklin' },
  'milam': { displayName: 'Milam County', metro: 'Central Texas', seat: 'Cameron' },
  'leon': { displayName: 'Leon County', metro: 'Central Texas', seat: 'Centerville' },
  'madison': { displayName: 'Madison County', metro: 'Central Texas', seat: 'Madisonville' },
  'walker': { displayName: 'Walker County', metro: 'Houston Metro', seat: 'Huntsville' },
  'san-jacinto': { displayName: 'San Jacinto County', metro: 'Houston Metro', seat: 'Coldspring' },
  'polk': { displayName: 'Polk County', metro: 'East Texas', seat: 'Livingston' },
  'ellis': { displayName: 'Ellis County', metro: 'Dallas-Fort Worth', seat: 'Waxahachie' },
  'johnson': { displayName: 'Johnson County', metro: 'Dallas-Fort Worth', seat: 'Cleburne' },
  'hood': { displayName: 'Hood County', metro: 'Dallas-Fort Worth', seat: 'Granbury' },
  'somervell': { displayName: 'Somervell County', metro: 'Dallas-Fort Worth', seat: 'Glen Rose' },
  'erath': { displayName: 'Erath County', metro: 'Central Texas', seat: 'Stephenville' },
  'bosque': { displayName: 'Bosque County', metro: 'Central Texas', seat: 'Meridian' },
  'hill': { displayName: 'Hill County', metro: 'Central Texas', seat: 'Hillsboro' },
  'coryell': { displayName: 'Coryell County', metro: 'Central Texas', seat: 'Gatesville' },
  'lampasas': { displayName: 'Lampasas County', metro: 'Central Texas', seat: 'Lampasas' },
  'llano': { displayName: 'Llano County', metro: 'Hill Country', seat: 'Llano' },
  'mason': { displayName: 'Mason County', metro: 'Hill Country', seat: 'Mason' },
  'gillespie': { displayName: 'Gillespie County', metro: 'Hill Country', seat: 'Fredericksburg' },
  'kerr': { displayName: 'Kerr County', metro: 'Hill Country', seat: 'Kerrville' },
  'fayette': { displayName: 'Fayette County', metro: 'Central Texas', seat: 'La Grange' },
  'washington': { displayName: 'Washington County', metro: 'Central Texas', seat: 'Brenham' },
  'lavaca': { displayName: 'Lavaca County', metro: 'Central Texas', seat: 'Hallettsville' },
  'gonzales': { displayName: 'Gonzales County', metro: 'South Texas', seat: 'Gonzales' },
  'dewitt': { displayName: 'DeWitt County', metro: 'South Texas', seat: 'Cuero' },
  'victoria': { displayName: 'Victoria County', metro: 'South Texas', seat: 'Victoria' },
  'montague': { displayName: 'Montague County', metro: 'North Texas', seat: 'Montague' },
  'cooke': { displayName: 'Cooke County', metro: 'North Texas', seat: 'Gainesville' },
  'fannin': { displayName: 'Fannin County', metro: 'North Texas', seat: 'Bonham' },
  'lamar': { displayName: 'Lamar County', metro: 'North Texas', seat: 'Paris' },
  'palo-pinto': { displayName: 'Palo Pinto County', metro: 'North Texas', seat: 'Palo Pinto' },
  'stephens': { displayName: 'Stephens County', metro: 'North Texas', seat: 'Breckenridge' },
  'young': { displayName: 'Young County', metro: 'North Texas', seat: 'Graham' },
  'clay': { displayName: 'Clay County', metro: 'North Texas', seat: 'Henrietta' },
  'wichita': { displayName: 'Wichita County', metro: 'North Texas', seat: 'Wichita Falls' },
  'matagorda': { displayName: 'Matagorda County', metro: 'Gulf Coast', seat: 'Bay City' },
  'jackson': { displayName: 'Jackson County', metro: 'Gulf Coast', seat: 'Edna' },
  'wharton': { displayName: 'Wharton County', metro: 'Gulf Coast', seat: 'Wharton' },
  'colorado': { displayName: 'Colorado County', metro: 'Central Texas', seat: 'Columbus' },
}

// City to county mapping — add cities as you encounter them
export const CITY_TO_COUNTY: Record<string, string> = {
  // Dallas-Fort Worth Metro
  'dallas': 'dallas', 'fort worth': 'tarrant', 'arlington': 'tarrant',
  'denton': 'denton', 'frisco': 'collin', 'plano': 'collin', 'mckinney': 'collin',
  'allen': 'collin', 'prosper': 'collin', 'celina': 'collin',
  'rockwall': 'rockwall', 'kaufman': 'kaufman', 'terrell': 'kaufman',
  'decatur': 'wise', 'bridgeport': 'wise', 'boyd': 'wise', 'paradise': 'wise',
  'alvord': 'wise', 'rhome': 'wise', 'newark': 'wise', 'aurora': 'wise',
  'chico': 'wise', 'runaway bay': 'wise',
  'weatherford': 'parker', 'aledo': 'parker', 'hudson oaks': 'parker',
  'jacksboro': 'jack', 'sherman': 'grayson', 'denison': 'grayson',
  'greenville': 'hunt', 'waxahachie': 'ellis', 'cleburne': 'johnson',
  'granbury': 'hood', 'glen rose': 'somervell', 'stephenville': 'erath',
  'mineral wells': 'palo-pinto', 'breckenridge': 'stephens',
  'graham': 'young', 'henrietta': 'clay', 'wichita falls': 'wichita',
  'gainesville': 'cooke', 'bowie': 'montague', 'nocona': 'montague',
  'bonham': 'fannin', 'paris': 'lamar',

  // Austin Metro
  'austin': 'travis', 'round rock': 'williamson', 'georgetown': 'williamson',
  'cedar park': 'williamson', 'leander': 'williamson', 'pflugerville': 'travis',
  'san marcos': 'hays', 'kyle': 'hays', 'buda': 'hays', 'dripping springs': 'hays',
  'bastrop': 'bastrop', 'lockhart': 'caldwell', 'luling': 'caldwell',
  'giddings': 'lee', 'marble falls': 'burnet', 'burnet': 'burnet',
  'johnson city': 'blanco',

  // San Antonio Metro
  'san antonio': 'bexar', 'new braunfels': 'comal', 'seguin': 'guadalupe',
  'schertz': 'guadalupe', 'floresville': 'wilson', 'hondo': 'medina',
  'boerne': 'kendall', 'bandera': 'bandera', 'poteet': 'atascosa',

  // Houston Metro
  'houston': 'harris', 'sugar land': 'fort-bend', 'katy': 'harris',
  'the woodlands': 'montgomery', 'conroe': 'montgomery',
  'pearland': 'brazoria', 'league city': 'galveston', 'galveston': 'galveston',
  'liberty': 'liberty', 'baytown': 'chambers', 'hempstead': 'waller',
  'bellville': 'austin-county', 'sealy': 'austin-county',
  'huntsville': 'walker',

  // Central Corridor
  'waco': 'mclennan', 'temple': 'bell', 'killeen': 'bell',
  'college station': 'brazos', 'bryan': 'brazos',
  'navasota': 'grimes', 'caldwell': 'burleson',
  'hillsboro': 'hill', 'meridian': 'bosque', 'gatesville': 'coryell',
  'lampasas': 'lampasas',

  // Edge counties / extended
  'mexia': 'limestone', 'groesbeck': 'limestone',
  'corsicana': 'navarro', 'fairfield': 'freestone',
  'marlin': 'falls', 'franklin': 'robertson', 'hearne': 'robertson',
  'cameron': 'milam', 'rockdale': 'milam',
  'centerville': 'leon', 'madisonville': 'madison',
  'livingston': 'polk', 'coldspring': 'san-jacinto',
  'la grange': 'fayette', 'brenham': 'washington',
  'hallettsville': 'lavaca', 'gonzales': 'gonzales',
  'cuero': 'dewitt', 'victoria': 'victoria',
  'fredericksburg': 'gillespie', 'kerrville': 'kerr',
  'llano': 'llano', 'mason': 'mason',
  'bay city': 'matagorda', 'edna': 'jackson',
  'wharton': 'wharton', 'columbus': 'colorado',
}

/**
 * Look up county from a city name. Case-insensitive.
 * Returns the county ID (e.g., 'limestone') or null if not found.
 */
export function getCountyFromCity(city: string): string | null {
  const normalized = city.trim().toLowerCase()
  return CITY_TO_COUNTY[normalized] || null
}

/**
 * Get display name for any county — checks both original and extended.
 */
export function getExtendedCountyDisplayName(countyId: string): string {
  // First check if it's in the original county data (imported elsewhere)
  // If not, check extended counties
  const extended = EXTENDED_COUNTIES[countyId]
  if (extended) return extended.displayName

  // Fallback: capitalize the ID
  return countyId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) + ' County'
}

/**
 * Get all available counties — original + extended, sorted alphabetically
 */
export function getAllCountyOptions(): { id: string; displayName: string }[] {
  const extendedOptions = Object.entries(EXTENDED_COUNTIES).map(([id, info]) => ({
    id,
    displayName: info.displayName,
  }))

  return extendedOptions.sort((a, b) => a.displayName.localeCompare(b.displayName))
}
