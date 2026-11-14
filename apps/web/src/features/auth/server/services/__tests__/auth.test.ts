import { authorizationCodeGrant, buildAuthorizationUrl } from 'openid-client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { findMeWithIdToken } from '../../api'
import { handleCallback, handleLogin, handleLogout } from '../auth'
import {
  destroyPKCESession,
  destroySession,
  getPKCEData,
  setPKCEData,
  setSessionData
} from '../session'

vi.mock('openid-client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('openid-client')>()),
  authorizationCodeGrant: vi.fn(),
  buildAuthorizationUrl: vi.fn(
    () => new URL('https://auth.example.com/authorize')
  )
}))
vi.mock('../../../lib/cognitoClient', () => ({
  getOIDCClient: vi.fn().mockResolvedValue({})
}))
vi.mock('../../api', () => ({ findMeWithIdToken: vi.fn() }))
vi.mock('../session', () => ({
  destroyPKCESession: vi.fn(),
  destroySession: vi.fn(),
  getPKCEData: vi.fn(),
  setPKCEData: vi.fn(),
  setSessionData: vi.fn()
}))

const pkce = {
  codeVerifier: 'verifier',
  state: 'state-1',
  nonce: 'nonce-1',
  callbackUrl: '/account'
}
const callbackUrl = new URL('http://app.test/api/auth/callback?code=c')

const grantTokens = (overrides: { id_token?: string } = {}) =>
  vi.mocked(authorizationCodeGrant).mockResolvedValue({
    id_token: 'id-1',
    refresh_token: 'refresh-1',
    claims: () => ({ sub: 'sub-1' }),
    ...overrides
  } as never)

describe('handleLogin', () => {
  it('stores PKCE state and returns the Cognito authorize URL', async () => {
    const { authUrl } = await handleLogin('/account')

    expect(authUrl).toBe('https://auth.example.com/authorize')
    expect(setPKCEData).toHaveBeenCalledWith(
      expect.objectContaining({ callbackUrl: '/account' })
    )
    const [, parameters] = vi.mocked(buildAuthorizationUrl).mock.lastCall ?? []
    const { state, nonce } = vi.mocked(setPKCEData).mock.lastCall?.[0] ?? {}
    expect(parameters).toMatchObject({
      redirect_uri: 'http://app.test/api/auth/callback',
      code_challenge_method: 'S256',
      state,
      nonce
    })
  })

  it('falls back to home for an off-site callback URL', async () => {
    await handleLogin('https://evil.example.com')

    expect(setPKCEData).toHaveBeenCalledWith(
      expect.objectContaining({ callbackUrl: '/' })
    )
  })
})

describe('handleCallback', () => {
  beforeEach(() => {
    vi.mocked(getPKCEData).mockResolvedValue(pkce)
  })

  it.each([
    [{ error: 'access_denied' }, 'access_denied'],
    [{ state: 'state-1' }, 'missing_code'],
    [{ code: 'c', state: 'other' }, 'invalid_state']
  ])('redirects %j to login with %s', async (params, error) => {
    const { redirectUrl } = await handleCallback(callbackUrl, params)

    expect(redirectUrl).toBe(`/auth/login?error=${error}`)
    expect(authorizationCodeGrant).not.toHaveBeenCalled()
  })

  it.each([
    ['codeVerifier', 'missing_verifier'],
    ['nonce', 'missing_nonce']
  ])('redirects to login when the %s is missing', async (field, error) => {
    vi.mocked(getPKCEData).mockResolvedValue({ ...pkce, [field]: undefined })

    const { redirectUrl } = await handleCallback(callbackUrl, {
      code: 'c',
      state: 'state-1'
    })

    expect(redirectUrl).toBe(`/auth/login?error=${error}`)
  })

  it('redirects to login when the token response has no id token', async () => {
    grantTokens({ id_token: undefined })

    const { redirectUrl } = await handleCallback(callbackUrl, {
      code: 'c',
      state: 'state-1'
    })

    expect(redirectUrl).toBe('/auth/login?error=invalid_token')
    expect(setSessionData).not.toHaveBeenCalled()
  })

  it('starts the session, then drops PKCE state and returns to the callback URL', async () => {
    grantTokens()
    vi.mocked(findMeWithIdToken).mockResolvedValue({ id: 'u1' } as never)

    const { redirectUrl } = await handleCallback(callbackUrl, {
      code: 'c',
      state: 'state-1'
    })

    expect(redirectUrl).toBe('/account')
    expect(setSessionData).toHaveBeenCalledWith({ refreshToken: 'refresh-1' })
    expect(vi.mocked(setSessionData).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(destroyPKCESession).mock.invocationCallOrder[0] ?? 0
    )
    expect(findMeWithIdToken).toHaveBeenCalledWith('id-1')
  })

  it('sends a signed-in identity without a firm to setup', async () => {
    grantTokens()
    vi.mocked(findMeWithIdToken).mockResolvedValue(null)

    const { redirectUrl } = await handleCallback(callbackUrl, {
      code: 'c',
      state: 'state-1'
    })

    expect(redirectUrl).toBe('/setup')
  })
})

describe('handleLogout', () => {
  it('clears both cookies and returns the Cognito logout URL', async () => {
    const { logoutUrl } = await handleLogout()

    expect(destroySession).toHaveBeenCalledOnce()
    expect(destroyPKCESession).toHaveBeenCalledOnce()
    expect(logoutUrl).toBe(
      'https://test-domain.auth.ap-northeast-1.amazoncognito.com/logout?client_id=test-client&logout_uri=http%3A%2F%2Fapp.test'
    )
  })
})
