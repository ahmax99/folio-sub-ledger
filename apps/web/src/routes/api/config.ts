import { createFileRoute } from '@tanstack/react-router'

import { sentryRuntimeConfig } from '@/features/error/server/sentryConfig.server'
import { withRequestLogging } from '@/lib/requestLogging.server'

export const Route = createFileRoute('/api/config')({
  server: {
    handlers: {
      GET: withRequestLogging(async () =>
        Response.json({ sentry: sentryRuntimeConfig() })
      )
    }
  }
})
