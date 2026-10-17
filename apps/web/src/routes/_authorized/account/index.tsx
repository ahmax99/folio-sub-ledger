import { createFileRoute } from '@tanstack/react-router'

import { Skeleton } from '@/components/atoms'
import { PageTemplate } from '@/components/layout'
import {
  AccountManagement,
  type AccountTab
} from '@/features/account/client/components/AccountManagement'
import { UserInfo } from '@/features/account/components/UserInfo'
import { PUBLIC_ROUTES } from '@/features/auth/lib/routes'
import { generatePageMetadata } from '@/features/metadata/utils/generatePageMetadata'

export interface AccountSearch {
  tab?: AccountTab
}

const AccountPage = () => {
  const { user } = Route.useRouteContext()
  const { tab } = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <PageTemplate back={{ to: PUBLIC_ROUTES.HOME, label: 'Back to Home' }}>
      <div className="flex flex-col gap-8">
        <UserInfo user={user} />
        <AccountManagement
          activeTab={tab ?? 'profile'}
          onTabChange={(next) =>
            navigate({
              search: { tab: next },
              replace: true,
              resetScroll: false
            })
          }
        />
      </div>
    </PageTemplate>
  )
}

const AccountSkeleton = () => {
  return (
    <div className="mx-auto my-6 max-w-2xl px-4">
      <div className="mb-8">
        <Skeleton className="mb-6 inline-flex h-6 w-36" />
      </div>
      <div className="flex flex-col gap-8">
        <div className="flex items-center space-x-4">
          <Skeleton className="size-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-full rounded-md" />

          <Skeleton className="h-7 w-24" />

          {['card-skeleton-1', 'card-skeleton-2'].map((id) => (
            <div
              className="flex items-center justify-between rounded-lg p-6"
              key={id}
            >
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-64 max-w-full" />
              </div>
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>
          ))}

          <Skeleton className="h-7 w-28" />

          <div className="flex items-center justify-between rounded-lg p-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-72 max-w-full" />
            </div>
            <Skeleton className="h-10 w-36 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authorized/account/')({
  validateSearch: (search): AccountSearch => ({
    tab: search.tab === 'danger-zone' ? 'danger-zone' : undefined
  }),
  head: () =>
    generatePageMetadata({
      title: 'Account',
      description: 'Manage your account settings'
    }),
  pendingComponent: AccountSkeleton,
  component: AccountPage
})
