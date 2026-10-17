import { createServerFn } from '@tanstack/react-start'

import { catchAsyncError } from '@/features/error/utils/catchError'

import { getMe } from './api'
import { handleLogout } from './services/auth'
import { getSessionData } from './services/session'

// Signed-out visitors and an unreachable backend both resolve to null, so public pages still render.
export const fetchOptionalUser = createServerFn().handler(async () => {
  const session = await getSessionData()
  if (!session.refreshToken) return null

  return (await catchAsyncError(getMe())).unwrapOr(null)
})

// null means signed out (the caller redirects to login); a backend failure propagates to the error boundary.
export const fetchRequiredUser = createServerFn().handler(async () => {
  const session = await getSessionData()
  if (!session.refreshToken) return null

  return getMe()
})

export const logout = createServerFn({ method: 'POST' }).handler(handleLogout)
