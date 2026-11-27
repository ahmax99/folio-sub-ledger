import type { SentryRuntimeConfig } from '@shared/config'

import { env } from '@/config/env.server'

// One source for the BFF's own Sentry and for the browser's, which reads it through /api/config.
export const sentryRuntimeConfig = (): SentryRuntimeConfig => ({
  dsn: env.SENTRY_DSN,
  environment: env.SENTRY_ENVIRONMENT,
  release: env.SENTRY_RELEASE,
  tracesSampleRate: env.SENTRY_TRACES_SAMPLE_RATE
})
