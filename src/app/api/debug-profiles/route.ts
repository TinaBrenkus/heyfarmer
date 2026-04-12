import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Temporary debug route — delete after troubleshooting
// Visit: https://www.heyfarmer.farm/api/debug-profiles

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Query 1: All profiles (no filter)
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('id, full_name, farm_name, user_type, show_in_marketplace, include_in_search, county')

    // Query 2: Farmer-filtered profiles (same as Browse Farmers page)
    const { data: farmerProfiles, error: farmerError } = await supabase
      .from('profiles')
      .select('id, full_name, farm_name, user_type, show_in_marketplace, include_in_search')
      .in('user_type', ['backyard_grower', 'market_gardener', 'production_farmer'])
      .eq('show_in_marketplace', true)
      .eq('include_in_search', true)

    return NextResponse.json({
      all_profiles: {
        count: allProfiles?.length || 0,
        data: allProfiles,
        error: allError?.message || null,
      },
      farmer_filtered: {
        count: farmerProfiles?.length || 0,
        data: farmerProfiles,
        error: farmerError?.message || null,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Unknown error',
    }, { status: 500 })
  }
}
