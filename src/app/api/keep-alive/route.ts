import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This endpoint pings Supabase to prevent free-tier auto-pause.
// Set up a monitoring service (UptimeRobot, cron-job.org) to hit this
// URL every 5 minutes: https://www.heyfarmer.farm/api/keep-alive

export async function GET() {
  const start = Date.now()

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Simple query to keep the database active
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    const ms = Date.now() - start

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: error.message,
        ms,
        timestamp: new Date().toISOString(),
      }, { status: 500 })
    }

    return NextResponse.json({
      status: 'ok',
      profiles: count,
      ms,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      message: err instanceof Error ? err.message : 'Unknown error',
      ms: Date.now() - start,
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}
