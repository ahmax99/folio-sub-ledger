import { createFileRoute } from '@tanstack/react-router'

import type { PostIdParams } from '@shared/config'

import { deletePostServer, fetchPost } from '@/features/post/server/api'
import { withRequestLogging } from '@/lib/requestLogging'

interface RouteContext {
  request: Request
  params: { postId: PostIdParams['id'] }
}

export const Route = createFileRoute('/api/posts/$postId')({
  server: {
    handlers: {
      GET: withRequestLogging(async ({ params }: RouteContext) => {
        const response = await fetchPost(params.postId)

        return Response.json(response, { status: 200 })
      }),
      DELETE: withRequestLogging(async ({ params }: RouteContext) => {
        const response = await deletePostServer(params.postId)

        return Response.json(response, { status: 200 })
      })
    }
  }
})
