import { createFileRoute, Link, redirect } from '@tanstack/react-router'

import { Skeleton } from '@/components/atoms'
import { Logo } from '@/components/molecules/Logo'
import { LogoutButton } from '@/features/auth/components/LogoutButton'
import { SETUP_REDIRECTS } from '@/features/auth/lib/access'
import { sessionQueryOptions } from '@/features/auth/lib/queries'
import { generatePageMetadata } from '@/features/metadata/utils/generatePageMetadata'
import { OrganizationSetupForm } from '@/features/organization/components/OrganizationSetupForm'
import { PUBLIC_ROUTES } from '@/lib/routes'

const SetupPage = () => (
  <>
    <header className="px-4 md:px-6">
      <nav aria-label="Site" className="flex h-16 items-center justify-between">
        <Link to={PUBLIC_ROUTES.HOME}>
          <Logo />
        </Link>
        <LogoutButton />
      </nav>
    </header>
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <OrganizationSetupForm />
    </main>
  </>
)

const SetupSkeleton = () => (
  <div className="mx-auto mt-24 w-full space-y-4 px-4 sm:max-w-96">
    <Skeleton className="h-8 w-40" />
    <Skeleton className="h-4 w-56" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-full" />
  </div>
)

export const Route = createFileRoute('/setup')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.fetchQuery(sessionQueryOptions)
    if (session.status === 'no-organization') return

    throw redirect({ to: SETUP_REDIRECTS[session.status] })
  },
  head: () =>
    generatePageMetadata({
      title: 'Set up your firm',
      description: 'Create your firm to start using Folio'
    }),
  pendingComponent: SetupSkeleton,
  component: SetupPage
})
