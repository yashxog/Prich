import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import type { UpdateBrandProfileInput } from '@prich/shared'
import { ApiRequestError } from '../../services/api_client'
import { AuthShell } from './AuthShell'
import { getBrandProfile, updateBrandProfile } from './brand_auth.service'

const EMPTY_FORM: UpdateBrandProfileInput = { category: '', companyName: '', website: '' }

/**
 * Renders the authenticated company-details step for a brand.
 * @returns The brand onboarding form or its loading state.
 */
export function BrandOnboardingPage(): ReactElement {
  const navigate = useNavigate()
  const [form, setForm] = useState<UpdateBrandProfileInput>(EMPTY_FORM)
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    /**
     * Loads any existing company details into the onboarding form.
     * @returns A promise resolved after form initialization.
     */
    async function loadProfile(): Promise<void> {
      try {
        const profile = await getBrandProfile()
        setForm({
          category: profile.category,
          companyName: profile.companyName,
          website: profile.website,
        })
      } catch (error) {
        if (error instanceof ApiRequestError && error.status === 401) {
          navigate('/brand/login', { replace: true })
          return
        }

        setErrorMessage(error instanceof Error ? error.message : 'Your brand profile could not be loaded.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadProfile()
  }, [navigate])

  /**
   * Updates a company profile field.
   * @param event - The changed company input.
   * @returns Nothing.
   */
  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    const fieldName = event.currentTarget.name as keyof UpdateBrandProfileInput
    const fieldValue = event.currentTarget.value
    setForm((currentForm) => ({ ...currentForm, [fieldName]: fieldValue }))
  }

  /**
   * Saves company details and opens the brand workspace.
   * @param event - The company profile form submission event.
   * @returns A promise resolved after the profile is saved.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await updateBrandProfile({
        category: form.category.trim(),
        companyName: form.companyName.trim(),
        website: form.website.trim(),
      })
      navigate('/brand/dashboard', { replace: true })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Your company details could not be saved.')
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="callback-page">
        <div className="callback-card" role="status">
          <span aria-hidden="true" className="auth-spinner" />
          <h1>Preparing company setup</h1>
          <p>We are loading your secure brand profile.</p>
        </div>
      </main>
    )
  }

  return (
    <AuthShell
      accountType="brand"
      description="These details help creators understand who they will be working with. You can update them later."
      eyebrow="Company setup · Step 2 of 2"
      title="Tell us about your brand"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Company name</span>
          <input autoComplete="organization" maxLength={160} name="companyName" onChange={handleInputChange} required value={form.companyName} />
        </label>
        <label className="form-field">
          <span>Website</span>
          <input autoComplete="url" maxLength={2048} name="website" onChange={handleInputChange} placeholder="https://example.com" required type="url" value={form.website} />
          <small>Use your company’s main HTTP or HTTPS website.</small>
        </label>
        <label className="form-field">
          <span>Category</span>
          <input autoComplete="organization-title" maxLength={100} name="category" onChange={handleInputChange} placeholder="e.g. Fintech, SaaS, Consumer goods" required value={form.category} />
        </label>

        {errorMessage ? <p className="form-error" role="alert">{errorMessage}</p> : null}
        <button className="button button--primary auth-submit" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Saving company…' : 'Save and continue'}
        </button>
      </form>
    </AuthShell>
  )
}
