import * as Sentry from '@sentry/bun'
import { describe, expect, it, vi } from 'vitest'

import { AppError } from '@/error/lib/AppError.js'

vi.mock('@sentry/bun', () => ({ captureException: vi.fn() }))

// The shared setup replaces captureError with a spy; this file tests the real one.
const { captureError } = await vi.importActual<
  typeof import('@/error/utils/captureError.js')
>('@/error/utils/captureError.js')

describe('captureError', () => {
  it.each(['NOT_FOUND', 'FORBIDDEN', 'BAD_REQUEST', 'UNAUTHORIZED'] as const)(
    'does not report %s',
    (code) => {
      captureError(new AppError(code))

      expect(Sentry.captureException).not.toHaveBeenCalled()
    }
  )

  it('reports a 5xx error', () => {
    const error = new AppError('INTERNAL_ERROR', 'boom')

    captureError(error)

    expect(Sentry.captureException).toHaveBeenCalledWith(error)
  })
})
