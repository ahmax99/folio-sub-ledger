import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { CommentIdParams, Post } from '@shared/config'

import { postKeys } from '@/features/post/lib/queries'

import type { CreateCommentSchema } from '../../schemas/commentForm.schema'
import { createComment, deleteComment } from '../api'

export const useCreateComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCommentSchema) => createComment(input),
    onSuccess: (_, { postId }) =>
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) })
  })
}

export const useDeleteComment = (postId: Post['id']) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: CommentIdParams['id']) => deleteComment(commentId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) })
  })
}
