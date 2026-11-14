import { createFileRoute } from '@tanstack/react-router'

import { OAuth2Start } from '@/features/auth/components/OAuth2Start'

interface LoginSearch {
  callbackUrl?: string
  error?: string
}

const LoginPage = () => {
  const { callbackUrl } = Route.useSearch()

  return <OAuth2Start callbackUrl={callbackUrl} />
}

export const Route = createFileRoute('/auth/login')({
  validateSearch: (search): LoginSearch => ({
    callbackUrl:
      typeof search.callbackUrl === 'string' ? search.callbackUrl : undefined,
    error: typeof search.error === 'string' ? search.error : undefined
  }),
  component: LoginPage
})
