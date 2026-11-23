import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from '../../../../frontend/src/app/App'

/**
 * Renders the application at a deterministic in-memory route.
 * @param path - The initial application path.
 * @returns Nothing.
 */
function renderApp(path = '/'): void {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App', () => {
  it('renders the role-based onboarding entry point', () => {
    renderApp()

    expect(screen.getByRole('heading', { name: /find the right voice/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'How will you use Prich?' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /I represent a brand/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /I am a creator/i })).toBeInTheDocument()
  })

  it('keeps the continue action disabled until a role is selected', () => {
    renderApp()

    const continueButton = screen.getByRole('button', { name: /choose a path to continue/i })
    expect(continueButton).toBeDisabled()

    fireEvent.click(screen.getByRole('radio', { name: /I represent a brand/i }))

    expect(screen.getByRole('button', { name: /continue as a brand/i })).toBeEnabled()
  })

  it('takes new creators to their dedicated signup page', () => {
    renderApp()

    fireEvent.click(screen.getByRole('radio', { name: /I am a creator/i }))
    fireEvent.click(screen.getByRole('button', { name: /continue as a creator/i }))

    expect(screen.getByRole('heading', { name: 'Create your creator account' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/creator/login')
  })

  it('takes new brands to an email or Google signup before company details', () => {
    renderApp()

    fireEvent.click(screen.getByRole('radio', { name: /I represent a brand/i }))
    fireEvent.click(screen.getByRole('button', { name: /continue as a brand/i }))

    expect(screen.getByRole('heading', { name: 'Create your brand account' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/brand/login')
    expect(screen.queryByLabelText('Company name')).not.toBeInTheDocument()
  })
})
