import { createFileRoute } from '@tanstack/react-router'

import { Skeleton } from '@/components/atoms'
import { PageTemplate } from '@/components/layout'
import { AccountForm } from '@/features/account/components/AccountForm'
import { PROTECTED_ROUTES } from '@/features/auth/lib/routes'
import { generatePageMetadata } from '@/features/metadata/utils/generatePageMetadata'

const EditAccountPage = () => {
  const { user } = Route.useRouteContext()

  return (
    <PageTemplate
      back={{ to: PROTECTED_ROUTES.ACCOUNT, label: 'Back to Account' }}
    >
      <div className="flex w-full flex-col items-center justify-center">
        <AccountForm user={user} />
      </div>
    </PageTemplate>
  )
}

const EditAccountSkeleton = () => {
  return (
    <div className="mx-auto my-6 max-w-2xl px-4">
      <div className="mb-8">
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="flex w-full flex-col items-center justify-center">
        <div className="w-full space-y-4 sm:max-w-96">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authorized/account/edit')({
  head: () =>
    generatePageMetadata({
      title: 'Edit Profile',
      description: 'Update your profile information'
    }),
  pendingComponent: EditAccountSkeleton,
  component: EditAccountPage
})
