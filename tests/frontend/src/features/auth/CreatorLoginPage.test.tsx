import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CreatorLoginPage } from '../../../../../frontend/src/features/auth/CreatorLoginPage'
import { signInCreator, signInCreatorWithGoogle } from '../../../../../frontend/src/features/auth/auth.service'

const COMPLETE_PROFILE = {
  bio: '',
  country: 'India',
  displayName: 'Asha Rao',
  email: 'asha@example.com',
  firstName: 'Asha',
  isComplete: true,
  isLinkedInAttached: false,
  isPhoneVerified: true,
  isXAttached: false,
  lastName: 'Rao',
  niche: 'Fintech',
  phoneNumber: '+919876543210',
  userId: '7841d8d6-7a6c-42d0-bbd2-aea16431a112',
} as const

vi.mock('../../../../../frontend/src/features/auth/auth.service', () => ({
  signInCreator: vi.fn(),
  signInCreatorWithGoogle: vi.fn(),
}))

/**
 * Renders creator login with a dashboard destination.
 * @returns Nothing.
 */
function renderLoginPage(): void {
  render(
    <MemoryRouter initialEntries={['/creator/login']}>
      <Routes>
        <Route path="/creator/login" element={<CreatorLoginPage />} />
        <Route path="/creator/onboarding" element={<p>Creator onboarding</p>} />
        <Route path="/creator/dashboard" element={<p>Creator dashboard</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('CreatorLoginPage', () => {
  beforeEach(() => {
    vi.mocked(signInCreator).mockReset()
    vi.mocked(signInCreatorWithGoogle).mockReset()
  })

  it('logs a creator in and navigates to the dashboard', async () => {
    vi.mocked(signInCreator).mockResolvedValue(COMPLETE_PROFILE)
    renderLoginPage()

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'asha@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'securepass' } })
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }))

    await waitFor(() => expect(signInCreator).toHaveBeenCalledWith('asha@example.com', 'securepass'))
    expect(await screen.findByText('Creator dashboard')).toBeInTheDocument()
  })

  it('sends an incomplete creator to profile onboarding', async () => {
    vi.mocked(signInCreator).mockResolvedValue({ ...COMPLETE_PROFILE, isComplete: false })
    renderLoginPage()

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'asha@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'securepass' } })
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByText('Creator onboarding')).toBeInTheDocument()
  })

  it('shows a safe error for invalid credentials', async () => {
    vi.mocked(signInCreator).mockRejectedValue(new Error('Invalid login credentials'))
    renderLoginPage()

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'asha@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpass' } })
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Email or password is incorrect.')
  })
})
