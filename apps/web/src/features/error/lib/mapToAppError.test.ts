import { createMongoAbility, ForbiddenError } from '@casl/ability'
import { describe, expect, it } from 'vitest'

import { respondWith, testClient } from '@/test/http'

import { AppError } from './AppError'
import { mapToAppError } from './mapToAppError'

const httpError = async (body: unknown, status: number) => {
  respondWith(body, status)
  return testClient.get('resource').catch((error: unknown) => error)
}

describe('mapToAppError', () => {
  it('keeps an AppError as it is', () => {
    const error = new AppError('NOT_FOUND')

    expect(mapToAppError(error)).toBe(error)
  })

  it('maps a CASL ForbiddenError to FORBIDDEN', () => {
    const error = ForbiddenError.from(createMongoAbility()).setMessage('No')

    expect(mapToAppError(error)).toMatchObject({
      code: 'FORBIDDEN',
      message: 'No'
    })
  })

  it('maps a backend error response to its code, message and fields', async () => {
    const error = await httpError(
      { error: { message: 'Invalid name', fields: { name: 'Required' } } },
      400
    )

    expect(mapToAppError(error)).toMatchObject({
      code: 'BAD_REQUEST',
      status: 400,
      message: 'Invalid name',
      fields: { name: 'Required' }
    })
  })

  it('maps an unknown status without a body to INTERNAL_ERROR', async () => {
    const error = await httpError('teapot', 418)

    expect(mapToAppError(error)).toMatchObject({ code: 'INTERNAL_ERROR' })
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
