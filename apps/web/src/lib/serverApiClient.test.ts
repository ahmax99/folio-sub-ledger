import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getTokens } from '@/features/auth/server/services/token'

import { serverAuthApiClient } from './serverApiClient'
import { signingHook } from './sig4'

vi.mock('@tanstack/react-start/server-only', () => ({}))
vi.mock('@/config/env', () => ({
  env: { NODE_ENV: 'production', BACKEND_INTERNAL_URL: 'http://backend.test' }
}))
vi.mock('@/config/logger', () => ({ logger: { child: () => ({}) } }))
vi.mock('@/lib/requestLogging', () => ({
  logBeforeRequest: () => () => undefined,
  logAfterResponse: () => () => undefined
}))
vi.mock('@/features/auth/server/services/token', () => ({
  getTokens: vi.fn()
}))
vi.mock('./sig4', () => ({ signingHook: vi.fn() }))

describe('serverAuthApiClient', () => {
  let idTokenSeenBySigner: string | null | undefined

  beforeEach(() => {
    idTokenSeenBySigner = undefined
    vi.mocked(signingHook).mockReset()
    vi.mocked(signingHook).mockImplementation(async ({ request }) => {
      idTokenSeenBySigner = request.headers.get('X-Id-Token')
    })
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({}))
    )
  })

  it('sets the ID token before SigV4 signs the request', async () => {
    vi.mocked(getTokens).mockResolvedValue({
      idToken: 'id-token',
      accessToken: 'access-token'
    })

    await serverAuthApiClient.get('users/me').json()

    expect(signingHook).toHaveBeenCalledOnce()
    expect(idTokenSeenBySigner).toBe('id-token')
  })

  it('rejects with UNAUTHORIZED without signing when there is no ID token', async () => {
    vi.mocked(getTokens).mockResolvedValue({
      idToken: undefined,
      accessToken: 'access-token'
    })

    await expect(serverAuthApiClient.get('users/me')).rejects.toMatchObject({
      code: 'UNAUTHORIZED'
    })
    expect(signingHook).not.toHaveBeenCalled()
  })
})
