import type { CommentIdParams, CreateCommentBody } from '@shared/config'
import { prisma } from '@shared/neon'

import { catchAsyncError } from '@/error/utils/catchError.js'
import { authorizeResource } from '@/lib/authorizeResource.js'
import { type AppAbility, accessibleBy, subject } from '@/lib/casl-prisma.js'

export const CommentService = {
  getAll: (postId: string, ability: AppAbility) =>
    catchAsyncError(
      prisma.comment.findMany({
        where: {
          AND: [
            { postId, deletedAt: null },
            accessibleBy(ability).ofType('Comment')
          ]
        },
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { name: true, imagePath: true } } }
      })
    ),

  create: (input: CreateCommentBody, ability: AppAbility) =>
    authorizeResource(input, {
      forbidden: 'Cannot create comment',
      can: () => ability.can('create', 'Comment')
    }).andThen(({ content, postId, authorId }) =>
      catchAsyncError(
        prisma.comment.create({ data: { content, postId, authorId } })
      )
    ),

  delete: (id: CommentIdParams['id'], ability: AppAbility) =>
    authorizeResource(
      prisma.comment.findUnique({ where: { id, deletedAt: null } }),
      {
        notFound: 'Comment not found',
        forbidden: 'Cannot delete this comment',
        can: (comment) => ability.can('delete', subject('Comment', comment))
      }
    ).andThen(() =>
      catchAsyncError(
        prisma.comment.update({
          where: { id },
          data: { deletedAt: new Date() }
        })
      )
    )
} as const
