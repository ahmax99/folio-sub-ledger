import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { PageHeader } from '@/components/layout'
import { AbilityProvider } from '@/features/auth/client/providers/PermissionProvider'
import { getUserPermissions } from '@/features/auth/lib/permission'
import { PUBLIC_AUTH_ROUTES } from '@/features/auth/lib/routes'
import { fetchRequiredUser } from '@/features/auth/server/functions'
import { ErrorScreenProvider } from '@/features/error/client/providers/ErrorScreenProvider'

const AuthorizedLayout = () => {
  const { user } = Route.useRouteContext()
  const rules = getUserPermissions(user).rules

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

export const Route = createFileRoute('/_authorized')({
  beforeLoad: async ({ location }) => {
    const user = await fetchRequiredUser()
    if (!user)
      throw redirect({
        to: PUBLIC_AUTH_ROUTES.LOGIN,
        search: { callbackUrl: location.href }
      })

    return { user }
  },
  component: AuthorizedLayout
})
