import { createFileRoute, redirect } from '@tanstack/react-router'

import { LoginError } from '@/features/auth/components/LoginError'
import { AuthModel } from '@/features/auth/schemas/auth.schema'
import { generatePageMetadata } from '@/features/metadata/utils/generatePageMetadata'

const LoginErrorPage = () => {
  const { callbackUrl, error } = Route.useSearch()

  return (
    <LoginError
      error={error ?? ''}
      retryHref={
        callbackUrl
          ? `/api/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
          : '/api/auth/login'
      }
    />
  )
}

export const Route = createFileRoute('/auth/login')({
  validateSearch: AuthModel.loginSearch,
  // Without an error, hand straight over to the BFF login route; with one,
  // stop and show it, so a failure that repeats cannot loop through Cognito.
  beforeLoad: ({ search }) => {
    if (search.error) return

    throw redirect({
      href: search.callbackUrl
        ? `/api/auth/login?callbackUrl=${encodeURIComponent(search.callbackUrl)}`
        : '/api/auth/login',
      reloadDocument: true
    })
  },
  head: () =>
    generatePageMetadata({
      title: 'Sign in',
      description: 'Sign in to Folio'
    }),
  component: LoginErrorPage
})
