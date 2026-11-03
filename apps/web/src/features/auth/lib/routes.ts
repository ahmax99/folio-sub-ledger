export const PROTECTED_ROUTES = {
  ACCOUNT: '/account',
  ACCOUNT_EDIT: '/account/edit',
  FIRM_HOME: '/firm',
  FIRM_SETUP: '/setup'
} as const

export const PUBLIC_ROUTES = {
  HOME: '/',
  CONTACT_US: '/contact'
} as const

export const PUBLIC_AUTH_ROUTES = {
  LOGIN: '/auth/login',
  CALLBACK: '/auth/callback'
} as const
