import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { Skeleton } from '@/components/atoms'
import { PageTemplate } from '@/components/layout'
import { PUBLIC_ROUTES } from '@/features/auth/lib/routes'
import { generatePageMetadata } from '@/features/metadata/utils/generatePageMetadata'
import { fetchPostImage } from '@/features/post/client/api'
import { PostDetail } from '@/features/post/components/PostDetail'
import { postWithCommentsQueryOptions } from '@/features/post/lib/queries'

const PostDetailPage = () => {
  const { postId } = Route.useParams()
  const {
    data: { post, comments }
  } = useSuspenseQuery(postWithCommentsQueryOptions(postId))
  const postImage = fetchPostImage(post.imagePath ?? '')

  return (
    <PageTemplate
      back={{ to: PUBLIC_ROUTES.POSTS, label: 'Back to posts' }}
      maxWidth="wide"
    >
      <PostDetail comments={comments} post={post} postImage={postImage} />
    </PageTemplate>
  )
}

const PostDetailSkeleton = () => {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Skeleton className="mb-6 h-10 w-24" />
      <Skeleton className="mb-8 h-[400px] w-full rounded-xl" />
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4" />

        <Skeleton className="h-4 w-32" />
      </div>
      <div className="mt-8 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_main/posts/$postId')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      postWithCommentsQueryOptions(params.postId)
    ),
  head: ({ loaderData }) =>
    generatePageMetadata({
      title: loaderData?.post.title,
      description: loaderData?.post.content
    }),
  pendingComponent: PostDetailSkeleton,
  component: PostDetailPage
})
