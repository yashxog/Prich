import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CreatorMarketplacePage } from '../../../../../frontend/src/features/marketplace/CreatorMarketplacePage'
import { getCreatorProfile } from '../../../../../frontend/src/features/auth/auth.service'
import {
  getCreatorMarketplace,
  getSocialHandles,
  submitCampaignPost,
} from '../../../../../frontend/src/features/marketplace/marketplace.service'

vi.mock('../../../../../frontend/src/features/auth/auth.service', () => ({
  getCreatorProfile: vi.fn(),
  signOutCreator: vi.fn(),
}))

vi.mock('../../../../../frontend/src/features/marketplace/marketplace.service', () => ({
  getCreatorMarketplace: vi.fn(),
  getSocialHandles: vi.fn(),
  saveSocialHandle: vi.fn(),
  submitCampaignPost: vi.fn(),
}))

describe('CreatorMarketplacePage', () => {
  beforeEach(() => {
    vi.mocked(getCreatorProfile).mockResolvedValue({
      bio: 'Fintech creator', country: 'India', displayName: 'Asha Rao', email: 'asha@example.com', firstName: 'Asha', isComplete: true, isLinkedInAttached: false, isPhoneVerified: true, isXAttached: false, lastName: 'Rao', niche: 'Fintech', phoneNumber: '+919876543210', userId: 'creator-id',
    })
    vi.mocked(getCreatorMarketplace).mockResolvedValue({
      campaigns: [{ brief: 'Share your workflow.', deadline: '2027-01-01T00:00:00.000Z', id: '42', platform: 'x', rewardAmount: '125.00', status: 'open', title: 'Workflow story' }],
      submissions: [],
    })
    vi.mocked(getSocialHandles).mockResolvedValue([])
    vi.mocked(submitCampaignPost).mockResolvedValue({ brandFeedback: '', campaignId: '42', campaignTitle: 'Workflow story', id: '9', platform: 'x', postUrl: 'https://x.com/asha/status/123456789', rewardAmount: '125.00', status: 'pending', submittedAt: '2026-11-25T08:00:00.000Z' })
  })

  it('submits an original post and shows only first-party campaign analytics', async () => {
    render(<MemoryRouter><CreatorMarketplacePage /></MemoryRouter>)

    fireEvent.change(await screen.findByLabelText('Original post URL'), { target: { value: 'https://x.com/asha/status/123456789' } })
    fireEvent.click(screen.getByRole('button', { name: 'Submit post' }))

    await waitFor(() => expect(submitCampaignPost).toHaveBeenCalledWith('42', 'x', 'https://x.com/asha/status/123456789'))
    expect(await screen.findByText('Post submitted for brand review.')).toBeInTheDocument()
    expect(screen.getByText(/Follower, impression, and engagement metrics are unavailable/)).toBeInTheDocument()
  })

  it('returns an expired local session to creator login', async () => {
    vi.mocked(getCreatorProfile).mockRejectedValue(new Error('Your session has expired. Please log in again.'))

    render(<MemoryRouter initialEntries={['/creator/dashboard']}><Routes><Route path="/creator/dashboard" element={<CreatorMarketplacePage />} /><Route path="/creator/login" element={<p>Creator login</p>} /></Routes></MemoryRouter>)

    expect(await screen.findByText('Creator login')).toBeInTheDocument()
  })
})
