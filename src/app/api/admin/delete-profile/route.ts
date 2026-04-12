import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin-only route to delete a profile by ID
// GET /api/admin/delete-profile?id=PROFILE_ID
// Also: GET /api/admin/delete-profile to list all profiles

export async function GET(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { searchParams } = new URL(request.url)
  const profileId = searchParams.get('id')
  const confirm = searchParams.get('confirm')

  // If no ID provided, list all profiles
  if (!profileId) {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, full_name, farm_name, user_type, county, created_at')
      .order('created_at', { ascending: false })

    return NextResponse.json({
      message: 'Add ?id=PROFILE_ID&confirm=yes to delete a profile',
      profiles: profiles || [],
      error: error?.message || null,
    })
  }

  // Safety: require confirm=yes
  if (confirm !== 'yes') {
    // Show the profile that would be deleted
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, farm_name, user_type, county')
      .eq('id', profileId)
      .single()

    return NextResponse.json({
      message: 'Add &confirm=yes to the URL to actually delete this profile',
      profile_to_delete: profile,
      delete_url: `/api/admin/delete-profile?id=${profileId}&confirm=yes`,
    })
  }

  // Delete the profile's data
  try {
    // Delete posts
    await supabase.from('posts').delete().eq('user_id', profileId)
    // Delete messages
    await supabase.from('messages').delete().eq('sender_id', profileId)
    // Delete profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profileId)

    if (profileError) {
      return NextResponse.json({
        error: 'Failed to delete profile: ' + profileError.message,
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Profile ${profileId} deleted successfully`,
    })
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Unknown error',
    }, { status: 500 })
  }
}
