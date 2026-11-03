import type { User } from '@shared/config'

import { PROTECTED_ROUTES, PUBLIC_AUTH_ROUTES } from './routes'

export type SessionState =
  | { status: 'signed-out' }
  | { status: 'no-firm' }
  | { status: 'ready'; user: User }

export const AUTHORIZED_REDIRECTS = {
  'signed-out': PUBLIC_AUTH_ROUTES.LOGIN,
  'no-firm': PROTECTED_ROUTES.FIRM_SETUP
} as const

export const SETUP_REDIRECTS = {
  'signed-out': PUBLIC_AUTH_ROUTES.LOGIN,
  ready: PROTECTED_ROUTES.FIRM_HOME
} as const
