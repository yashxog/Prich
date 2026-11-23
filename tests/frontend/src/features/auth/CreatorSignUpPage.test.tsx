import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CreatorSignUpPage } from '../../../../../frontend/src/features/auth/CreatorSignUpPage'
import { signInCreatorWithGoogle, signUpCreator } from '../../../../../frontend/src/features/auth/auth.service'

vi.mock('../../../../../frontend/src/features/auth/auth.service', () => ({
  signInCreatorWithGoogle: vi.fn(),
  signUpCreator: vi.fn(),
}))

/**
 * Renders creator signup inside a router.
 * @returns Nothing.
 */
function renderSignUpPage(): void {
  render(
    <MemoryRouter>
      <CreatorSignUpPage />
    </MemoryRouter>,
  )
}

describe('CreatorSignUpPage', () => {
  beforeEach(() => {
    vi.mocked(signInCreatorWithGoogle).mockReset()
    vi.mocked(signUpCreator).mockReset()
  })

  it('submits creator identity details and shows email confirmation', async () => {
    vi.mocked(signUpCreator).mockResolvedValue({ requiresEmailConfirmation: true })
    renderSignUpPage()

    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Asha' } })
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Rao' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'asha@example.com' } })
    fireEvent.change(screen.getByLabelText(/^Password/), { target: { value: 'securepass' } })
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'securepass' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create creator account' }))

    await waitFor(() => {
      expect(signUpCreator).toHaveBeenCalledWith({
        email: 'asha@example.com',
        firstName: 'Asha',
        lastName: 'Rao',
        password: 'securepass',
      })
    })
    expect(await screen.findByText('Check your email')).toBeInTheDocument()
  })

  it('starts Google authentication from the signup page', async () => {
    vi.mocked(signInCreatorWithGoogle).mockResolvedValue()
    renderSignUpPage()

    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }))

    await waitFor(() => expect(signInCreatorWithGoogle).toHaveBeenCalledOnce())
  })

  it('prevents submission when passwords do not match', async () => {
    renderSignUpPage()

    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Asha' } })
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Rao' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'asha@example.com' } })
    fireEvent.change(screen.getByLabelText(/^Password/), { target: { value: 'securepass' } })
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'differentpass' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create creator account' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Passwords do not match.')
    expect(signUpCreator).not.toHaveBeenCalled()
  })
})
