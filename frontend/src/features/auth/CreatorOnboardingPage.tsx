import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactElement } from 'react'
import type { UpdateCreatorProfileInput } from '@prich/shared'
import { useNavigate } from 'react-router-dom'
import { ApiRequestError } from '../../services/api_client'
import { getCreatorProfile, updateCreatorProfile } from './auth.service'
import { ProfileOnboardingShell } from './ProfileOnboardingShell'
import {
  buildE164PhoneNumber,
  COUNTRY_OPTIONS,
  PHONE_CALLING_CODE_OPTIONS,
  splitE164PhoneNumber,
} from './phone_country_codes'

interface CreatorOnboardingForm extends UpdateCreatorProfileInput {
  phoneCallingCode: string
  nationalPhoneNumber: string
}

const EMPTY_FORM: CreatorOnboardingForm = {
  bio: '',
  country: '',
  displayName: '',
  niche: '',
  nationalPhoneNumber: '',
  phoneCallingCode: '',
}

const E164_PHONE_PATTERN = /^\+[1-9][0-9]{7,14}$/

/**
 * Renders creator profile collection with an optional phone number.
 * @returns The creator onboarding form or loading state.
 */
export function CreatorOnboardingPage(): ReactElement {
  const navigate = useNavigate()
  const [form, setForm] = useState<CreatorOnboardingForm>(EMPTY_FORM)
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    /**
     * Loads existing creator details and skips onboarding when already complete.
     * @returns A promise resolved after form initialization.
     */
    async function loadProfile(): Promise<void> {
      try {
        const profile = await getCreatorProfile()

        if (profile.isComplete) {
          navigate('/creator/dashboard', { replace: true })
          return
        }

        const splitPhoneNumber = splitE164PhoneNumber(profile.phoneNumber)
        setForm({
          bio: profile.bio,
          country: profile.country,
          displayName: profile.displayName || `${profile.firstName} ${profile.lastName}`.trim(),
          niche: profile.niche,
          nationalPhoneNumber: splitPhoneNumber.nationalNumber,
          phoneCallingCode: splitPhoneNumber.callingCode,
        })
      } catch (error) {
        if (error instanceof ApiRequestError && error.status === 401) {
          navigate('/creator/login', { replace: true })
          return
        }

        setErrorMessage(error instanceof Error ? error.message : 'Your creator profile could not be loaded.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadProfile()
  }, [navigate])

  /**
   * Updates a creator onboarding field.
   * @param event - The changed input, select, or biography field.
   * @returns Nothing.
   */
  function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void {
    const fieldName = event.currentTarget.name as keyof CreatorOnboardingForm
    const fieldValue = event.currentTarget.value
    setForm((currentForm) => ({ ...currentForm, [fieldName]: fieldValue }))
  }

  /**
   * Stores normalized creator details and opens the creator workspace.
   * @returns A promise resolved after the profile is saved.
   */
  async function saveProfile(): Promise<void> {
    const hasPhoneInput = form.phoneCallingCode !== '' || form.nationalPhoneNumber.trim() !== ''
    const phoneNumber = hasPhoneInput
      ? buildE164PhoneNumber(form.phoneCallingCode, form.nationalPhoneNumber)
      : ''

    await updateCreatorProfile({
      bio: form.bio.trim(),
      country: form.country.trim(),
      displayName: form.displayName.trim(),
      niche: form.niche.trim(),
      phoneNumber,
    })
    navigate('/creator/dashboard', { replace: true })
  }

  /**
   * Validates optional phone input and stores the creator profile.
   * @param event - The creator-details form submission event.
   * @returns A promise resolved after the profile is stored.
   */
  async function handleDetailsSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setErrorMessage('')

    const hasCallingCode = form.phoneCallingCode !== ''
    const hasNationalNumber = form.nationalPhoneNumber.trim() !== ''
    const phoneNumber = buildE164PhoneNumber(form.phoneCallingCode, form.nationalPhoneNumber)
    if (hasCallingCode !== hasNationalNumber || (hasCallingCode && !E164_PHONE_PATTERN.test(phoneNumber))) {
      setErrorMessage('Enter both a country code and a valid national phone number, or leave both phone fields empty.')
      return
    }

    setIsSubmitting(true)
    try {
      await saveProfile()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Your creator profile could not be saved.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="callback-page">
        <div className="callback-card" role="status">
          <span aria-hidden="true" className="auth-spinner" />
          <h1>Preparing your profile</h1>
          <p>We are loading your secure creator details.</p>
        </div>
      </main>
    )
  }

  const hasKnownCountry = COUNTRY_OPTIONS.some((option) => option.label === form.country)

  return (
    <ProfileOnboardingShell
      description="Help brands understand who you are. You can add a private contact number now or skip it."
      eyebrow="Creator profile"
      title="Complete your creator profile"
    >
      <form className="auth-form profile-onboarding-form" onSubmit={handleDetailsSubmit}>
        <label className="form-field">
            <span>Name</span>
            <input autoComplete="name" maxLength={160} name="displayName" onChange={handleInputChange} required value={form.displayName} />
          </label>
          <fieldset className="phone-field-group">
            <legend>Phone number <span className="optional-label">(optional)</span></legend>
            <div className="phone-field-group__inputs">
              <label className="form-field">
                <span>Country code</span>
                <select autoComplete="tel-country-code" name="phoneCallingCode" onChange={handleInputChange} value={form.phoneCallingCode}>
                  <option value="">Select code</option>
                  {PHONE_CALLING_CODE_OPTIONS.map((option) => (
                    <option key={option.callingCode} value={option.callingCode}>
                      {option.flag} {option.label} ({option.callingCode})
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                <span>National number</span>
                <input autoComplete="tel-national" inputMode="tel" name="nationalPhoneNumber" onChange={handleInputChange} placeholder="9876543210" type="tel" value={form.nationalPhoneNumber} />
              </label>
            </div>
            <small className="phone-field-group__hint">Add both fields to save a contact number, or leave both empty to continue without one.</small>
          </fieldset>
          <div className="form-row">
            <label className="form-field">
              <span>Country of residence</span>
              <select autoComplete="country-name" name="country" onChange={handleInputChange} required value={form.country}>
                <option value="">Select country</option>
                {form.country && !hasKnownCountry ? <option value={form.country}>{form.country}</option> : null}
                {COUNTRY_OPTIONS.map((option) => (
                  <option key={option.label} value={option.label}>{option.flag} {option.label}</option>
                ))}
              </select>
              <small>This location is stored separately from your phone prefix.</small>
            </label>
            <label className="form-field">
              <span>Niche</span>
              <input maxLength={100} name="niche" onChange={handleInputChange} placeholder="e.g. Fintech, design, wellness" required value={form.niche} />
            </label>
          </div>
          <label className="form-field">
            <span>Bio <small>(optional)</small></span>
            <textarea maxLength={500} name="bio" onChange={handleInputChange} rows={4} value={form.bio} />
            <small>{form.bio.length}/500 characters</small>
          </label>
          {errorMessage ? <p className="form-error" role="alert">{errorMessage}</p> : null}
          <button className="button button--primary auth-submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Saving…' : 'Save and continue'}
          </button>
      </form>
    </ProfileOnboardingShell>
  )
}
