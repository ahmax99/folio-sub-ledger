import { createFileRoute } from '@tanstack/react-router'

import { createPostServer, fetchAllPosts } from '@/features/post/server/api'
import { withRequestLogging } from '@/lib/requestLogging'

export const Route = createFileRoute('/api/posts/')({
  server: {
    handlers: {
      GET: withRequestLogging(async () => {
        const response = await fetchAllPosts()

        return Response.json(response, { status: 200 })
      }),
      POST: withRequestLogging(async ({ request }) => {
        const body = await request.json()

        const response = await createPostServer(body)

        return Response.json(response, { status: 201 })
      })
    }
  }
})
