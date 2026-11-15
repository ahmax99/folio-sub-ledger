import { getRequest } from '@tanstack/react-start/server'

import { refreshTokenGrant } from 'openid-client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { destroySession, getSession, setSessionData } from '../session.server'
import { getTokens } from '../token.server'

vi.mock('@tanstack/react-start/server', () => ({ getRequest: vi.fn() }))
vi.mock('openid-client', () => ({ refreshTokenGrant: vi.fn() }))
vi.mock('../cognito.server', () => ({
  getOIDCClient: vi.fn().mockResolvedValue({})
}))
vi.mock('../session.server', () => ({
  destroySession: vi.fn(),
  getSession: vi.fn(),
  setSessionData: vi.fn()
}))

const withSession = (refreshToken?: string) =>
  vi.mocked(getSession).mockResolvedValue({ refreshToken } as never)

describe('getTokens', () => {
  beforeEach(() => {
    vi.mocked(getRequest).mockReturnValue(new Request('http://app.test/'))
  })

  it('exchanges the stored refresh token for fresh tokens', async () => {
    withSession('refresh-1')
    vi.mocked(refreshTokenGrant).mockResolvedValue({
      id_token: 'id-1',
      access_token: 'access-1'
    } as never)

    expect(await getTokens()).toEqual({
      idToken: 'id-1',
      accessToken: 'access-1'
    })
    expect(refreshTokenGrant).toHaveBeenCalledWith({}, 'refresh-1')
    expect(setSessionData).not.toHaveBeenCalled()
  })

  it('signs out when Cognito rejects the refresh token', async () => {
    withSession('revoked')
    vi.mocked(refreshTokenGrant).mockRejectedValue({ error: 'invalid_grant' })

    await expect(getTokens()).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
    expect(destroySession).toHaveBeenCalledOnce()
  })

  it('keeps the session when the refresh fails for another reason', async () => {
    withSession('refresh-1')
    vi.mocked(refreshTokenGrant).mockRejectedValue(new Error('network'))

    await expect(getTokens()).rejects.toThrow('network')
    expect(destroySession).not.toHaveBeenCalled()
  })

  it('stores a rotated refresh token', async () => {
    withSession('refresh-1')
    vi.mocked(refreshTokenGrant).mockResolvedValue({
      id_token: 'id-1',
      access_token: 'access-1',
      refresh_token: 'refresh-2'
    } as never)

    await getTokens()

    expect(setSessionData).toHaveBeenCalledWith({ refreshToken: 'refresh-2' })
  })

  it('fails as unauthorized without a refresh token', async () => {
    withSession()

    await expect(getTokens()).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
    expect(refreshTokenGrant).not.toHaveBeenCalled()
  })

  it('refreshes once per request and shares the tokens', async () => {
    withSession('refresh-1')
    vi.mocked(refreshTokenGrant).mockResolvedValue({
      id_token: 'id-1',
      access_token: 'access-1'
    } as never)

    await Promise.all([getTokens(), getTokens()])
    vi.mocked(getRequest).mockReturnValue(new Request('http://app.test/next'))
    await getTokens()

    expect(refreshTokenGrant).toHaveBeenCalledTimes(2)
  })

  it('does not reuse a failed refresh within the same request', async () => {
    withSession('refresh-1')
    vi.mocked(refreshTokenGrant)
      .mockRejectedValueOnce(new Error('cognito down'))
      .mockResolvedValueOnce({ id_token: 'id-2', access_token: 'a' } as never)

    await expect(getTokens()).rejects.toThrow('cognito down')

    expect(await getTokens()).toMatchObject({ idToken: 'id-2' })
  })
})
