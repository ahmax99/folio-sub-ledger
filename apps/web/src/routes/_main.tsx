import { createFileRoute, Outlet } from '@tanstack/react-router'

import { PageHeader } from '@/components/layout'
import { fetchOptionalUser } from '@/features/auth/auth.functions'
import { getUserPermissions } from '@/features/auth/lib/permission'
import { AbilityProvider } from '@/features/auth/providers/PermissionProvider'
import { ErrorScreenProvider } from '@/features/error/providers/ErrorScreenProvider'

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
