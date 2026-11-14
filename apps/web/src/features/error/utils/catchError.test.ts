import { describe, expect, it, vi } from 'vitest'

import { captureError } from '@/features/error-tracking/utils/captureError'

import { catchAsyncError, catchSyncError } from './catchError'

vi.mock('@/features/error-tracking/utils/captureError', () => ({
  captureError: vi.fn()
}))

describe('catchSyncError', () => {
  it('returns the value or the mapped error without reporting', () => {
    expect(catchSyncError(() => JSON.parse('{"a":1}'))._unsafeUnwrap()).toEqual(
      {
        a: 1
      }
    )
    expect(
      catchSyncError(() => JSON.parse('{'))._unsafeUnwrapErr()
    ).toMatchObject({ code: 'INTERNAL_ERROR' })
    expect(captureError).not.toHaveBeenCalled()
  })
})

describe('catchAsyncError', () => {
  it('maps a rejection and reports it', async () => {
    const result = await catchAsyncError(Promise.reject(new Error('boom')))

    expect(result._unsafeUnwrapErr()).toMatchObject({ message: 'boom' })
    expect(captureError).toHaveBeenCalledWith(result._unsafeUnwrapErr())
  })
})
