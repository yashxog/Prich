import { useState, type ChangeEvent, type FormEvent, type ReactElement } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthShell } from './AuthShell'
import { GoogleAuthButton } from './GoogleAuthButton'
import { signInCreator, signInCreatorWithGoogle } from './auth.service'

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
 * Renders creator login with email/password and Google OAuth.
 * @returns The creator login page.
 */
export function CreatorLoginPage(): ReactElement {
  const navigate = useNavigate()
  const [form, setForm] = useState<LoginFormState>({ email: '', password: '' })
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Updates a creator login field.
   * @param event - The changed login input.
   * @returns Nothing.
   */
  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    const fieldName = event.currentTarget.name as keyof LoginFormState
    const fieldValue = event.currentTarget.value
    setForm((currentForm) => ({ ...currentForm, [fieldName]: fieldValue }))
  }

  /**
   * Authenticates a creator with email and password.
   * @param event - The login form submission event.
   * @returns A promise resolved after authentication completes.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await signInCreator(form.email.trim(), form.password)
      navigate('/creator/dashboard', { replace: true })
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error))
      setIsSubmitting(false)
    }
  }

  /**
   * Starts creator login through Google.
   * @returns A promise resolved when the OAuth redirect begins or fails.
   */
  async function handleGoogleLogin(): Promise<void> {
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await signInCreatorWithGoogle()
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error))
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      description="Log in to manage your creator profile, offers, campaigns, and payouts."
      eyebrow="Creator login"
      title="Welcome back"
    >
      <GoogleAuthButton disabled={isSubmitting} onClick={handleGoogleLogin} />
      <div className="auth-divider"><span>or continue with email</span></div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Email</span>
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

      <p className="auth-switch">New to Prich? <Link to="/creator/signup">Create a creator account</Link></p>
    </AuthShell>
  )
}
