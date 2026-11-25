import { useState, type ChangeEvent, type FormEvent, type ReactElement } from 'react'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { AuthCallbackPage } from '../features/auth/AuthCallbackPage'
import { BrandLoginPage } from '../features/auth/BrandLoginPage'
import { BrandOnboardingPage } from '../features/auth/BrandOnboardingPage'
import { BrandSignUpPage } from '../features/auth/BrandSignUpPage'
import { CreatorLoginPage } from '../features/auth/CreatorLoginPage'
import { CreatorSignUpPage } from '../features/auth/CreatorSignUpPage'
import { BrandMarketplacePage } from '../features/marketplace/BrandMarketplacePage'
import { CreatorMarketplacePage } from '../features/marketplace/CreatorMarketplacePage'

type AccountRole = 'brand' | 'creator'

interface RoleOption {
  description: string
  eyebrow: string
  title: string
  value: AccountRole
}

interface RoleOptionCardProps {
  isSelected: boolean
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  option: RoleOption
}

const ROLE_OPTIONS = [
  {
    value: 'brand',
    eyebrow: 'I represent a brand',
    title: 'Find creators who fit',
    description: 'Discover trusted voices, agree on terms, and manage campaigns in one place.',
  },
  {
    value: 'creator',
    eyebrow: 'I am a creator',
    title: 'Turn influence into work',
    description: 'Show your best work, set your pricing, and collaborate with quality brands.',
  },
] as const satisfies readonly RoleOption[]

/**
 * Renders a compact check icon for benefit lists.
 * @returns A decorative SVG check icon.
 */
function CheckIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="check-icon" viewBox="0 0 20 20">
      <path d="m5 10.4 3 3L15.5 6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
    </svg>
  )
}

/**
 * Renders a role-specific outline icon for an account option.
 * @param role - The account role represented by the icon.
 * @returns A decorative SVG icon for the selected role family.
 */
function RoleIcon({ role }: { role: AccountRole }): ReactElement {
  if (role === 'brand') {
    return (
      <svg aria-hidden="true" className="role-option__icon" viewBox="0 0 24 24">
        <path d="M5 19V8.5L12 5l7 3.5V19M9 19v-5h6v5M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01" />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" className="role-option__icon" viewBox="0 0 24 24">
      <path d="M12 13.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5.5 20c.7-3.1 3-4.8 6.5-4.8s5.8 1.7 6.5 4.8M18.3 6.2l.5-1.3.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5Z" />
    </svg>
  )
}

/**
 * Renders the application wordmark.
 * @returns The Prich logo and product name.
 */
function Wordmark(): ReactElement {
  return (
    <a className="wordmark" href="#top" aria-label="Prich home">
      <span aria-hidden="true" className="wordmark__mark">P</span>
      <span>Prich</span>
    </a>
  )
}

/**
 * Renders one selectable account-role card.
 * @param props - The role content, selection state, and change handler.
 * @returns A labelled native radio control styled as a card.
 */
function RoleOptionCard({ isSelected, onChange, option }: RoleOptionCardProps): ReactElement {
  return (
    <label className="role-option">
      <input
        checked={isSelected}
        name="account-role"
        onChange={onChange}
        type="radio"
        value={option.value}
      />
      <span className={`role-option__visual role-option__visual--${option.value}`} aria-hidden="true">
        <RoleIcon role={option.value} />
      </span>
      <span className="role-option__copy">
        <span className="role-option__eyebrow">{option.eyebrow}</span>
        <strong>{option.title}</strong>
        <span>{option.description}</span>
      </span>
      <span className="role-option__control" aria-hidden="true" />
    </label>
  )
}

/**
 * Renders the landing page and first role-selection step.
 * @returns The Prich landing page.
 */
function LandingPage(): ReactElement {
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState<AccountRole | null>(null)

  /**
   * Advances the onboarding preview for the selected account role.
   * @param event - The role-selection form submission event.
   * @returns Nothing.
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()

    if (selectedRole === 'creator') {
      navigate('/creator/signup')
      return
    }

    if (selectedRole === 'brand') {
      navigate('/brand/signup')
    }
  }

  /**
   * Updates the selected account role from its native radio input.
   * @param event - The changed role radio input.
   * @returns Nothing.
   */
  function handleRoleChange(event: ChangeEvent<HTMLInputElement>): void {
    setSelectedRole(event.currentTarget.value as AccountRole)
  }

  return (
    <div className="app" id="top">
      <a className="skip-link" href="#main-content">Skip to main content</a>

      <header className="site-header">
        <Wordmark />
        <nav aria-label="Primary navigation" className="site-nav">
          <a href="#how-it-works">How it works</a>
          <a href="#trust">Why Prich</a>
        </nav>
        <div className="header-actions">
          <Link className="button button--secondary" to="/creator/login">Log in</Link>
          <Link className="button button--primary" to="/creator/signup">Sign up</Link>
        </div>
      </header>

      <main className="hero" id="main-content">
        <section className="hero__content" aria-labelledby="hero-title">
          <p className="eyebrow">Creator partnerships, without the chaos</p>
          <h1 id="hero-title">Find the right voice.<br />Ship the right story.</h1>
          <p className="hero__intro">
            Prich gives brands and creators one trusted place to discover, agree, create, approve, and get paid.
          </p>

          <ul className="benefit-list" id="trust">
            <li><CheckIcon />Verified creator profiles and performance</li>
            <li><CheckIcon />Clear packages, offers, and approvals</li>
            <li><CheckIcon />Protected payments from brief to post</li>
          </ul>

          <div className="trust-note" aria-label="Product focus">
            <span className="trust-note__avatars" aria-hidden="true">
              <span>A</span><span>K</span><span>M</span>
            </span>
            <p><strong>Built for focused partnerships</strong><br />Starting with LinkedIn and X creators.</p>
          </div>
        </section>

        <section className="onboarding-card" id="how-it-works" aria-labelledby="onboarding-title">
          <div className="onboarding-card__heading">
            <span className="step-label">Step 1 of 3</span>
            <h2 id="onboarding-title">How will you use Prich?</h2>
            <p>Choose your path. You can add a team or update your profile later.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <fieldset className="role-options">
              <legend className="sr-only">Choose an account type</legend>
              <RoleOptionCard
                isSelected={selectedRole === ROLE_OPTIONS[0].value}
                onChange={handleRoleChange}
                option={ROLE_OPTIONS[0]}
              />
              <RoleOptionCard
                isSelected={selectedRole === ROLE_OPTIONS[1].value}
                onChange={handleRoleChange}
                option={ROLE_OPTIONS[1]}
              />
            </fieldset>

            <button className="button button--primary continue-button" disabled={!selectedRole} type="submit">
              {selectedRole ? `Continue as ${selectedRole === 'brand' ? 'a brand' : 'a creator'}` : 'Choose a path to continue'}
              <span aria-hidden="true">→</span>
            </button>
            <p className="legal-copy">By continuing, you agree to our Terms and Privacy Policy.</p>
          </form>
        </section>
      </main>

      <footer className="site-footer">
        <p>© 2026 Prich</p>
        <p>A clearer way to work together.</p>
      </footer>
    </div>
  )
}

/**
 * Routes the public landing and account-specific authentication and workspace pages.
 * @returns The Prich application route tree.
 */
function App(): ReactElement {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/creator/signup" element={<CreatorSignUpPage />} />
      <Route path="/creator/login" element={<CreatorLoginPage />} />
      <Route path="/creator/dashboard" element={<CreatorMarketplacePage />} />
      <Route path="/brand/signup" element={<BrandSignUpPage />} />
      <Route path="/brand/login" element={<BrandLoginPage />} />
      <Route path="/brand/onboarding" element={<BrandOnboardingPage />} />
      <Route path="/brand/dashboard" element={<BrandMarketplacePage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  )
}

export default App
