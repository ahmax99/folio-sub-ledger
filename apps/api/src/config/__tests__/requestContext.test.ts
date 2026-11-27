import pino from 'pino'
import { v7 as uuidv7 } from 'uuid'
import { beforeEach, describe, expect, it } from 'vitest'

import { app } from '@/app.js'
import { logger } from '@/config/logger.js'
import { seedOwner, send } from '@/test/fixtures.js'
import { identities } from '@/test/identities.js'

let lines: Record<string, unknown>[] = []

// Swap pino's destination so the test reads the exact JSON lines the app writes.
const stream = { write: (line: string) => lines.push(JSON.parse(line)) }
;(logger as unknown as Record<symbol, unknown>)[pino.symbols.streamSym] = stream

beforeEach(() => {
  lines = []
})

describe('request context', () => {
  it('tags every log line with the BFF request id, the org and the member', async () => {
    const owner = await seedOwner()

    const res = await send(app, 'GET', `/api/v1/users/${uuidv7()}`, {
      token: 'test-token',
      headers: { 'x-request-id': 'bff-req-123' }
    })

    expect(res.status).toBe(404)
    expect(res.headers.get('x-request-id')).toBe('bff-req-123')
    expect(lines.length).toBeGreaterThanOrEqual(2)
    for (const line of lines)
      expect(line).toMatchObject({
        requestId: 'bff-req-123',
        orgId: owner.orgId,
        memberId: owner.id
      })
  })

  it('never logs the email or the name of the caller', async () => {
    await seedOwner()

    await send(app, 'GET', '/api/v1/users/me', { token: 'test-token' })

    const { email, name } = identities['test-token']
    const output = JSON.stringify(lines)
    expect(output).not.toContain(email)
    expect(output).not.toContain(name)
  })

  it('replaces a missing or malformed request id with its own', async () => {
    const res = await send(app, 'GET', '/api/v1/users/me', {
      headers: { 'x-request-id': 'bad id {"level":60}' }
    })

    const requestId = res.headers.get('x-request-id')
    expect(requestId).toMatch(/^[\da-f-]{36}$/)
    expect(lines.every((line) => line.requestId === requestId)).toBe(true)
  })
})
