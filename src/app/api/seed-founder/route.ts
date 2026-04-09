import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This is a one-time seed route. After running it once, you can delete this file.
// Visit: http://localhost:3000/api/seed-founder (with dev server running)
// Or on production: https://your-domain.com/api/seed-founder

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createClient(supabaseUrl, supabaseKey)

  // First, create an auth user for the founder profile
  const email = 'tina@heyfarmer.farm'
  const password = 'FoundingFarmer2026!' // Change this after first login

  // Try to sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: 'Tina Brenkus',
        user_type: 'production_farmer',
      }
    }
  })

  if (authError && !authError.message?.includes('already registered')) {
    return NextResponse.json({ error: 'Auth error: ' + authError.message }, { status: 500 })
  }

  // Get the user ID (either from signup or existing)
  let userId = authData?.user?.id

  if (!userId) {
    // User might already exist, try to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (signInError) {
      return NextResponse.json({
        error: 'Could not create or sign in user. If the account already exists with a different password, sign in manually and update the profile.',
        details: signInError.message
      }, { status: 500 })
    }
    userId = signInData.user.id
  }

  // Now upsert the profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email: email,
      full_name: 'Tina Brenkus',
      farm_name: 'Brenkus Ranch',
      user_type: 'production_farmer',
      county: 'wise',
      city: 'Bridgeport',
      bio: "Generational land in Wise County, Texas. We're reviving the garden my grandmother started here in 1950 — high tunnels coming this season for fresh vegetables and herbs. We also provide land for a neighboring cattle operation running grass-fed beef. Little Juniper cabin available for farm stays.",
      show_in_marketplace: true,
      include_in_search: true,
      show_in_directory: true,
      is_verified: true,
      verified_at: new Date().toISOString(),
      grow_tags: ['vegetables', 'herbs', 'beef', 'farm stays'],
      specialties: ['market garden', 'cattle', 'farm stays', 'high tunnels'],
      farm_size_acres: 89,
    }, { onConflict: 'id' })
    .select()
    .single()

  if (profileError) {
    return NextResponse.json({ error: 'Profile error: ' + profileError.message }, { status: 500 })
  }

  // Sign out to clean up
  await supabase.auth.signOut()

  return NextResponse.json({
    success: true,
    message: 'Founder profile created successfully!',
    profile: {
      id: userId,
      name: 'Tina Brenkus',
      farm: 'Brenkus Ranch',
      county: 'Wise County',
    },
    next_steps: [
      'Profile is now visible on /farmers',
      'Sign in at /login with email: tina@heyfarmer.farm',
      'Change password after first login',
      'Delete this seed route: src/app/api/seed-founder/route.ts'
    ]
  })
}
