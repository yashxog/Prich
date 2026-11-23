import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

/**
 * Returns the configured browser Supabase client.
 * @returns A singleton Supabase client using the public project credentials.
 * @throws When the required public environment values are missing.
 */
export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !publishableKey) {
    throw new Error('Authentication is not configured. Add the Supabase URL and publishable key.')
  }

  supabaseClient = createClient(supabaseUrl, publishableKey, {
    auth: {
      detectSessionInUrl: false,
      flowType: 'pkce',
      persistSession: true,
    },
  })

  return supabaseClient
}
