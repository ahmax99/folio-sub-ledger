import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { PageHeader } from '@/components/layout'
import { AUTHORIZED_REDIRECTS } from '@/features/auth/lib/access'
import { getUserPermissions } from '@/features/auth/lib/permission'
import { sessionQueryOptions } from '@/features/auth/lib/queries'
import { AbilityProvider } from '@/features/auth/providers/PermissionProvider'
import { ErrorScreenProvider } from '@/features/error/providers/ErrorScreenProvider'
import { PUBLIC_AUTH_ROUTES } from '@/lib/routes'

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
  beforeLoad: async ({ context, location }) => {
    const session = await context.queryClient.fetchQuery(sessionQueryOptions)
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
