import {
  type QueryClient,
  useMutation,
  useQueryClient
} from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'

import type { Comment, CommentIdParams, Post } from '@shared/config'

import { postWithCommentsQueryOptions } from '@/features/post/lib/queries'

import type { CreateCommentSchema } from '../../schemas/commentForm.schema'
import { createComment, deleteComment } from '../api'

const updateComments = async (
  queryClient: QueryClient,
  postId: Post['id'],
  update: (comments: Comment[]) => Comment[]
) => {
  const { queryKey } = postWithCommentsQueryOptions(postId)
  await queryClient.cancelQueries({ queryKey })
  const previous = queryClient.getQueryData(queryKey)

  queryClient.setQueryData(
    queryKey,
    (data) => data && { ...data, comments: update(data.comments) }
  )

  return {
    rollback: () => queryClient.setQueryData(queryKey, previous),
    refetch: () => queryClient.invalidateQueries({ queryKey })
  }
}

const useCreateComment = (queryClient: QueryClient) => {
  const { user } = useRouteContext({ from: '/_main' })

  return useMutation({
    mutationFn: (input: CreateCommentSchema) => createComment(input),
    onMutate: ({ content, postId }) => {
      const now = new Date()
      const optimistic: Comment = {
        id: crypto.randomUUID(),
        content,
        postId,
        authorId: user?.id ?? '',
        author: user
          ? { name: user.name, imagePath: user.imagePath }
          : undefined,
        createdAt: now,
        updatedAt: now
      }

      return updateComments(queryClient, postId, (comments) => [
        optimistic,
        ...comments
      ])
    },
    onError: (_error, _input, cache) => cache?.rollback(),
    onSettled: (_data, _error, _input, cache) => cache?.refetch()
  })
}

const useDeleteComment = (queryClient: QueryClient, postId: Post['id']) =>
  useMutation({
    mutationFn: (commentId: CommentIdParams['id']) => deleteComment(commentId),
    onMutate: (commentId) =>
      updateComments(queryClient, postId, (comments) =>
        comments.filter((comment) => comment.id !== commentId)
      ),
    onError: (_error, _commentId, cache) => cache?.rollback(),
    onSettled: (_data, _error, _commentId, cache) => cache?.refetch()
  })

export const useCommentActions = (postId: Post['id']) => {
  const queryClient = useQueryClient()

  return {
    createComment: useCreateComment(queryClient),
    deleteComment: useDeleteComment(queryClient, postId)
  }
}
