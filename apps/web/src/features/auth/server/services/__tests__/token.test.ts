import { refreshTokenGrant } from 'openid-client'
import { describe, expect, it, vi } from 'vitest'

import { getSession } from '../session'
import { getTokens } from '../token'

vi.mock('openid-client', () => ({ refreshTokenGrant: vi.fn() }))
vi.mock('../../../lib/cognitoClient', () => ({
  getOIDCClient: vi.fn().mockResolvedValue({})
}))
vi.mock('../session', () => ({ getSession: vi.fn() }))

const withSession = (refreshToken?: string) =>
  vi.mocked(getSession).mockResolvedValue({ refreshToken } as never)

describe('getTokens', () => {
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
  })

  it('fails as unauthorized without a refresh token', async () => {
    withSession()

    await expect(getTokens()).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
    expect(refreshTokenGrant).not.toHaveBeenCalled()
  })
})
