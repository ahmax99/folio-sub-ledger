import { Link } from '@tanstack/react-router'

import { buttonVariants } from '@/components/atoms/Button.variants'
import { PUBLIC_ROUTES } from '@/lib/routes'

import {
  DEFAULT_LOGIN_ERROR_MESSAGE,
  LOGIN_ERROR_MESSAGES
} from '../constants/loginError'

interface LoginErrorProps {
  error: string
  retryHref: string
}

export const LoginError = ({ error, retryHref }: Readonly<LoginErrorProps>) => (
  <main
    className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center"
    data-slot="login-error"
  >
    <h1 className="text-2xl font-semibold">Sign-in failed</h1>
    <p className="text-muted-foreground max-w-md" role="alert">
      {LOGIN_ERROR_MESSAGES[error] ?? DEFAULT_LOGIN_ERROR_MESSAGE}
    </p>
    <div className="flex gap-2">
      <a className={buttonVariants()} href={retryHref}>
        Try again
      </a>
      <Link
        className={buttonVariants({ variant: 'outline' })}
        to={PUBLIC_ROUTES.HOME}
      >
        Go home
      </Link>
    </div>
  </main>
)
