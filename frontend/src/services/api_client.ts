import type { ApiErrorResponse } from '@prich/shared'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export class ApiRequestError extends Error {
  public readonly status: number

  /**
   * Creates an error representing a failed backend request.
   * @param message - Safe user-facing failure information.
   * @param status - The HTTP response status.
   */
  public constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
  }
}

/**
 * Sends an authenticated request to the Prich backend.
 * @param path - The versioned backend API path.
 * @param accessToken - The caller's Supabase access token.
 * @param init - Optional standard fetch configuration.
 * @returns The parsed response contract, or undefined for an empty response.
 */
export async function apiRequest<T>(
  path: string,
  accessToken: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${accessToken}`)

  if (init.body) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${apiUrl}${path}`, { ...init, headers })

  if (!response.ok) {
    let message = 'The request could not be completed.'

    try {
      const errorBody = await response.json() as ApiErrorResponse
      message = errorBody.error || message
    } catch {
      // A non-JSON upstream failure uses the generic safe message.
    }

    throw new ApiRequestError(message, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
