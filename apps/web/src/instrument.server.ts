import * as Sentry from '@sentry/tanstackstart-react'

import { env } from '@/config/env.server'
import { logger } from '@/config/logger.server'

Sentry.init({
  dsn: env.SENTRY_DSN,
  enabled: env.NODE_ENV === 'production',
  tracesSampleRate: 1
})

logger.info('Server logger initialised')
