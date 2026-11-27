export const PROTECTED_ROUTES = {
  ACCOUNT: '/account',
  ACCOUNT_EDIT: '/account/edit',
  ORGANIZATION_HOME: '/organization',
  ORGANIZATION_MEMBERS: '/organization/members',
  ORGANIZATION_SETUP: '/setup'
} as const

export const PUBLIC_ROUTES = {
  HOME: '/',
  CONTACT_US: '/contact'
} as const

export const PUBLIC_AUTH_ROUTES = {
  LOGIN: '/auth/login'
} as const
