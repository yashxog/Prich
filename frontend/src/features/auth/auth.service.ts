import type {
  CreatorProfile,
  CreatorProfileResponse,
  UpdateCreatorProfileInput,
} from '@prich/shared'
import { apiRequest } from '../../services/api_client'
import { getSupabaseClient } from '../../services/supabase_client'
import {
  buildAuthCallbackUrl,
  completeAuthSession,
  getCurrentAccessToken,
  signOutCurrentUser,
} from './auth_session'

export interface CreatorSignUpInput {
  email: string
  firstName: string
  lastName: string
  password: string
}

export interface CreatorSignUpResult {
  requiresEmailConfirmation: boolean
}

/**
 * Ensures the authenticated user has a creator profile through the backend.
 * @param accessToken - The current Supabase access token.
 * @returns Nothing after the database function completes.
 */
export async function ensureCreatorProfile(accessToken: string): Promise<void> {
  await apiRequest<void>('/api/v1/creator/profile/ensure', accessToken, { method: 'POST' })
}

/**
 * Creates a creator identity with email and password.
 * @param input - The creator's identity and password values.
 * @returns Whether the creator must confirm their email before continuing.
 */
export async function signUpCreator(input: CreatorSignUpInput): Promise<CreatorSignUpResult> {
  const { data, error } = await getSupabaseClient().auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        account_type: 'creator',
        first_name: input.firstName,
        last_name: input.lastName,
      },
      emailRedirectTo: buildAuthCallbackUrl('/creator/onboarding'),
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  if (data.session) {
    await ensureCreatorProfile(data.session.access_token)
  }

  return { requiresEmailConfirmation: data.session === null }
}

/**
 * Signs an existing creator in with email and password.
 * @param email - The creator's email address.
 * @param password - The creator's password.
 * @returns The profile that determines the next creator screen.
 */
export async function signInCreator(email: string, password: string): Promise<CreatorProfile> {
  const { data, error } = await getSupabaseClient().auth.signInWithPassword({ email, password })

  if (error) {
    throw new Error(error.message)
  }

  await ensureCreatorProfile(data.session.access_token)
  return getCreatorProfileWithToken(data.session.access_token)
}

/**
 * Starts Google OAuth for creator authentication.
 * @returns Nothing because the browser redirects to Google.
 */
export async function signInCreatorWithGoogle(): Promise<void> {
  const { error } = await getSupabaseClient().auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: buildAuthCallbackUrl('/creator/onboarding'),
    },
  })

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Completes a PKCE callback and ensures the creator database profile exists.
 * @param code - The one-time authorization code returned by Supabase.
 * @returns Nothing after the session and profile are ready.
 */
export async function completeCreatorAuth(code: string | null): Promise<void> {
  await ensureCreatorProfile(await completeAuthSession(code))
}

/**
 * Loads a creator profile with an already available access token.
 * @param accessToken - The current Supabase access token.
 * @returns The normalized creator profile.
 */
async function getCreatorProfileWithToken(accessToken: string): Promise<CreatorProfile> {
  const response = await apiRequest<CreatorProfileResponse>('/api/v1/creator/profile', accessToken)
  return response.profile
}

/**
 * Loads the current creator's private profile.
 * @returns The normalized creator profile.
 */
export async function getCreatorProfile(): Promise<CreatorProfile> {
  return getCreatorProfileWithToken(await getCurrentAccessToken())
}

/**
 * Stores the current creator's profile details with an optional phone number.
 * @param input - The validated creator profile values.
 * @returns The updated normalized creator profile.
 */
export async function updateCreatorProfile(input: UpdateCreatorProfileInput): Promise<CreatorProfile> {
  const response = await apiRequest<CreatorProfileResponse>(
    '/api/v1/creator/profile',
    await getCurrentAccessToken(),
    { body: JSON.stringify(input), method: 'PUT' },
  )
  return response.profile
}

/**
 * Ends the active Supabase session.
 * @returns Nothing after the local and remote session are cleared.
 */
export async function signOutCreator(): Promise<void> {
  await signOutCurrentUser()
}
