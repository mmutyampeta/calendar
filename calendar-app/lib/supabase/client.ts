import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase client for use in Client Components
 * This client is used for client-side operations like auth, realtime subscriptions, etc.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}