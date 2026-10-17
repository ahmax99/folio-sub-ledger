import { createFileRoute } from '@tanstack/react-router'

import { handleLogin } from '@/features/auth/server/services/auth'
import { redirectResponse } from '@/lib/redirectResponse'
import { withRequestLogging } from '@/lib/requestLogging'

export const Route = createFileRoute('/api/auth/login')({
  server: {
    handlers: {
      GET: withRequestLogging(async ({ request }) => {
        const callbackUrl = new URL(request.url).searchParams.get('callbackUrl')

        const { authUrl } = await handleLogin(callbackUrl ?? undefined)

        return redirectResponse(authUrl)
      })
    }
  }
})
