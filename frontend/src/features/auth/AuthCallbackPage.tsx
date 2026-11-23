import { useEffect, useState, type ReactElement } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { completeCreatorAuth } from './auth.service'
import { completeBrandAuth } from './brand_auth.service'

interface AuthCallbackDestination {
  accountType: 'brand' | 'creator'
  path: string
}

/**
 * Restricts an authentication callback destination to a creator route.
 * @param value - The untrusted next-path query value.
 * @returns A safe internal creator destination.
 */
function getSafeDestination(value: string | null): AuthCallbackDestination {
  if (value?.startsWith('/brand/')) {
    return { accountType: 'brand', path: value }
  }

  return {
    accountType: 'creator',
    path: value?.startsWith('/creator/') ? value : '/creator/dashboard',
  }
}

/**
 * Exchanges the Supabase PKCE code and prepares the creator profile.
 * @returns The authentication callback progress screen.
 */
export function AuthCallbackPage(): ReactElement {
  const location = useLocation()
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const query = new URLSearchParams(location.search)
    const providerError = query.get('error_description')
    const code = query.get('code')
    const destination = getSafeDestination(query.get('next'))

    if (providerError) {
      setErrorMessage(providerError)
      return
    }

    /**
     * Completes authentication and navigates to the requested creator page.
     * @returns A promise resolved after callback processing.
     */
    async function finishAuthentication(): Promise<void> {
      try {
        if (destination.accountType === 'brand') {
          await completeBrandAuth(code)
        } else {
          await completeCreatorAuth(code)
        }

        navigate(destination.path, { replace: true })
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Authentication could not be completed.')
      }
    }

    void finishAuthentication()
  }, [location.search, navigate])

  const destination = getSafeDestination(new URLSearchParams(location.search).get('next'))

  return (
    <main className="callback-page">
      <div className="callback-card" role="status">
        {errorMessage ? (
          <>
            <span aria-hidden="true" className="callback-card__mark callback-card__mark--error">!</span>
            <h1>We could not log you in</h1>
            <p>{errorMessage}</p>
            <Link className="button button--primary" to={`/${destination.accountType}/login`}>Return to login</Link>
          </>
        ) : (
          <>
            <span aria-hidden="true" className="auth-spinner" />
            <h1>Finishing your login</h1>
            <p>We are securely preparing your {destination.accountType} workspace.</p>
          </>
        )}
      </div>
    </main>
  )
}
