import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BrandOnboardingPage } from '../../../../../frontend/src/features/auth/BrandOnboardingPage'
import { getBrandProfile, updateBrandProfile } from '../../../../../frontend/src/features/auth/brand_auth.service'

vi.mock('../../../../../frontend/src/features/auth/brand_auth.service', () => ({
  getBrandProfile: vi.fn(),
  updateBrandProfile: vi.fn(),
}))

describe('BrandOnboardingPage', () => {
  beforeEach(() => {
    vi.mocked(getBrandProfile).mockReset()
    vi.mocked(updateBrandProfile).mockReset()
  })

  it('collects company details after authentication', async () => {
    vi.mocked(getBrandProfile).mockResolvedValue({
      category: '',
      companyName: '',
      email: 'team@northstar.example',
      isComplete: false,
      userId: 'f7f0b799-8a34-47a8-b1b7-0283def9dcaa',
      website: '',
    })
    vi.mocked(updateBrandProfile).mockResolvedValue({
      category: 'SaaS',
      companyName: 'Northstar Labs',
      email: 'team@northstar.example',
      isComplete: true,
      userId: 'f7f0b799-8a34-47a8-b1b7-0283def9dcaa',
      website: 'https://northstar.example',
    })

    render(
      <MemoryRouter initialEntries={['/brand/onboarding']}>
        <Routes>
          <Route path="/brand/onboarding" element={<BrandOnboardingPage />} />
          <Route path="/brand/dashboard" element={<p>Brand dashboard</p>} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.change(await screen.findByLabelText('Company name'), { target: { value: 'Northstar Labs' } })
    fireEvent.change(screen.getByLabelText(/^Website/), { target: { value: 'https://northstar.example' } })
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'SaaS' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }))

    await waitFor(() => expect(updateBrandProfile).toHaveBeenCalledWith({
      category: 'SaaS',
      companyName: 'Northstar Labs',
      website: 'https://northstar.example',
    }))
    expect(await screen.findByText('Brand dashboard')).toBeInTheDocument()
  })
})
