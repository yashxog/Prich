import { getSupabaseClient } from '../../services/supabase_client'

/**
 * Builds an absolute callback URL for an authentication redirect.
 * @param nextPath - The safe application path used after authentication.
 * @returns The absolute authentication callback URL.
 */
export function buildAuthCallbackUrl(nextPath: string): string {
  const callbackUrl = new URL('/auth/callback', window.location.origin)
  callbackUrl.searchParams.set('next', nextPath)
  return callbackUrl.toString()
}

/**
 * Exchanges an optional PKCE code and returns a valid access token.
 * @param code - The one-time authorization code returned by Supabase.
 * @returns The authenticated session access token.
 */
export async function completeAuthSession(code: string | null): Promise<string> {
  const supabase = getSupabaseClient()

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      throw new Error(error.message)
    }

    return data.session.access_token
  }

  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw new Error(error.message)
  }

  if (!data.session) {
    throw new Error('The authentication link is invalid or has expired.')
  }

  return data.session.access_token
}

/**
 * Returns the access token for the active authenticated session.
 * @returns The current access token.
 */
export async function getCurrentAccessToken(): Promise<string> {
  const { data, error } = await getSupabaseClient().auth.getSession()

  if (error || !data.session) {
    throw new Error(error?.message ?? 'Your session has expired. Please log in again.')
  }

  return data.session.access_token
}

/**
 * Ends the active Supabase session.
 * @returns Nothing after the local and remote session are cleared.
 */
export async function signOutCurrentUser(): Promise<void> {
  const { error } = await getSupabaseClient().auth.signOut()

  if (error) {
    throw new Error(error.message)
  }
}
