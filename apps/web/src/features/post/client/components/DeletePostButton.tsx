'use client'

import { subject } from '@casl/ability'
import { useAbility } from '@casl/react'
import type { Post } from '@shared/config'
import { Trash2 } from 'lucide-react'

import { ActionButton } from '@/components/organisms'
import type { AppAbility } from '@/lib/casl'

import { useDeletePost } from '../hooks/usePostMutations'

interface DeletePostButtonProps {
  post: Pick<Post, 'id' | 'authorId'>
}

export const DeletePostButton = ({ post }: DeletePostButtonProps) => {
  const ability = useAbility<AppAbility>()
  const deletePost = useDeletePost()

  if (!ability.can('delete', subject('Post', post))) return null

  return (
    <ActionButton
      action={() => deletePost.mutate(post.id)}
      isPending={deletePost.isPending}
      areYouSureDescription="This will permanently delete this post."
      aria-label="Delete post"
      requireAreYouSure
      size="icon"
      variant="ghost"
    >
      <Trash2 className="text-destructive size-4" />
    </ActionButton>
  )
}
