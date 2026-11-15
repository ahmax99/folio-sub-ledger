import type { User } from '@shared/config'

import { PROTECTED_ROUTES, PUBLIC_AUTH_ROUTES } from '@/lib/routes'

export type SessionState =
  | { status: 'signed-out' }
  | { status: 'no-organization' }
  | { status: 'ready'; user: User }

export const AUTHORIZED_REDIRECTS = {
  'signed-out': PUBLIC_AUTH_ROUTES.LOGIN,
  'no-organization': PROTECTED_ROUTES.ORGANIZATION_SETUP
} as const

export const SETUP_REDIRECTS = {
  'signed-out': PUBLIC_AUTH_ROUTES.LOGIN,
  ready: PROTECTED_ROUTES.ORGANIZATION_HOME
} as const
