import { createFileRoute } from '@tanstack/react-router'

import type { CommentIdParams } from '@shared/config'

import { deleteComment } from '@/features/comment/server/api'
import { withRequestLogging } from '@/lib/requestLogging'

interface RouteContext {
  request: Request
  params: { commentId: CommentIdParams['id'] }
}

export const Route = createFileRoute('/api/comments/$commentId')({
  server: {
    handlers: {
      DELETE: withRequestLogging(async ({ params }: RouteContext) => {
        const response = await deleteComment(params.commentId)

        return Response.json(response, { status: 200 })
      })
    }
  }
})
