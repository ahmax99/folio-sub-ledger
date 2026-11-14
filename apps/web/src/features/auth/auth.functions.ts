import { createServerFn } from '@tanstack/react-start'

import { catchAsyncError } from '@/features/error/utils/catchError'

import type { SessionState } from './lib/access'
import { handleLogout } from './server/auth.server'
import { getSessionData } from './server/session.server'
import { findMe } from './server/user.server'

export const fetchOptionalUser = createServerFn().handler(async () => {
  const session = await getSessionData()
  if (!session.refreshToken) return null

  return (await catchAsyncError(findMe())).unwrapOr(null)
})

export const fetchSessionState = createServerFn().handler(
  async (): Promise<SessionState> => {
    const session = await getSessionData()
    if (!session.refreshToken) return { status: 'signed-out' }

    const user = await findMe()
    return user ? { status: 'ready', user } : { status: 'no-firm' }
  }
)

export const logout = createServerFn({ method: 'POST' }).handler(handleLogout)
