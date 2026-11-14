import * as Sentry from '@sentry/tanstackstart-react'

export const captureError = (error: unknown) => Sentry.captureException(error)
