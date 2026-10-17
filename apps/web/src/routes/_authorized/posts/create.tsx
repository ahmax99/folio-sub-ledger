import { createFileRoute, redirect } from '@tanstack/react-router'

import { Skeleton } from '@/components/atoms'
import { PageTemplate } from '@/components/layout'
import { ADMIN_ONLY_FORBIDDEN_MESSAGE } from '@/features/auth/constants/toastMessages'
import { getUserPermissions } from '@/features/auth/lib/permission'
import { PUBLIC_ROUTES } from '@/features/auth/lib/routes'
import { generatePageMetadata } from '@/features/metadata/utils/generatePageMetadata'
import {
  type FieldConfig,
  PostForm
} from '@/features/post/client/components/PostForm'

const CreatePostPage = () => {
  const { user } = Route.useRouteContext()

  const createPostConfig = {
    title: 'Create Post',
    description: 'Share your thoughts with the big world',
    submitLabel: 'Create Post',
    defaultValues: {
      title: '',
      content: '',
      image: ''
    },
    fields: [
      {
        name: 'title' as FieldConfig['name'],
        label: 'Title',
        description: 'Enter your post title'
      },
      {
        name: 'content' as FieldConfig['name'],
        label: 'Content',
        description: 'Enter your post content'
      },
      {
        name: 'image' as FieldConfig['name'],
        label: 'Image',
        description: 'Enter your post image'
      }
    ]
  }

  return (
    <PageTemplate alignment="center">
      <PostForm config={createPostConfig} user={user} />
    </PageTemplate>
  )
}

const CreatePostSkeleton = () => {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-center">
      <div className="w-full space-y-4 sm:max-w-96">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authorized/posts/create')({
  beforeLoad: ({ context }) => {
    if (!getUserPermissions(context.user).can('create', 'Post'))
      throw redirect({
        href: `${PUBLIC_ROUTES.HOME}?error=${encodeURIComponent(ADMIN_ONLY_FORBIDDEN_MESSAGE)}`
      })
  },
  head: () =>
    generatePageMetadata({
      title: 'Create Post',
      description: 'Share your thoughts with the big world'
    }),
  pendingComponent: CreatePostSkeleton,
  component: CreatePostPage
})
