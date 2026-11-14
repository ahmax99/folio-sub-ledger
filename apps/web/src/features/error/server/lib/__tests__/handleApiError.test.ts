import { errAsync, okAsync } from 'neverthrow'
import { describe, expect, it } from 'vitest'

import { AppError } from '../../../lib/AppError'
import { handleApiError } from '../handleApiError'

describe('handleApiError', () => {
  it('returns the value of an Ok result', async () => {
    expect(await handleApiError(okAsync('value'))).toBe('value')
  })

  it('throws the error of an Err result', async () => {
    const error = new AppError('NOT_FOUND')

    await expect(handleApiError(errAsync(error))).rejects.toBe(error)
  })
})
