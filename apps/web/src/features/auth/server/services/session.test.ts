import { describe, expect, it, vi } from 'vitest'

import {
  destroyPKCESession,
  destroySession,
  getPKCEData,
  getSessionData,
  setPKCEData,
  setSessionData
} from './session'

const jar = vi.hoisted(() => new Map<string, string>())

vi.mock('@tanstack/react-start/server', () => ({
  getCookie: (name: string) => jar.get(name),
  getCookies: () => Object.fromEntries(jar),
  setCookie: (name: string, value: string) =>
    value ? jar.set(name, value) : jar.delete(name)
}))

describe('auth session cookie', () => {
  it('round-trips the refresh token through an encrypted cookie', async () => {
    await setSessionData({ refreshToken: 'refresh-1' })

    expect(jar.get('auth_session')).not.toContain('refresh-1')
    expect(await getSessionData()).toEqual({ refreshToken: 'refresh-1' })
  })

  it('is empty after it is destroyed', async () => {
    await setSessionData({ refreshToken: 'refresh-1' })

    await destroySession()

    expect(await getSessionData()).toEqual({ refreshToken: undefined })
  })
})

describe('PKCE cookie', () => {
  const pkce = {
    codeVerifier: 'verifier',
    state: 'state',
    nonce: 'nonce',
    callbackUrl: '/account'
  }

  it('is stored separately from the auth session', async () => {
    await setPKCEData(pkce)

    expect(jar.has('auth_pkce')).toBe(true)
    expect(await getPKCEData()).toEqual(pkce)
    expect(await getSessionData()).toEqual({ refreshToken: undefined })
  })

  it('is empty after it is destroyed', async () => {
    await setPKCEData(pkce)

    await destroyPKCESession()

    expect(await getPKCEData()).toEqual({
      codeVerifier: undefined,
      state: undefined,
      nonce: undefined,
      callbackUrl: undefined
    })
  })
})
