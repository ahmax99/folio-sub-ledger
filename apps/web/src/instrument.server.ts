import * as Sentry from '@sentry/tanstackstart-react'
import { sentryOptions } from '@shared/config'

import { env } from '@/config/env.server'
import { logger } from '@/config/logger.server'
import { sentryRuntimeConfig } from '@/features/error/server/sentryConfig.server'

Sentry.init({
  ...sentryOptions(sentryRuntimeConfig()),
  enabled: env.NODE_ENV === 'production'
})

logger.info('Server logger initialised')
