import { useEffect, useState, type ReactElement } from 'react'
import type { CreatorProfile } from '@prich/shared'
import { useNavigate } from 'react-router-dom'
import { ApiRequestError } from '../../services/api_client'
import { getCreatorProfile, signOutCreator } from './auth.service'

type DashboardState =
  | { status: 'loading' }
  | { message: string; status: 'error' }
  | { profile: CreatorProfile; status: 'ready' }

/**
 * Renders the protected creator dashboard entry screen.
 * @returns A creator profile summary or authentication loading state.
 */
export function CreatorDashboardPage(): ReactElement {
  const navigate = useNavigate()
  const [dashboardState, setDashboardState] = useState<DashboardState>({ status: 'loading' })

  useEffect(() => {
    /**
     * Loads the backend-authorized creator profile.
     * @returns A promise resolved after dashboard initialization.
     */
    async function loadDashboard(): Promise<void> {
      try {
        const profile = await getCreatorProfile()
        setDashboardState({ profile, status: 'ready' })
      } catch (error) {
        if (error instanceof ApiRequestError && error.status === 401) {
          navigate('/creator/login', { replace: true })
          return
        }

        setDashboardState({
          message: error instanceof Error ? error.message : 'Your creator profile could not be loaded.',
          status: 'error',
        })
      }
    }

    void loadDashboard()
  }, [navigate])

  /**
   * Signs the creator out and returns to the login page.
   * @returns A promise resolved after sign-out navigation.
   */
  async function handleSignOut(): Promise<void> {
    await signOutCreator()
    navigate('/creator/login', { replace: true })
  }

  if (dashboardState.status === 'loading') {
    return (
      <main className="callback-page">
        <div className="callback-card" role="status">
          <span aria-hidden="true" className="auth-spinner" />
          <h1>Loading your workspace</h1>
        </div>
      </main>
    )
  }

  if (dashboardState.status === 'error') {
    return (
      <main className="callback-page">
        <div className="callback-card" role="alert">
          <span aria-hidden="true" className="callback-card__mark callback-card__mark--error">!</span>
          <h1>Profile unavailable</h1>
          <p>{dashboardState.message}</p>
          <button className="button button--secondary" onClick={handleSignOut} type="button">Log out</button>
        </div>
      </main>
    )
  }

  const { profile } = dashboardState

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <a className="wordmark" href="/" aria-label="Prich home">
          <span aria-hidden="true" className="wordmark__mark">P</span>
          <span>Prich</span>
        </a>
        <button className="button button--secondary" onClick={handleSignOut} type="button">Log out</button>
      </header>
      <section className="dashboard-welcome" aria-labelledby="dashboard-title">
        <p className="eyebrow">Creator workspace</p>
        <h1 id="dashboard-title">Welcome, {profile.firstName || 'Creator'}.</h1>
        <p>Your account is ready. Next, we will build your public creator profile and connect your social analytics.</p>
        <dl className="profile-summary">
          <div><dt>Email</dt><dd>{profile.email}</dd></div>
          <div><dt>LinkedIn connected</dt><dd>{profile.isLinkedInAttached ? 'Yes' : 'Not yet'}</dd></div>
          <div><dt>X connected</dt><dd>{profile.isXAttached ? 'Yes' : 'Not yet'}</dd></div>
        </dl>
      </section>
    </main>
  )
}
