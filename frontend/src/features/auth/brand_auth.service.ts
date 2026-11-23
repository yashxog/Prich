import type {
  BrandProfile,
  BrandProfileResponse,
  UpdateBrandProfileInput,
} from '@prich/shared'
import { apiRequest } from '../../services/api_client'
import { getSupabaseClient } from '../../services/supabase_client'
import {
  buildAuthCallbackUrl,
  completeAuthSession,
  getCurrentAccessToken,
  signOutCurrentUser,
} from './auth_session'

export interface BrandSignUpInput {
  email: string
  password: string
}

export interface BrandSignUpResult {
  requiresEmailConfirmation: boolean
}

/**
 * Ensures the authenticated user has a brand profile through the backend.
 * @param accessToken - The current Supabase access token.
 * @returns Nothing after the profile is ready.
 */
export async function ensureBrandProfile(accessToken: string): Promise<void> {
  await apiRequest<void>('/api/v1/brand/profile/ensure', accessToken, { method: 'POST' })
}

/**
 * Creates a brand identity with email and password.
 * @param input - The brand email and password values.
 * @returns Whether the brand must confirm its email before continuing.
 */
export async function signUpBrand(input: BrandSignUpInput): Promise<BrandSignUpResult> {
  const { data, error } = await getSupabaseClient().auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { account_type: 'brand' },
      emailRedirectTo: buildAuthCallbackUrl('/brand/onboarding'),
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  if (data.session) {
    await ensureBrandProfile(data.session.access_token)
  }

  return { requiresEmailConfirmation: data.session === null }
}

/**
 * Signs an existing brand in with email and password.
 * @param email - The brand account email address.
 * @param password - The brand account password.
 * @returns The profile that determines the next screen.
 */
export async function signInBrand(email: string, password: string): Promise<BrandProfile> {
  const { data, error } = await getSupabaseClient().auth.signInWithPassword({ email, password })

  if (error) {
    throw new Error(error.message)
  }

  await ensureBrandProfile(data.session.access_token)
  return getBrandProfileWithToken(data.session.access_token)
}

/**
 * Starts Google OAuth for brand authentication.
 * @returns Nothing because the browser redirects to Google.
 */
export async function signInBrandWithGoogle(): Promise<void> {
  const { error } = await getSupabaseClient().auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: buildAuthCallbackUrl('/brand/onboarding') },
  })

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Completes a PKCE callback and ensures the brand profile exists.
 * @param code - The one-time authorization code returned by Supabase.
 * @returns Nothing after the session and profile are ready.
 */
export async function completeBrandAuth(code: string | null): Promise<void> {
  await ensureBrandProfile(await completeAuthSession(code))
}

/**
 * Loads a brand profile with an already available access token.
 * @param accessToken - The current Supabase access token.
 * @returns The normalized brand profile.
 */
async function getBrandProfileWithToken(accessToken: string): Promise<BrandProfile> {
  const response = await apiRequest<BrandProfileResponse>('/api/v1/brand/profile', accessToken)
  return response.profile
}

/**
 * Loads the current brand's private profile.
 * @returns The normalized brand profile.
 */
export async function getBrandProfile(): Promise<BrandProfile> {
  return getBrandProfileWithToken(await getCurrentAccessToken())
}

/**
 * Stores the current brand's company details.
 * @param input - The validated company profile values.
 * @returns The updated normalized brand profile.
 */
export async function updateBrandProfile(input: UpdateBrandProfileInput): Promise<BrandProfile> {
  const response = await apiRequest<BrandProfileResponse>(
    '/api/v1/brand/profile',
    await getCurrentAccessToken(),
    { body: JSON.stringify(input), method: 'PUT' },
  )
  return response.profile
}

/**
 * Ends the active brand session.
 * @returns Nothing after the session is cleared.
 */
export async function signOutBrand(): Promise<void> {
  await signOutCurrentUser()
}
