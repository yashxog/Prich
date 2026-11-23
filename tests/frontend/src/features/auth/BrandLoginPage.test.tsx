import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BrandLoginPage } from '../../../../../frontend/src/features/auth/BrandLoginPage'
import { signInBrand, signInBrandWithGoogle } from '../../../../../frontend/src/features/auth/brand_auth.service'

vi.mock('../../../../../frontend/src/features/auth/brand_auth.service', () => ({
  signInBrand: vi.fn(),
  signInBrandWithGoogle: vi.fn(),
}))

/**
 * Renders brand login with onboarding and dashboard destinations.
 * @returns Nothing.
 */
function renderLoginPage(): void {
  render(
    <MemoryRouter initialEntries={['/brand/login']}>
      <Routes>
        <Route path="/brand/login" element={<BrandLoginPage />} />
        <Route path="/brand/onboarding" element={<p>Company onboarding</p>} />
        <Route path="/brand/dashboard" element={<p>Brand dashboard</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('BrandLoginPage', () => {
  beforeEach(() => {
    vi.mocked(signInBrand).mockReset()
    vi.mocked(signInBrandWithGoogle).mockReset()
  })

  it('sends an incomplete brand to company onboarding', async () => {
    vi.mocked(signInBrand).mockResolvedValue({
      category: '',
      companyName: '',
      email: 'team@northstar.example',
      isComplete: false,
      userId: 'f7f0b799-8a34-47a8-b1b7-0283def9dcaa',
      website: '',
    })
    renderLoginPage()

    fireEvent.change(screen.getByLabelText('Work email'), { target: { value: 'team@northstar.example' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'securepass' } })
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }))

    await waitFor(() => expect(signInBrand).toHaveBeenCalledWith('team@northstar.example', 'securepass'))
    expect(await screen.findByText('Company onboarding')).toBeInTheDocument()
  })

  it('sends a completed brand directly to its dashboard', async () => {
    vi.mocked(signInBrand).mockResolvedValue({
      category: 'SaaS',
      companyName: 'Northstar Labs',
      email: 'team@northstar.example',
      isComplete: true,
      userId: 'f7f0b799-8a34-47a8-b1b7-0283def9dcaa',
      website: 'https://northstar.example',
    })
    renderLoginPage()

    fireEvent.change(screen.getByLabelText('Work email'), { target: { value: 'team@northstar.example' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'securepass' } })
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByText('Brand dashboard')).toBeInTheDocument()
  })
})
