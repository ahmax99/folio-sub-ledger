import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import type { Post, User } from '@shared/config'

import { PUBLIC_ROUTES } from '@/features/auth/lib/routes'
import { AppError } from '@/features/error/lib/AppError'

import { postKeys } from '../../lib/queries'
import type { CreatePostSchema } from '../../schemas/postForm.schema'
import { createPostClient, deletePostClient, uploadImage } from '../api'

interface CreatePostInput extends CreatePostSchema {
  authorId: User['id']
}

const uploadPostImage = async (image: File | null) => {
  if (!image) return undefined

  const { uploadResponse, key } = await uploadImage(image)
  if (!uploadResponse.ok)
    throw new AppError('BAD_REQUEST', 'Failed to upload image')

  return key
}

export const usePostActions = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const createPost = useMutation({
    mutationFn: async ({ title, content, image, authorId }: CreatePostInput) =>
      createPostClient({
        title,
        content,
        slug: title.toLowerCase().replaceAll(/\s+/g, '-'),
        imagePath: await uploadPostImage(image),
        authorId
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: postKeys.list(),
        refetchType: 'all'
      })
      await navigate({ to: PUBLIC_ROUTES.POSTS, replace: true })
    }
  })

  const deletePost = useMutation({
    mutationFn: (id: Post['id']) => deletePostClient(id),
    onSuccess: async (_, id) => {
      await queryClient.invalidateQueries({
        queryKey: postKeys.list(),
        refetchType: 'all'
      })
      await navigate({ to: PUBLIC_ROUTES.POSTS, replace: true })
      queryClient.removeQueries({ queryKey: postKeys.detail(id) })
    }
  })

  return { createPost, deletePost }
}
