import { createFileRoute } from '@tanstack/react-router'

import { Skeleton } from '@/components/atoms'
import { generatePageMetadata } from '@/features/metadata/utils/generatePageMetadata'
import { fetchPostImage } from '@/features/post/client/api'
import { PostsList } from '@/features/post/components/PostsList'
import { fetchPosts } from '@/features/post/server/functions'

const PostsListPage = () => {
  const posts = Route.useLoaderData()
  const imageUrls = posts.map((post) => fetchPostImage(post.imagePath ?? ''))

  return (
    <div className="container py-12">
      <div className="pb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Our Blog
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl pt-4 text-xl">
          Insights, thoughts, and trends from our team.
        </p>
      </div>

      <PostsList imageUrls={imageUrls} posts={posts} />
    </div>
  )
}

const PostsListSkeleton = () => {
  return (
    <div className="container py-12">
      <div className="pb-12 text-center">
        <Skeleton className="mx-auto h-12 w-48" />
        <Skeleton className="mx-auto mt-4 h-6 w-96 max-w-full" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {['post-skeleton-1', 'post-skeleton-2', 'post-skeleton-3'].map((id) => (
          <div className="flex flex-col space-y-3 rounded-lg" key={id}>
            <Skeleton className="h-48 w-full rounded-t-lg" />
            <div className="flex flex-col space-y-2 p-6">
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="p-6 pt-0">
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_main/posts/')({
  loader: () => fetchPosts(),
  head: () =>
    generatePageMetadata({
      title: 'Posts',
      description: 'Insights, thoughts, and trends from our team'
    }),
  pendingComponent: PostsListSkeleton,
  component: PostsListPage
})
