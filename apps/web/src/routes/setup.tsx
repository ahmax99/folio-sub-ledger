import { createFileRoute, Link, redirect } from '@tanstack/react-router'

import { Skeleton } from '@/components/atoms'
import { Logo } from '@/components/molecules/Logo'
import { fetchSessionState } from '@/features/auth/auth.functions'
import { LogoutButton } from '@/features/auth/components/LogoutButton'
import { SETUP_REDIRECTS } from '@/features/auth/lib/access'
import { PUBLIC_ROUTES } from '@/features/auth/lib/routes'
import { generatePageMetadata } from '@/features/metadata/utils/generatePageMetadata'
import { FirmSetupForm } from '@/features/organization/components/FirmSetupForm'

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
      <FirmSetupForm />
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
  beforeLoad: async () => {
    const session = await fetchSessionState()
    if (session.status === 'no-firm') return

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
