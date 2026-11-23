import type { ReactElement } from 'react'

interface GoogleAuthButtonProps {
  disabled: boolean
  onClick: () => void
}

/**
 * Renders the Google authentication action.
 * @param props - The loading state and click handler.
 * @returns A full-width Google authentication button.
 */
export function GoogleAuthButton({ disabled, onClick }: GoogleAuthButtonProps): ReactElement {
  return (
    <button className="provider-button" disabled={disabled} onClick={onClick} type="button">
      <span aria-hidden="true" className="provider-button__mark">G</span>
      Continue with Google
    </button>
  )
}
