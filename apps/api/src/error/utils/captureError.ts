import * as Sentry from '@sentry/bun'

import type { AppError } from '@/error/lib/AppError.js'

// 4xx errors are the caller's mistake and already logged; only server faults page an operator.
export const captureError = (error: AppError) => {
  if (error.status >= 500) Sentry.captureException(error)
}
