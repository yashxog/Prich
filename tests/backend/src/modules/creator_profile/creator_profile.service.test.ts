import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  findCreatorProfileRecord,
  type CreatorProfileRecord,
} from '../../../../../backend/src/modules/creator_profile/creator_profile.repository.js'
import { getCreatorProfile } from '../../../../../backend/src/modules/creator_profile/creator_profile.service.js'

vi.mock('../../../../../backend/src/modules/creator_profile/creator_profile.repository.js', async (importOriginal) => ({
  ...await importOriginal<typeof import('../../../../../backend/src/modules/creator_profile/creator_profile.repository.js')>(),
  findCreatorProfileRecord: vi.fn(),
}))

const COMPLETE_PROFILE_RECORD: CreatorProfileRecord = {
  bio: '',
  country: 'India',
  display_name: 'Asha Rao',
  email: 'asha@example.com',
  first_name: 'Asha',
  is_linkedin_attached: false,
  is_x_attached: false,
  last_name: 'Rao',
  niche: 'Fintech',
  phone_number: '',
  phone_verified_at: null,
  user_id: '7841d8d6-7a6c-42d0-bbd2-aea16431a112',
}

describe('creator profile service', () => {
  beforeEach(() => {
    vi.mocked(findCreatorProfileRecord).mockReset()
  })

  it('marks a profile complete without a phone number', async () => {
    vi.mocked(findCreatorProfileRecord).mockResolvedValue(COMPLETE_PROFILE_RECORD)

    const profile = await getCreatorProfile(COMPLETE_PROFILE_RECORD.user_id)

    expect(profile.isComplete).toBe(true)
    expect(profile.isPhoneVerified).toBe(false)
    expect(profile.phoneNumber).toBe('')
  })

  it('keeps an optional unverified phone from blocking profile completion', async () => {
    vi.mocked(findCreatorProfileRecord).mockResolvedValue({
      ...COMPLETE_PROFILE_RECORD,
      phone_number: '+919876543210',
    })

    const profile = await getCreatorProfile(COMPLETE_PROFILE_RECORD.user_id)

    expect(profile.isComplete).toBe(true)
    expect(profile.isPhoneVerified).toBe(false)
  })
})
