import { createFileRoute, Outlet } from '@tanstack/react-router'

import { PageHeader } from '@/components/layout'
import { getUserPermissions } from '@/features/auth/lib/permission'
import { sessionQueryOptions } from '@/features/auth/lib/queries'
import { AbilityProvider } from '@/features/auth/providers/PermissionProvider'
import { ErrorScreenProvider } from '@/features/error/providers/ErrorScreenProvider'
import { catchAsyncError } from '@/features/error/utils/catchError'

const MainLayout = () => {
  const { user } = Route.useRouteContext()
  const rules = getUserPermissions(user ?? undefined).rules

  return (
    <>
      <ErrorScreenProvider />
      <PageHeader user={user} />
      <AbilityProvider rules={rules}>
        <Outlet />
      </AbilityProvider>
    </>
  )
}

export const Route = createFileRoute('/_main')({
  // Public pages still render when the session lookup fails; the header
  // then shows the signed-out state.
  beforeLoad: async ({ context }) => {
    const session = await catchAsyncError(
      context.queryClient.fetchQuery(sessionQueryOptions)
    )
    const user = session.map((state) =>
      state.status === 'ready' ? state.user : null
    )

    return { user: user.unwrapOr(null) }
  },
  component: MainLayout
})
