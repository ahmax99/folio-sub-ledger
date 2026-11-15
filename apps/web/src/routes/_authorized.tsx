import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { PageHeader } from '@/components/layout'
import { fetchSessionState } from '@/features/auth/auth.functions'
import { AUTHORIZED_REDIRECTS } from '@/features/auth/lib/access'
import { getUserPermissions } from '@/features/auth/lib/permission'
import { PUBLIC_AUTH_ROUTES } from '@/features/auth/lib/routes'
import { AbilityProvider } from '@/features/auth/providers/PermissionProvider'
import { ErrorScreenProvider } from '@/features/error/providers/ErrorScreenProvider'

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
    const session = await fetchSessionState()
    if (session.status === 'ready') return { user: session.user }

    const to = AUTHORIZED_REDIRECTS[session.status]
    throw redirect(
      to === PUBLIC_AUTH_ROUTES.LOGIN
        ? { to, search: { callbackUrl: location.href } }
        : { to }
    )
  },
  component: AuthorizedLayout
})
