import { createServerFn } from '@tanstack/react-start'

import { AppError } from '@/features/error/lib/AppError'

import type { SessionState } from './lib/access'
import { handleLogout } from './server/auth.server'
import { getSessionData } from './server/session.server'
import { findMe } from './server/user.server'

export const fetchSessionState = createServerFn().handler(
  async (): Promise<SessionState> => {
    const session = await getSessionData()
    if (!session.refreshToken) return { status: 'signed-out' }

    const user = await findMe().catch((error: unknown) => {
      if (error instanceof AppError && error.code === 'UNAUTHORIZED')
        return 'signed-out' as const
      throw error
    })
    if (user === 'signed-out') return { status: 'signed-out' }

    return user ? { status: 'ready', user } : { status: 'no-organization' }
  }
)

export const logout = createServerFn({ method: 'POST' }).handler(handleLogout)
