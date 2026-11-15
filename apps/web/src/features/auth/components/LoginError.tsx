import { Link } from '@tanstack/react-router'

import { buttonVariants } from '@/components/atoms/Button.variants'
import { PUBLIC_ROUTES } from '@/lib/routes'

const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'Sign-in was cancelled.',
  invalid_state: 'Your sign-in session expired. Please try again.',
  missing_verifier:
    'Your sign-in session was lost. Check that cookies are enabled, then try again.',
  missing_nonce:
    'Your sign-in session was lost. Check that cookies are enabled, then try again.',
  missing_code: 'The sign-in response was incomplete.',
  invalid_token: 'We could not verify your sign-in.',
  invalid_callback: 'The sign-in response was not valid.'
}

const DEFAULT_MESSAGE = 'Something went wrong while signing you in.'

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
      {LOGIN_ERROR_MESSAGES[error] ?? DEFAULT_MESSAGE}
    </p>
    <div className="flex gap-2">
      {/* A full document navigation: the BFF route answers with a redirect to Cognito. */}
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
