import type { SocialHandle, SocialPlatform } from '@prich/shared'
import { getBackendClient } from '../../services/supabase_client.js'

interface SocialHandleRecord {
  handle: string
  platform: SocialPlatform
  profile_url: string
}

/**
 * Maps a database social handle into its shared API contract.
 * @param record - The stored social handle row.
 * @returns The framework-neutral social handle.
 */
function mapSocialHandle(record: SocialHandleRecord): SocialHandle {
  return { handle: record.handle, platform: record.platform, profileUrl: record.profile_url }
}

/**
 * Lists social identities owned by a creator.
 * @param creatorUserId - The creator UUID verified from the access token.
 * @returns The creator's social handles.
 */
export async function listCreatorSocialHandles(creatorUserId: string): Promise<SocialHandle[]> {
  const { data, error } = await getBackendClient()
    .from('creator_social_handles')
    .select('platform, handle, profile_url')
    .eq('creator_user_id', creatorUserId)
    .order('platform')
    .returns<SocialHandleRecord[]>()

  if (error) {
    throw new Error('Creator social handles could not be loaded.')
  }

  return (data ?? []).map(mapSocialHandle)
}

/**
 * Stores one creator-owned social identity.
 * @param creatorUserId - The creator UUID verified from the access token.
 * @param handle - The validated social handle.
 * @returns The stored creator social identity.
 */
export async function upsertCreatorSocialHandle(
  creatorUserId: string,
  handle: SocialHandle,
): Promise<SocialHandle> {
  const { data, error } = await getBackendClient()
    .from('creator_social_handles')
    .upsert({
      creator_user_id: creatorUserId,
      handle: handle.handle,
      platform: handle.platform,
      profile_url: handle.profileUrl,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'creator_user_id,platform' })
    .select('platform, handle, profile_url')
    .single<SocialHandleRecord>()

  if (error || !data) {
    throw new Error('Creator social handle could not be saved.')
  }

  return mapSocialHandle(data)
}

/**
 * Lists social identities owned by a brand.
 * @param brandUserId - The brand UUID verified from the access token.
 * @returns The brand's social handles.
 */
export async function listBrandSocialHandles(brandUserId: string): Promise<SocialHandle[]> {
  const { data, error } = await getBackendClient()
    .from('brand_social_handles')
    .select('platform, handle, profile_url')
    .eq('brand_user_id', brandUserId)
    .order('platform')
    .returns<SocialHandleRecord[]>()

  if (error) {
    throw new Error('Brand social handles could not be loaded.')
  }

  return (data ?? []).map(mapSocialHandle)
}

/**
 * Stores one brand-owned social identity.
 * @param brandUserId - The brand UUID verified from the access token.
 * @param handle - The validated social handle.
 * @returns The stored brand social identity.
 */
export async function upsertBrandSocialHandle(
  brandUserId: string,
  handle: SocialHandle,
): Promise<SocialHandle> {
  const { data, error } = await getBackendClient()
    .from('brand_social_handles')
    .upsert({
      brand_user_id: brandUserId,
      handle: handle.handle,
      platform: handle.platform,
      profile_url: handle.profileUrl,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'brand_user_id,platform' })
    .select('platform, handle, profile_url')
    .single<SocialHandleRecord>()

  if (error || !data) {
    throw new Error('Brand social handle could not be saved.')
  }

  return mapSocialHandle(data)
}
