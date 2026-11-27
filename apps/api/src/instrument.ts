import * as Sentry from '@sentry/bun'
import { sentryOptions } from '@shared/config'

import { env } from '@/config/env.js'

Sentry.init({
  ...sentryOptions({
    dsn: env.SENTRY_DSN,
    environment: env.SENTRY_ENVIRONMENT,
    release: env.SENTRY_RELEASE,
    tracesSampleRate: env.SENTRY_TRACES_SAMPLE_RATE
  }),
  enabled: env.NODE_ENV === 'production'
})
