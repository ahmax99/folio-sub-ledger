import { createServerFn } from '@tanstack/react-start'

import type { SessionState } from './lib/access'
import { handleLogout } from './server/auth.server'
import { getSessionData } from './server/session.server'
import { findMe } from './server/user.server'

export const fetchSessionState = createServerFn().handler(
  async (): Promise<SessionState> => {
    const session = await getSessionData()
    if (!session.refreshToken) return { status: 'signed-out' }

    const user = await findMe()
    return user ? { status: 'ready', user } : { status: 'no-firm' }
  }
)

export const logout = createServerFn({ method: 'POST' }).handler(handleLogout)
