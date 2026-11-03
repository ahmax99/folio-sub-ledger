import type {
  CreatePostBody,
  PostIdParams,
  UpdatePostBody
} from '@shared/config'
import { prisma } from '@shared/neon'

import { catchAsyncError } from '@/error/utils/catchError.js'
import { authorizeResource } from '@/lib/authorizeResource.js'
import { type AppAbility, accessibleBy, subject } from '@/lib/casl-prisma.js'

const findPost = (
  id: PostIdParams['id'],
  ability: AppAbility,
  action: 'read' | 'update' | 'delete'
) =>
  authorizeResource(
    prisma.post.findUnique({ where: { id, deletedAt: null } }),
    {
      notFound: 'Post not found',
      forbidden: `Cannot ${action} this post`,
      can: (post) => ability.can(action, subject('Post', post))
    }
  )

export const PostService = {
  getAll: (ability: AppAbility) =>
    catchAsyncError(
      prisma.post.findMany({
        where: {
          AND: [{ deletedAt: null }, accessibleBy(ability).ofType('Post')]
        },
        orderBy: { createdAt: 'desc' }
      })
    ),

  getById: (id: PostIdParams['id'], ability: AppAbility) =>
    findPost(id, ability, 'read'),

  create: (input: CreatePostBody, ability: AppAbility) =>
    authorizeResource(input, {
      forbidden: 'Cannot create post',
      can: () => ability.can('create', 'Post')
    }).andThen(({ title, content, slug, imagePath, authorId }) =>
      catchAsyncError(
        prisma.post.create({
          data: {
            title,
            content,
            slug,
            imagePath,
            authorId,
            createdAt: new Date()
          }
        })
      )
    ),

  update: (
    id: PostIdParams['id'],
    input: UpdatePostBody,
    ability: AppAbility
  ) =>
    findPost(id, ability, 'update').andThen(() =>
      catchAsyncError(prisma.post.update({ where: { id }, data: input }))
    ),

  delete: (id: PostIdParams['id'], ability: AppAbility) =>
    findPost(id, ability, 'delete').andThen(() =>
      catchAsyncError(
        prisma.post.update({ where: { id }, data: { deletedAt: new Date() } })
      )
    )
}
