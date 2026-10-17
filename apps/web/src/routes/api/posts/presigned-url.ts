import { createFileRoute } from '@tanstack/react-router'

import { fetchPreSignedUrl } from '@/features/post/server/api'
import { withRequestLogging } from '@/lib/requestLogging'

export const Route = createFileRoute('/api/posts/presigned-url')({
  server: {
    handlers: {
      GET: withRequestLogging(async ({ request }) => {
        const { searchParams } = new URL(request.url)
        const filename = searchParams.get('filename') as string
        const contentType = searchParams.get('contentType') as string

        const response = await fetchPreSignedUrl({ filename, contentType })

        return Response.json(response, { status: 200 })
      })
    }
  }
})
