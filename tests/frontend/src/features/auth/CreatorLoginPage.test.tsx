import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CreatorLoginPage } from '../../../../../frontend/src/features/auth/CreatorLoginPage'
import { signInCreator, signInCreatorWithGoogle } from '../../../../../frontend/src/features/auth/auth.service'

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
    vi.mocked(signInCreator).mockResolvedValue()
    renderLoginPage()

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'asha@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'securepass' } })
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }))

    await waitFor(() => expect(signInCreator).toHaveBeenCalledWith('asha@example.com', 'securepass'))
    expect(await screen.findByText('Creator dashboard')).toBeInTheDocument()
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
