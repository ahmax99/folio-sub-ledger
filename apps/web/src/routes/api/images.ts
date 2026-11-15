import { createFileRoute } from '@tanstack/react-router'

import { serveImage } from '@/features/media/server/image.server'
import { withRequestLogging } from '@/lib/requestLogging.server'

export const Route = createFileRoute('/api/images')({
  server: {
    handlers: {
      GET: withRequestLogging(async ({ request }) =>
        serveImage(new URL(request.url).searchParams)
      )
    }
  }
})
