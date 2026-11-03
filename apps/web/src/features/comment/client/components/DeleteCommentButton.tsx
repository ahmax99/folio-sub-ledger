'use client'

import type { CommentIdParams, Post } from '@shared/config'
import { Trash2 } from 'lucide-react'

import { ActionButton } from '@/components/organisms'

import { useCommentActions } from '../hooks/useCommentActions'

interface DeleteCommentButtonProps {
  commentId: CommentIdParams['id']
  postId: Post['id']
}

export const DeleteCommentButton = ({
  commentId,
  postId
}: DeleteCommentButtonProps) => {
  const { deleteComment } = useCommentActions(postId)

  return (
    <ActionButton
      action={() => deleteComment.mutate(commentId)}
      isPending={deleteComment.isPending}
      areYouSureDescription="This will permanently delete your comment."
      requireAreYouSure
      size="icon"
      variant="ghost"
    >
      <Trash2 className="text-destructive size-4" />
    </ActionButton>
  )
}
