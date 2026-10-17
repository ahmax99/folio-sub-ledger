import { Link } from '@tanstack/react-router'

import type { User } from '@shared/config'

import { LogoutButton } from '@/features/auth/components/LogoutButton'
import { getUserPermissions } from '@/features/auth/lib/permission'
import {
  PROTECTED_ROUTES,
  PUBLIC_AUTH_ROUTES,
  PUBLIC_ROUTES
} from '@/features/auth/lib/routes'

import { ButtonLink } from '../atoms/ButtonLink'
import { Logo } from '../molecules/Logo'

interface PageHeaderProps {
  user: User | null
}

function PageHeader({ user }: Readonly<PageHeaderProps>) {
  const permission = getUserPermissions(user ?? undefined)

  const navItems = [
    { name: 'Blog', href: PUBLIC_ROUTES.POSTS },
    {
      name: 'Create',
      href: PROTECTED_ROUTES.POST_CREATE,
      disabled: !permission.can('create', 'Post')
    },
    { name: 'Contact', href: PUBLIC_ROUTES.CONTACT_US }
  ]

  return (
    <header className="px-4 md:px-6">
      <nav className="flex h-16 justify-between gap-4">
        <div className="flex gap-2">
          <div className="flex items-center gap-6">
            <Link to={PUBLIC_ROUTES.HOME}>
              <Logo />
            </Link>

            <nav className="hidden gap-6 md:flex">
              {navItems.map((item) =>
                item.disabled ? (
                  <span
                    className="text-muted-foreground cursor-not-allowed opacity-50"
                    key={item.name}
                  >
                    {item.name}
                  </span>
                ) : (
                  <Link
                    className="hover:text-primary"
                    to={item.href}
                    key={item.name}
                  >
                    {item.name}
                  </Link>
                )
              )}
            </nav>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <ButtonLink to={PROTECTED_ROUTES.ACCOUNT}>
                Go to Account
              </ButtonLink>
              <LogoutButton />
            </>
          ) : (
            <ButtonLink to={PUBLIC_AUTH_ROUTES.LOGIN}>Sign In</ButtonLink>
          )}
        </div>
      </nav>
    </header>
  )
}

export { PageHeader }
