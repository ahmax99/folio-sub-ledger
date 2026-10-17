import { createFileRoute, Outlet } from '@tanstack/react-router'

import { PageHeader } from '@/components/layout'
import { AbilityProvider } from '@/features/auth/client/providers/PermissionProvider'
import { getUserPermissions } from '@/features/auth/lib/permission'
import { fetchOptionalUser } from '@/features/auth/server/functions'
import { ErrorScreenProvider } from '@/features/error/client/providers/ErrorScreenProvider'

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
  beforeLoad: async () => ({ user: await fetchOptionalUser() }),
  component: MainLayout
})
