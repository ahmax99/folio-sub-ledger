import { createFileRoute } from '@tanstack/react-router'

import { createComment, fetchAllComments } from '@/features/comment/server/api'
import { withRequestLogging } from '@/lib/requestLogging'

export const Route = createFileRoute('/api/comments/')({
  server: {
    handlers: {
      GET: withRequestLogging(async ({ request }) => {
        const postId = new URL(request.url).searchParams.get('postId')

        const response = await fetchAllComments(postId ?? '')

        return Response.json(response, { status: 200 })
      }),
      POST: withRequestLogging(async ({ request }) => {
        const body = await request.json()

        const comment = await createComment(body)

        return Response.json(comment, { status: 201 })
      })
    }
  }
})
