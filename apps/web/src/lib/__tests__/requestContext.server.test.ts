import pino from 'pino'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { logger } from '@/config/logger.server'

import { withRequestContext } from '../requestContext.server'
import { serverApiClient } from '../serverApiClient.server'

let lines: Record<string, unknown>[] = []
let headersSentToBackend: Headers | undefined

// Swap pino's destination so the test reads the exact JSON lines the BFF writes.
;(logger as unknown as Record<symbol, unknown>)[pino.symbols.streamSym] = {
  write: (line: string) => lines.push(JSON.parse(line))
}

beforeEach(() => {
  lines = []
  headersSentToBackend = undefined
  vi.stubGlobal(
    'fetch',
    vi.fn(async (request: Request) => {
      headersSentToBackend = new Headers(request.headers)
      return Response.json({ ok: true })
    })
  )
})

const handleIncoming = (headers: Record<string, string> = {}) =>
  withRequestContext(
    new Request('http://app.test/settings', { headers }),
    async () => {
      logger.info('Rendering settings')
      await serverApiClient.get('users/me').json()
      return new Response('ok')
    }
  )

describe('withRequestContext', () => {
  it('gives every BFF log line of a request the id it sends to the API', async () => {
    const response = await handleIncoming({ 'x-amz-cf-id': 'cf-Abc_123==' })

    expect(headersSentToBackend?.get('x-request-id')).toBe('cf-Abc_123==')
    expect(response.headers.get('x-request-id')).toBe('cf-Abc_123==')
    expect(lines.length).toBeGreaterThanOrEqual(3)
    expect(lines.every((line) => line.requestId === 'cf-Abc_123==')).toBe(true)
  })

  it('assigns its own id when CloudFront sent none', async () => {
    const response = await handleIncoming()

    const requestId = response.headers.get('x-request-id')
    expect(requestId).toMatch(/^[\da-f-]{36}$/)
    expect(headersSentToBackend?.get('x-request-id')).toBe(requestId)
    expect(lines.every((line) => line.requestId === requestId)).toBe(true)
  })

  it('keeps the headers of a redirect, which are otherwise immutable', async () => {
    const response = await withRequestContext(
      new Request('http://app.test/'),
      async () => Response.redirect('http://app.test/login', 307)
    )

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://app.test/login')
    expect(response.headers.get('x-request-id')).toBeTruthy()
  })
})
