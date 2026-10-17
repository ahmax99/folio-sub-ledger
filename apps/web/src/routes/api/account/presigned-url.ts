import { createFileRoute } from '@tanstack/react-router'

import { fetchPresignedUrl } from '@/features/account/server/api'
import { withRequestLogging } from '@/lib/requestLogging'

export const Route = createFileRoute('/api/account/presigned-url')({
  server: {
    handlers: {
      GET: withRequestLogging(async ({ request }) => {
        const { searchParams } = new URL(request.url)
        const filename = searchParams.get('filename') as string
        const contentType = searchParams.get('contentType') as string

        const response = await fetchPresignedUrl({ filename, contentType })

        return Response.json(response, { status: 200 })
      })
    }
  }
})
