import { useState, type ChangeEvent, type FormEvent, type ReactElement } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthShell } from './AuthShell'
import { GoogleAuthButton } from './GoogleAuthButton'
import { signInCreatorWithGoogle, signUpCreator } from './auth.service'

interface SignUpFormState {
  confirmPassword: string
  email: string
  firstName: string
  lastName: string
  password: string
}

const EMPTY_FORM: SignUpFormState = {
  confirmPassword: '',
  email: '',
  firstName: '',
  lastName: '',
  password: '',
}

/**
 * Converts an unknown authentication error into safe user-facing copy.
 * @param error - The value thrown by the authentication service.
 * @returns A useful error message without exposing credentials.
 */
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'We could not create your account. Please try again.'
}

/**
 * Renders creator registration with email/password and Google OAuth.
 * @returns The creator signup page.
 */
export function CreatorSignUpPage(): ReactElement {
  const navigate = useNavigate()
  const [form, setForm] = useState<SignUpFormState>(EMPTY_FORM)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requiresEmailConfirmation, setRequiresEmailConfirmation] = useState(false)

  /**
   * Updates a creator registration field.
   * @param event - The changed form input.
   * @returns Nothing.
   */
  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    const fieldName = event.currentTarget.name as keyof SignUpFormState
    const fieldValue = event.currentTarget.value
    setForm((currentForm) => ({ ...currentForm, [fieldName]: fieldValue }))
  }

  /**
   * Creates the creator account and advances to confirmation or dashboard.
   * @param event - The signup form submission event.
   * @returns A promise resolved after signup handling completes.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setErrorMessage('')

    if (form.password !== form.confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await signUpCreator({
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        password: form.password,
      })

      if (result.requiresEmailConfirmation) {
        setRequiresEmailConfirmation(true)
      } else {
        navigate('/creator/onboarding', { replace: true })
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Starts creator registration through Google.
   * @returns A promise resolved when the OAuth redirect begins or fails.
   */
  async function handleGoogleSignUp(): Promise<void> {
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await signInCreatorWithGoogle()
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      description="Start with your identity. Social profiles and analytics are connected after account creation."
      eyebrow="New creator"
      title="Create your creator account"
    >
      {requiresEmailConfirmation ? (
        <div className="auth-notice auth-notice--success" role="status">
          <strong>Check your email</strong>
          <p>We sent a confirmation link to <span>{form.email}</span>. Open it to finish creating your account.</p>
          <Link to="/creator/login">Return to login</Link>
        </div>
      ) : (
        <>
          <GoogleAuthButton disabled={isSubmitting} onClick={handleGoogleSignUp} />
          <div className="auth-divider"><span>or continue with email</span></div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label className="form-field">
                <span>First name</span>
                <input autoComplete="given-name" name="firstName" onChange={handleInputChange} required value={form.firstName} />
              </label>
              <label className="form-field">
                <span>Last name</span>
                <input autoComplete="family-name" name="lastName" onChange={handleInputChange} required value={form.lastName} />
              </label>
            </div>
            <label className="form-field">
              <span>Email</span>
              <input autoComplete="email" inputMode="email" name="email" onChange={handleInputChange} required type="email" value={form.email} />
            </label>
            <label className="form-field">
              <span>Password</span>
              <input autoComplete="new-password" minLength={8} name="password" onChange={handleInputChange} required type="password" value={form.password} />
              <small>Use at least 8 characters.</small>
            </label>
            <label className="form-field">
              <span>Confirm password</span>
              <input autoComplete="new-password" minLength={8} name="confirmPassword" onChange={handleInputChange} required type="password" value={form.confirmPassword} />
            </label>

            {errorMessage ? <p className="form-error" role="alert">{errorMessage}</p> : null}
            <button className="button button--primary auth-submit" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Creating account…' : 'Create creator account'}
            </button>
          </form>

          <p className="auth-switch">Already have a creator account? <Link to="/creator/login">Log in</Link></p>
          <p className="auth-terms">By creating an account, you agree to the Terms of Service and Privacy Policy.</p>
        </>
      )}
    </AuthShell>
  )
}
