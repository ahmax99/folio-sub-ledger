import { createFileRoute } from '@tanstack/react-router'

import { fetchImage } from '@/features/media/server/api'
import { withRequestLogging } from '@/lib/requestLogging'

export const Route = createFileRoute('/api/images')({
  server: {
    handlers: {
      GET: withRequestLogging(async ({ request }) => {
        const imagePath = new URL(request.url).searchParams.get('path')

        if (!imagePath) return new Response(null, { status: 400 })

        const upstream = await fetchImage(imagePath)

        return new Response(upstream.body, {
          headers: {
            'Content-Type':
              upstream.headers.get('Content-Type') ??
              'application/octet-stream',
            'Cache-Control': 'public, max-age=31536000, immutable'
          }
        })
      })
    }
  }
})
