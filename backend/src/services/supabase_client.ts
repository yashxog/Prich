import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let backendClient: SupabaseClient | null = null

/**
 * Reads a required backend environment value.
 * @param key - The environment key to read.
 * @returns The configured value.
 * @throws When the value is missing.
 */
function getRequiredEnvironmentValue(key: 'SUPABASE_URL' | 'SUPABASE_SECRET_KEY'): string {
  const value = process.env[key]

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value
}

/**
 * Returns the stateless Supabase client used to verify access tokens.
 * @returns A singleton server-side Supabase client.
 */
export function getBackendClient(): SupabaseClient {
  if (backendClient) {
    return backendClient
  }

  backendClient = createClient(
    getRequiredEnvironmentValue('SUPABASE_URL'),
    getRequiredEnvironmentValue('SUPABASE_SECRET_KEY'),
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    },
  )

  return backendClient
}
