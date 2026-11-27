import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getTokens } from '@/features/auth/server/token.server'

import { withRequestContext } from '../requestContext.server'
import { serverApiClient, serverAuthApiClient } from '../serverApiClient.server'
import { signingHook } from '../sig4.server'

vi.mock('@/config/env.server', () => ({
  env: { NODE_ENV: 'production', BACKEND_INTERNAL_URL: 'http://backend.test' }
}))
vi.mock('@/config/logger.server', () => ({ logger: { child: () => ({}) } }))
vi.mock('@/lib/requestLogging.server', () => ({
  logBeforeRequest: () => () => undefined,
  logAfterResponse: () => () => undefined
}))
vi.mock('@/features/auth/server/token.server', () => ({
  getTokens: vi.fn()
}))
vi.mock('../sig4.server', () => ({ signingHook: vi.fn() }))
vi.mock('@sentry/tanstackstart-react', () => ({
  setTag: vi.fn(),
  getTraceData: () => ({
    'sentry-trace': '4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-1',
    baggage: 'sentry-environment=dev'
  })
}))

const TRACE_HEADERS = ['x-request-id', 'sentry-trace', 'baggage'] as const

// Calls the client inside an incoming BFF request, as a server function would.
const duringRequest = (call: () => Promise<unknown>) =>
  withRequestContext(
    new Request('http://app.test/', { headers: { 'x-amz-cf-id': 'cf-req-1' } }),
    async () => {
      await call()
      return new Response()
    }
  )

describe('serverAuthApiClient', () => {
  let idTokenSeenBySigner: string | null | undefined
  let headersSeenBySigner: Headers | undefined

  beforeEach(() => {
    idTokenSeenBySigner = undefined
    headersSeenBySigner = undefined
    vi.mocked(signingHook).mockReset()
    vi.mocked(signingHook).mockImplementation(async ({ request }) => {
      idTokenSeenBySigner = request.headers.get('X-Id-Token')
      headersSeenBySigner = new Headers(request.headers)
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

  it.each([
    ['serverAuthApiClient', serverAuthApiClient],
    ['serverApiClient', serverApiClient]
  ])(
    '%s sets the request id and the Sentry trace before SigV4 signs the request',
    async (_, client) => {
      vi.mocked(getTokens).mockResolvedValue({
        idToken: 'id-token',
        accessToken: 'access-token'
      })

      await duringRequest(() => client.get('users/me').json())

      expect(signingHook).toHaveBeenCalledOnce()
      expect(
        Object.fromEntries(
          TRACE_HEADERS.map((name) => [name, headersSeenBySigner?.get(name)])
        )
      ).toEqual({
        'x-request-id': 'cf-req-1',
        'sentry-trace': '4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-1',
        baggage: 'sentry-environment=dev'
      })
    }
  )

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
