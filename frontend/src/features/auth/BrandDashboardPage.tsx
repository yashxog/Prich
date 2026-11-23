import { useEffect, useState, type ReactElement } from 'react'
import type { BrandProfile } from '@prich/shared'
import { useNavigate } from 'react-router-dom'
import { ApiRequestError } from '../../services/api_client'
import { getBrandProfile, signOutBrand } from './brand_auth.service'

type DashboardState =
  | { status: 'loading' }
  | { message: string; status: 'error' }
  | { profile: BrandProfile; status: 'ready' }

/**
 * Renders the protected brand dashboard entry screen.
 * @returns A brand profile summary or authentication loading state.
 */
export function BrandDashboardPage(): ReactElement {
  const navigate = useNavigate()
  const [dashboardState, setDashboardState] = useState<DashboardState>({ status: 'loading' })

  useEffect(() => {
    /**
     * Loads the backend-authorized brand profile.
     * @returns A promise resolved after dashboard initialization.
     */
    async function loadDashboard(): Promise<void> {
      try {
        const profile = await getBrandProfile()

        if (!profile.isComplete) {
          navigate('/brand/onboarding', { replace: true })
          return
        }

        setDashboardState({ profile, status: 'ready' })
      } catch (error) {
        if (error instanceof ApiRequestError && error.status === 401) {
          navigate('/brand/login', { replace: true })
          return
        }

        setDashboardState({
          message: error instanceof Error ? error.message : 'Your brand profile could not be loaded.',
          status: 'error',
        })
      }
    }

    void loadDashboard()
  }, [navigate])

  /**
   * Signs the brand out and returns to the login page.
   * @returns A promise resolved after sign-out navigation.
   */
  async function handleSignOut(): Promise<void> {
    await signOutBrand()
    navigate('/brand/login', { replace: true })
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
        <p className="eyebrow">Brand workspace</p>
        <h1 id="dashboard-title">Welcome, {profile.companyName}.</h1>
        <p>Your company profile is ready. Next, you can discover creators and begin shaping your first campaign.</p>
        <dl className="profile-summary profile-summary--brand">
          <div><dt>Work email</dt><dd>{profile.email}</dd></div>
          <div><dt>Website</dt><dd><a href={profile.website} rel="noreferrer" target="_blank">{profile.website}</a></dd></div>
          <div><dt>Category</dt><dd>{profile.category}</dd></div>
        </dl>
      </section>
    </main>
  )
}
