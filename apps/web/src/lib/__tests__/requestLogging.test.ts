import { describe, expect, it, vi } from 'vitest'

import { AppError } from '@/features/error/lib/AppError'

import {
  logAfterResponse,
  logBeforeRequest,
  withRequestLogging
} from '../requestLogging'

vi.mock('@/features/error/utils/captureError', () => ({
  captureError: vi.fn()
}))

const request = new Request('http://app.test/api/account', { method: 'PUT' })

describe('withRequestLogging', () => {
  it('passes the handler response through', async () => {
    const response = new Response('ok', { status: 201 })

    const handled = await withRequestLogging(async () => response)({ request })

    expect(handled).toBe(response)
  })

  it('turns a thrown AppError into its JSON error response', async () => {
    const handled = await withRequestLogging(async () => {
      throw new AppError('BAD_REQUEST', 'Invalid', { name: 'Required' })
    })({ request })

    expect(handled.status).toBe(400)
    expect(await handled.json()).toEqual({
      error: { message: 'Invalid', fields: { name: 'Required' } }
    })
  })
})

describe('backend call logging', () => {
  it('logs the request and the response status', () => {
    const log = { info: vi.fn() }
    const response = new Response(null, { status: 204 })

    logBeforeRequest(log as never)({ request })
    logAfterResponse(log as never)({ request, response })

    expect(log.info).toHaveBeenNthCalledWith(
      1,
      { req: { method: 'PUT', url: 'http://app.test/api/account' } },
      'Calling backend'
    )
    expect(log.info).toHaveBeenNthCalledWith(
      2,
      {
        req: { method: 'PUT', url: 'http://app.test/api/account' },
        res: { status: 204 }
      },
      'Backend responded'
    )
  })
})
