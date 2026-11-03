import { queryOptions } from '@tanstack/react-query'

import type { Post } from '@shared/config'

import { fetchPosts, fetchPostWithComments } from '../server/functions'

export const postKeys = {
  all: ['posts'] as const,
  list: () => [...postKeys.all, 'list'] as const,
  detail: (id: Post['id']) => [...postKeys.all, 'detail', id] as const
}

export const postsQueryOptions = () =>
  queryOptions({
    queryKey: postKeys.list(),
    queryFn: () => fetchPosts()
  })

// Comments ride along with their post, so comment mutations invalidate this.
export const postWithCommentsQueryOptions = (id: Post['id']) =>
  queryOptions({
    queryKey: postKeys.detail(id),
    queryFn: () => fetchPostWithComments({ data: { id } })
  })
