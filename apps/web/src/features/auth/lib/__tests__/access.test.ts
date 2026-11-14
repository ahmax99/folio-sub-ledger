import { describe, expect, it } from 'vitest'

import { AUTHORIZED_REDIRECTS, SETUP_REDIRECTS } from '../access'
import { PROTECTED_ROUTES, PUBLIC_AUTH_ROUTES } from '../routes'

describe('session redirects', () => {
  it('sends a signed-out visitor to login from authorized and setup pages', () => {
    expect(AUTHORIZED_REDIRECTS['signed-out']).toBe(PUBLIC_AUTH_ROUTES.LOGIN)
    expect(SETUP_REDIRECTS['signed-out']).toBe(PUBLIC_AUTH_ROUTES.LOGIN)
  })

  it('sends an identity without a firm to setup from authorized pages', () => {
    expect(AUTHORIZED_REDIRECTS['no-firm']).toBe(PROTECTED_ROUTES.FIRM_SETUP)
  })

  it('sends a user with a firm from setup to the firm home', () => {
    expect(SETUP_REDIRECTS.ready).toBe(PROTECTED_ROUTES.FIRM_HOME)
  })
})
