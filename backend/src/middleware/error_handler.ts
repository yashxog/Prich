import type { NextFunction, Request, Response } from 'express'
import type { ApiErrorResponse } from '@prich/shared'
import { AccountRoleConflictError } from '../modules/auth/account_role.repository.js'

/**
 * Converts unexpected route failures into a safe API response.
 * @param error - The untrusted error raised during request handling.
 * @param request - The Express request associated with the failure.
 * @param response - The Express response.
 * @param next - The next middleware callback required by Express error handlers.
 * @returns Nothing after the safe response is sent.
 */
export function errorHandler(
  error: unknown,
  request: Request,
  response: Response<ApiErrorResponse>,
  _next: NextFunction,
): void {
  console.error(JSON.stringify({
    event: 'request_failed',
    method: request.method,
    path: request.path,
    errorName: error instanceof Error ? error.name : 'UnknownError',
  }))
  if (error instanceof AccountRoleConflictError) {
    response.status(409).json({ error: error.message })
    return
  }

  response.status(500).json({ error: 'The request could not be completed.' })
}
