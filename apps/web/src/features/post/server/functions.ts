import { createServerFn } from '@tanstack/react-start'

import { PostModel } from '@shared/config'

import { fetchAllComments } from '@/features/comment/server/api'

import { fetchAllPosts, fetchPost } from './api'

export const fetchPosts = createServerFn().handler(() => fetchAllPosts())

export const fetchPostWithComments = createServerFn()
  .validator(PostModel.postIdParams)
  .handler(async ({ data: { id } }) => {
    const [post, comments] = await Promise.all([
      fetchPost(id),
      fetchAllComments(id)
    ])

    return { post, comments }
  })
