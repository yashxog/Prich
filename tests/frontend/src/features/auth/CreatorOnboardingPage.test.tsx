import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CreatorOnboardingPage } from '../../../../../frontend/src/features/auth/CreatorOnboardingPage'
import {
  getCreatorProfile,
  updateCreatorProfile,
} from '../../../../../frontend/src/features/auth/auth.service'

vi.mock('../../../../../frontend/src/features/auth/auth.service', () => ({
  getCreatorProfile: vi.fn(),
  updateCreatorProfile: vi.fn(),
}))

const INCOMPLETE_PROFILE = {
  bio: '',
  country: '',
  displayName: 'Asha Rao',
  email: 'asha@example.com',
  firstName: 'Asha',
  isComplete: false,
  isLinkedInAttached: false,
  isPhoneVerified: false,
  isXAttached: false,
  lastName: 'Rao',
  niche: '',
  phoneNumber: '',
  userId: '7841d8d6-7a6c-42d0-bbd2-aea16431a112',
} as const

describe('CreatorOnboardingPage', () => {
  beforeEach(() => {
    vi.mocked(getCreatorProfile).mockReset()
    vi.mocked(updateCreatorProfile).mockReset()
  })

  it('stores creator details with an optional unverified phone number', async () => {
    vi.mocked(getCreatorProfile).mockResolvedValue(INCOMPLETE_PROFILE)
    vi.mocked(updateCreatorProfile).mockResolvedValue({
      ...INCOMPLETE_PROFILE,
      bio: 'I explain fintech products.',
      country: 'India',
      isComplete: true,
      isPhoneVerified: false,
      niche: 'Fintech',
      phoneNumber: '+919876543210',
    })

    const { container } = render(
      <MemoryRouter initialEntries={['/creator/onboarding']}>
        <Routes>
          <Route path="/creator/onboarding" element={<CreatorOnboardingPage />} />
          <Route path="/creator/dashboard" element={<p>Creator dashboard</p>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByDisplayValue('Asha Rao')).toBeInTheDocument()
    expect(container.querySelector('.profile-onboarding-page')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Country code'), { target: { value: '+91' } })
    fireEvent.change(screen.getByLabelText('National number'), { target: { value: '9876543210' } })
    fireEvent.change(screen.getByLabelText(/^Country of residence/), { target: { value: 'India' } })
    fireEvent.change(screen.getByLabelText('Niche'), { target: { value: 'Fintech' } })
    fireEvent.change(screen.getByLabelText(/Bio/), { target: { value: 'I explain fintech products.' } })
    expect(screen.getByRole('option', { name: '🇮🇳 India (+91)' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '🇮🇳 India', selected: true })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }))

    await waitFor(() => expect(updateCreatorProfile).toHaveBeenCalledWith({
      bio: 'I explain fintech products.',
      country: 'India',
      displayName: 'Asha Rao',
      niche: 'Fintech',
      phoneNumber: '+919876543210',
    }))
    expect(await screen.findByText('Creator dashboard')).toBeInTheDocument()
  })

  it('allows onboarding without a phone number', async () => {
    vi.mocked(getCreatorProfile).mockResolvedValue(INCOMPLETE_PROFILE)
    vi.mocked(updateCreatorProfile).mockResolvedValue({
      ...INCOMPLETE_PROFILE,
      country: 'India',
      isComplete: true,
      niche: 'Fintech',
    })

    render(
      <MemoryRouter initialEntries={['/creator/onboarding']}>
        <Routes>
          <Route path="/creator/onboarding" element={<CreatorOnboardingPage />} />
          <Route path="/creator/dashboard" element={<p>Creator dashboard</p>} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.change(await screen.findByLabelText(/^Country of residence/), { target: { value: 'India' } })
    fireEvent.change(screen.getByLabelText('Niche'), { target: { value: 'Fintech' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }))

    await waitFor(() => expect(updateCreatorProfile).toHaveBeenCalledWith({
      bio: '',
      country: 'India',
      displayName: 'Asha Rao',
      niche: 'Fintech',
      phoneNumber: '',
    }))
    expect(await screen.findByText('Creator dashboard')).toBeInTheDocument()
  })

  it('rejects a partially entered phone number', async () => {
    vi.mocked(getCreatorProfile).mockResolvedValue(INCOMPLETE_PROFILE)

    render(
      <MemoryRouter initialEntries={['/creator/onboarding']}>
        <CreatorOnboardingPage />
      </MemoryRouter>,
    )

    fireEvent.change(await screen.findByLabelText('Country code'), { target: { value: '+91' } })
    fireEvent.change(screen.getByLabelText(/^Country of residence/), { target: { value: 'India' } })
    fireEvent.change(screen.getByLabelText('Niche'), { target: { value: 'Fintech' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('both a country code and a valid national phone number')
    expect(updateCreatorProfile).not.toHaveBeenCalled()
  })
})
