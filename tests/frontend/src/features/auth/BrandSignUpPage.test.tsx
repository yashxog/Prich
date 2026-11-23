import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BrandSignUpPage } from '../../../../../frontend/src/features/auth/BrandSignUpPage'
import { signInBrandWithGoogle, signUpBrand } from '../../../../../frontend/src/features/auth/brand_auth.service'

vi.mock('../../../../../frontend/src/features/auth/brand_auth.service', () => ({
  signInBrandWithGoogle: vi.fn(),
  signUpBrand: vi.fn(),
}))

/**
 * Renders brand signup with an onboarding destination.
 * @returns Nothing.
 */
function renderSignUpPage(): void {
  render(
    <MemoryRouter initialEntries={['/brand/signup']}>
      <Routes>
        <Route path="/brand/signup" element={<BrandSignUpPage />} />
        <Route path="/brand/onboarding" element={<p>Company onboarding</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('BrandSignUpPage', () => {
  beforeEach(() => {
    vi.mocked(signInBrandWithGoogle).mockReset()
    vi.mocked(signUpBrand).mockReset()
  })

  it('creates an email identity before asking for company details', async () => {
    vi.mocked(signUpBrand).mockResolvedValue({ requiresEmailConfirmation: false })
    renderSignUpPage()

    expect(screen.queryByLabelText('Company name')).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Work email'), { target: { value: 'team@northstar.example' } })
    fireEvent.change(screen.getByLabelText(/^Password/), { target: { value: 'securepass' } })
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'securepass' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create brand account' }))

    await waitFor(() => expect(signUpBrand).toHaveBeenCalledWith({
      email: 'team@northstar.example',
      password: 'securepass',
    }))
    expect(await screen.findByText('Company onboarding')).toBeInTheDocument()
  })

  it('starts Google authentication for a brand', async () => {
    vi.mocked(signInBrandWithGoogle).mockResolvedValue()
    renderSignUpPage()

    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }))

    await waitFor(() => expect(signInBrandWithGoogle).toHaveBeenCalledOnce())
  })
})
