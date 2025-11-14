import { createClient } from '@supabase/supabase-js'

// Get environment variables - use direct access for client-side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Validate environment variables
if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  console.error('Invalid or missing NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured properly. Please check your .env.local file.')
}

if (!supabaseAnonKey || supabaseAnonKey.length < 20) {
  console.error('Invalid or missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured properly. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})