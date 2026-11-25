import { getBackendClient } from '../../services/supabase_client.js'

export type AccountRole = 'brand' | 'creator'

/**
 * Idempotently grants an authenticated identity an account role.
 * @param userId - The UUID verified from the Supabase access token.
 * @param accountRole - The creator or brand role being claimed.
 * @returns Nothing after the role is confirmed.
 */
export async function claimAccountRole(userId: string, accountRole: AccountRole): Promise<void> {
  const { error } = await getBackendClient()
    .from('account_roles')
    .upsert({ account_type: accountRole, user_id: userId }, {
      ignoreDuplicates: true,
      onConflict: 'user_id,account_type',
    })

  if (error) {
    throw new Error('Account role assignment failed.')
  }
}
