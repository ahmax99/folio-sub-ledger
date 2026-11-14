import { discovery } from 'openid-client'
import { describe, expect, it, vi } from 'vitest'

import { getOIDCClient } from '../cognitoClient'

vi.mock('openid-client', () => ({
  discovery: vi.fn().mockResolvedValue({ issuer: 'cognito' })
}))

describe('getOIDCClient', () => {
  it('discovers the user pool once and reuses the configuration', async () => {
    const first = await getOIDCClient()
    const second = await getOIDCClient()

    expect(second).toBe(first)
    expect(discovery).toHaveBeenCalledOnce()
    expect(vi.mocked(discovery).mock.calls[0]?.[0].href).toBe(
      'https://cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-1_test'
    )
  })
})
