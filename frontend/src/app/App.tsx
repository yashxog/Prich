import { useState } from 'react'
import type { ApiHealth } from '@prich/shared'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

type ApiStatus = 'idle' | 'loading' | 'online' | 'offline'

function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('idle')

  async function checkApi() {
    setApiStatus('loading')

    try {
      const response = await fetch(`${apiUrl}/api/health`)

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }

      const health: ApiHealth = await response.json()
      setApiStatus(health.status === 'ok' ? 'online' : 'offline')
    } catch {
      setApiStatus('offline')
    }
  }

  return (
    <main className="shell">
      <section className="card" aria-labelledby="page-title">
        <p className="eyebrow">Vite · React · TypeScript</p>
        <h1 id="page-title">Prich is ready.</h1>
        <p className="intro">
          Your frontend, backend, and shared types are separated for clean development and independent deployment.
        </p>

        <div className="actions">
          <button type="button" onClick={checkApi} disabled={apiStatus === 'loading'}>
            {apiStatus === 'loading' ? 'Checking…' : 'Check API'}
          </button>
          <output className={`status status--${apiStatus}`} aria-live="polite">
            {apiStatus === 'idle' ? 'Not checked' : apiStatus}
          </output>
        </div>
      </section>
    </main>
  )
}

export default App
