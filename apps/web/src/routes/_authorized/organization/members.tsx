import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { PageTemplate, RouteError } from '@/components/layout'
import { generatePageMetadata } from '@/features/metadata/utils/generatePageMetadata'
import {
  MemberList,
  MemberListSkeleton
} from '@/features/organization/components/MemberList'
import { membersQueryOptions } from '@/features/organization/lib/queries'
import { PROTECTED_ROUTES } from '@/lib/routes'

const back = { to: PROTECTED_ROUTES.ORGANIZATION_HOME, label: 'Back to Firm' }
// wide: at sm the Email column needs the room to show whole addresses.

const MembersPage = () => {
  const { data } = useSuspenseQuery(membersQueryOptions)
  const { user } = Route.useRouteContext()

  return (
    <PageTemplate back={back} maxWidth="wide">
      <MemberList currentUserId={user.id} members={data} />
    </PageTemplate>
  )
}

export const Route = createFileRoute('/_authorized/organization/members')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(membersQueryOptions),
  head: () =>
    generatePageMetadata({
      title: 'Members',
      description: "Your firm's members"
    }),
  pendingComponent: () => (
    <PageTemplate back={back} maxWidth="wide">
      <MemberListSkeleton />
    </PageTemplate>
  ),
  errorComponent: (props) => (
    <PageTemplate back={back} maxWidth="wide">
      <RouteError
        {...props}
        description="Check your connection and try again. If it keeps happening, sign out and back in."
        fill="parent"
        retry
        title="We couldn't load your firm's members"
      />
    </PageTemplate>
  ),
  component: MembersPage
})
