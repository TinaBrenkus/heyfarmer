import { createClient } from '@supabase/supabase-js'

// Get environment variables - check both process.env and globalThis for Next.js 15 compatibility
const getEnvVar = (key: string): string => {
  // Try process.env first (build time)
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return (process.env[key] as string).trim()
  }
  // Try globalThis for runtime (Vercel Edge)
  if (typeof globalThis !== 'undefined' && (globalThis as any)[key]) {
    return String((globalThis as any)[key]).trim()
  }
  return ''
}

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY')

// Log for debugging (safe for production as we only log existence, not values)
console.log('[Supabase Init] URL exists:', !!supabaseUrl)
console.log('[Supabase Init] URL starts with http:', supabaseUrl?.startsWith('http'))
console.log('[Supabase Init] Key exists:', !!supabaseAnonKey)
console.log('[Supabase Init] Key length:', supabaseAnonKey?.length || 0)

// Validate environment variables
if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  console.error('[Supabase Init] Invalid or missing NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured properly. Check Vercel environment variables.')
}

if (!supabaseAnonKey || supabaseAnonKey.length < 20) {
  console.error('[Supabase Init] Invalid or missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured properly. Check Vercel environment variables.')
}

console.log('[Supabase Init] Creating client...')

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})