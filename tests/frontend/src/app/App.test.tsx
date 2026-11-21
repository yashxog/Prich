import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from '../../../../frontend/src/app/App'

describe('App', () => {
  it('renders the starter screen', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Prich is ready.' })).toBeInTheDocument()
    expect(screen.getByText('Not checked')).toBeInTheDocument()
  })

  it('shows the API as online after a successful health check', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok', service: 'prich-api', timestamp: new Date().toISOString() }),
    }))

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Check API' }))

    expect(await screen.findByText('online')).toBeInTheDocument()
  })
})
