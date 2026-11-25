import type { ReactElement, ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface ProfileOnboardingShellProps {
  children: ReactNode
  description: string
  eyebrow: string
  title: string
}

/**
 * Renders a centered full-screen shell for authenticated profile collection.
 * @param props - The onboarding heading, description, and form content.
 * @returns A responsive single-panel onboarding screen.
 */
export function ProfileOnboardingShell({
  children,
  description,
  eyebrow,
  title,
}: ProfileOnboardingShellProps): ReactElement {
  return (
    <main className="profile-onboarding-page">
      <div className="profile-onboarding-page__orb" aria-hidden="true" />
      <section className="profile-onboarding-card" aria-labelledby="profile-onboarding-title">
        <Link className="wordmark profile-onboarding-card__wordmark" to="/" aria-label="Prich home">
          <span aria-hidden="true" className="wordmark__mark">P</span>
          <span>Prich</span>
        </Link>
        <div className="profile-onboarding-card__heading">
          <p className="eyebrow">{eyebrow}</p>
          <h1 id="profile-onboarding-title">{title}</h1>
          <p>{description}</p>
        </div>
        {children}
      </section>
    </main>
  )
}
