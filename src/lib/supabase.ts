import { createClient } from '@supabase/supabase-js'

// Access environment variables directly - Next.js will inline these at build time for NEXT_PUBLIC_* variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Log for debugging (safe for production as we only log existence, not values)
if (typeof window !== 'undefined') {
  console.log('[Supabase Init] URL exists:', !!supabaseUrl)
  console.log('[Supabase Init] URL value:', supabaseUrl)
  console.log('[Supabase Init] Key exists:', !!supabaseAnonKey)
  console.log('[Supabase Init] Key length:', supabaseAnonKey?.length || 0)
}

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = `Missing Supabase environment variables:
    - NEXT_PUBLIC_SUPABASE_URL: ${!!supabaseUrl}
    - NEXT_PUBLIC_SUPABASE_ANON_KEY: ${!!supabaseAnonKey}

    Please ensure these are set in your Vercel project settings.`
  console.error(errorMsg)
  throw new Error('Supabase environment variables are not configured.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})
