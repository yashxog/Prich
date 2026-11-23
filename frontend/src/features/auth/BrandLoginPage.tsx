import { useState, type ChangeEvent, type FormEvent, type ReactElement } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthShell } from './AuthShell'
import { GoogleAuthButton } from './GoogleAuthButton'
import { signInBrand, signInBrandWithGoogle } from './brand_auth.service'

interface LoginFormState {
  email: string
  password: string
}

/**
 * Converts an unknown login error into safe user-facing copy.
 * @param error - The value thrown by the authentication service.
 * @returns A safe authentication error message.
 */
function getLoginErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message === 'Invalid login credentials') {
    return 'Email or password is incorrect.'
  }

  return error instanceof Error ? error.message : 'We could not log you in. Please try again.'
}

/**
 * Renders brand login with email/password and Google OAuth.
 * @returns The brand login page.
 */
export function BrandLoginPage(): ReactElement {
  const navigate = useNavigate()
  const [form, setForm] = useState<LoginFormState>({ email: '', password: '' })
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Updates a brand login field.
   * @param event - The changed login input.
   * @returns Nothing.
   */
  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    const fieldName = event.currentTarget.name as keyof LoginFormState
    const fieldValue = event.currentTarget.value
    setForm((currentForm) => ({ ...currentForm, [fieldName]: fieldValue }))
  }

  /**
   * Authenticates a brand and routes it to onboarding or its workspace.
   * @param event - The login form submission event.
   * @returns A promise resolved after authentication completes.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const profile = await signInBrand(form.email.trim(), form.password)
      navigate(profile.isComplete ? '/brand/dashboard' : '/brand/onboarding', { replace: true })
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error))
      setIsSubmitting(false)
    }
  }

  /**
   * Starts brand login through Google.
   * @returns A promise resolved when the OAuth redirect begins or fails.
   */
  async function handleGoogleLogin(): Promise<void> {
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await signInBrandWithGoogle()
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error))
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      accountType="brand"
      description="Access your company profile, creator shortlist, and active campaigns."
      eyebrow="Brand login"
      title="Welcome back"
    >
      <GoogleAuthButton disabled={isSubmitting} onClick={handleGoogleLogin} />
      <div className="auth-divider"><span>or continue with email</span></div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Work email</span>
          <input autoComplete="email" inputMode="email" name="email" onChange={handleInputChange} required type="email" value={form.email} />
        </label>
        <label className="form-field">
          <span>Password</span>
          <input autoComplete="current-password" name="password" onChange={handleInputChange} required type="password" value={form.password} />
        </label>

        {errorMessage ? <p className="form-error" role="alert">{errorMessage}</p> : null}
        <button className="button button--primary auth-submit" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="auth-switch">New to Prich? <Link to="/brand/signup">Create a brand account</Link></p>
    </AuthShell>
  )
}
