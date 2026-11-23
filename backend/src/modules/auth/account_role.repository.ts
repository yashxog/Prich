import { getBackendClient } from '../../services/supabase_client.js'

export type AccountRole = 'brand' | 'creator'

interface AccountRoleRecord {
  account_type: AccountRole
}

export class AccountRoleConflictError extends Error {
  /**
   * Creates a safe error for an identity already assigned to another account type.
   * @param existingRole - The account type already assigned to the identity.
   */
  public constructor(public readonly existingRole: AccountRole) {
    super(`This identity already belongs to a ${existingRole} account.`)
    this.name = 'AccountRoleConflictError'
  }
}

/**
 * Idempotently assigns an authenticated identity to one account type.
 * @param userId - The UUID verified from the Supabase access token.
 * @param accountRole - The creator or brand role being claimed.
 * @returns Nothing after the role is confirmed.
 */
export async function claimAccountRole(userId: string, accountRole: AccountRole): Promise<void> {
  const client = getBackendClient()
  const { error: insertError } = await client
    .from('account_roles')
    .upsert({ account_type: accountRole, user_id: userId }, {
      ignoreDuplicates: true,
      onConflict: 'user_id',
    })

  if (insertError) {
    throw new Error('Account role assignment failed.')
  }

  const { data, error: readError } = await client
    .from('account_roles')
    .select('account_type')
    .eq('user_id', userId)
    .single<AccountRoleRecord>()

  if (readError || !data) {
    throw new Error('Account role verification failed.')
  }

  if (data.account_type !== accountRole) {
    throw new AccountRoleConflictError(data.account_type)
  }
}
