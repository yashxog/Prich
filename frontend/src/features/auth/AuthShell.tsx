import type { ReactElement, ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface AuthShellProps {
  accountType?: 'brand' | 'creator'
  children: ReactNode
  description: string
  eyebrow: string
  title: string
}

/**
 * Renders the shared creator authentication page shell.
 * @param props - Page copy and the authentication form content.
 * @returns A responsive, accessible authentication layout.
 */
export function AuthShell({
  accountType = 'creator',
  children,
  description,
  eyebrow,
  title,
}: AuthShellProps): ReactElement {
  const isBrand = accountType === 'brand'

  return (
    <main className="auth-page">
      <section className="auth-story" aria-labelledby="auth-story-title">
        <Link className="wordmark wordmark--light" to="/" aria-label="Prich home">
          <span aria-hidden="true" className="wordmark__mark wordmark__mark--light">P</span>
          <span>Prich</span>
        </Link>
        <div className="auth-story__copy">
          <p className="auth-story__eyebrow">{isBrand ? 'Brand workspace' : 'Creator workspace'}</p>
          <h2 id="auth-story-title">
            {isBrand ? 'Find the right voice for every story.' : 'Your work deserves a clearer way to grow.'}
          </h2>
          <p>
            {isBrand
              ? 'Discover trusted creators, shape clear briefs, and manage partnerships from first message to final post.'
              : 'Build a trusted profile, package your services, and manage every brand collaboration from one place.'}
          </p>
        </div>
        <p className="auth-story__footer">
          {isBrand ? 'Verified creators · Clear terms · Measurable work' : 'Protected identity · Clear terms · Reliable payouts'}
        </p>
      </section>

      <section className="auth-panel" aria-labelledby="auth-title">
        <div className="auth-panel__content">
          <Link className="auth-back-link" to="/">← Back to home</Link>
          <p className="eyebrow auth-eyebrow">{eyebrow}</p>
          <h1 className="auth-title" id="auth-title">{title}</h1>
          <p className="auth-description">{description}</p>
          {children}
        </div>
      </section>
    </main>
  )
}
