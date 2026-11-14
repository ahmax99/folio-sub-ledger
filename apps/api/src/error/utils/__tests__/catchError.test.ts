import { ForbiddenError } from '@casl/ability'
import { describe, expect, it } from 'vitest'

import { AppError } from '@/error/lib/AppError.js'
import { captureError } from '@/error/utils/captureError.js'
import { catchAsyncError, mapToAppError } from '@/error/utils/catchError.js'
import { getUserPermissions } from '@/modules/auth/permission.js'

describe('mapToAppError', () => {
  it('keeps an AppError as it is', () => {
    const error = new AppError('NOT_FOUND', 'Gone')

    expect(mapToAppError(error)).toBe(error)
  })

  it('maps a CASL ForbiddenError to FORBIDDEN', () => {
    const error = ForbiddenError.from(getUserPermissions()).setMessage('No')

    expect(mapToAppError(error)).toMatchObject({
      code: 'FORBIDDEN',
      message: 'No'
    })
  })

  it.each([
    ['an Error', new Error('boom'), 'boom'],
    ['a string', 'boom', 'boom'],
    ['null', null, 'null'],
    ['an object', { reason: 'boom' }, '{"reason":"boom"}'],
    ['a number', 42, '42']
  ])('maps %s to INTERNAL_ERROR', (_, thrown, message) => {
    expect(mapToAppError(thrown)).toMatchObject({
      code: 'INTERNAL_ERROR',
      message
    })
  })
})

describe('catchAsyncError', () => {
  it('wraps a resolved value', async () => {
    const result = await catchAsyncError(Promise.resolve('ok'))

    expect(result._unsafeUnwrap()).toBe('ok')
    expect(captureError).not.toHaveBeenCalled()
  })

  it('maps a rejection and reports it', async () => {
    const result = await catchAsyncError(Promise.reject(new Error('boom')))

    expect(result._unsafeUnwrapErr()).toMatchObject({
      code: 'INTERNAL_ERROR',
      message: 'boom'
    })
    expect(captureError).toHaveBeenCalledWith(result._unsafeUnwrapErr())
  })
})
