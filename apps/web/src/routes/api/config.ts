import { createFileRoute } from '@tanstack/react-router'

import { env } from '@/config/env'
import { withRequestLogging } from '@/lib/requestLogging'

export const Route = createFileRoute('/api/config')({
  server: {
    handlers: {
      GET: withRequestLogging(async () =>
        Response.json({ sentryDsn: env.SENTRY_DSN ?? '' })
      )
    }
  }
})
