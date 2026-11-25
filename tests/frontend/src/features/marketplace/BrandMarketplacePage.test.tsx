import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BrandMarketplacePage } from '../../../../../frontend/src/features/marketplace/BrandMarketplacePage'
import { getBrandProfile } from '../../../../../frontend/src/features/auth/brand_auth.service'
import { getBrandMarketplace, getSocialHandles, reviewBrandSubmission } from '../../../../../frontend/src/features/marketplace/marketplace.service'

vi.mock('../../../../../frontend/src/features/auth/brand_auth.service', () => ({
  getBrandProfile: vi.fn(),
  signOutBrand: vi.fn(),
}))

vi.mock('../../../../../frontend/src/features/marketplace/marketplace.service', () => ({
  createBrandCampaign: vi.fn(),
  getBrandMarketplace: vi.fn(),
  getSocialHandles: vi.fn(),
  reviewBrandSubmission: vi.fn(),
  saveSocialHandle: vi.fn(),
}))

const SUBMISSION = { brandFeedback: '', campaignId: '42', campaignTitle: 'Workflow story', id: '9', platform: 'x' as const, postUrl: 'https://x.com/asha/status/123456789', rewardAmount: '125.00', status: 'pending' as const, submittedAt: '2026-11-25T08:00:00.000Z' }

describe('BrandMarketplacePage', () => {
  beforeEach(() => {
    vi.mocked(getBrandProfile).mockResolvedValue({ category: 'SaaS', companyName: 'Northstar', email: 'team@northstar.example', isComplete: true, userId: 'brand-id', website: 'https://northstar.example' })
    vi.mocked(getBrandMarketplace).mockResolvedValue({ campaigns: [], submissions: [SUBMISSION] })
    vi.mocked(getSocialHandles).mockResolvedValue([])
    vi.mocked(reviewBrandSubmission).mockResolvedValue({ ...SUBMISSION, status: 'approved' })
  })

  it('reviews a commissioned post from the brand dashboard', async () => {
    render(<MemoryRouter><BrandMarketplacePage /></MemoryRouter>)

    fireEvent.change(await screen.findByLabelText('Private review note'), { target: { value: 'On brief.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }))

    await waitFor(() => expect(reviewBrandSubmission).toHaveBeenCalledWith('9', { feedback: 'On brief.', status: 'approved' }))
    expect(await screen.findByText('Submission approved.')).toBeInTheDocument()
  })

  it('returns an expired local session to brand login', async () => {
    vi.mocked(getBrandProfile).mockRejectedValue(new Error('Your session has expired. Please log in again.'))

    render(<MemoryRouter initialEntries={['/brand/dashboard']}><Routes><Route path="/brand/dashboard" element={<BrandMarketplacePage />} /><Route path="/brand/login" element={<p>Brand login</p>} /></Routes></MemoryRouter>)

    expect(await screen.findByText('Brand login')).toBeInTheDocument()
  })
})
