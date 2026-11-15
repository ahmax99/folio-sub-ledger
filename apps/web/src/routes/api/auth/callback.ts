import { createFileRoute } from '@tanstack/react-router'

import { env } from '@/config/env.server'
import { AuthModel } from '@/features/auth/schemas/auth.schema'
import { handleCallback } from '@/features/auth/server/auth.server'
import { redirectResponse } from '@/lib/redirectResponse'
import { withRequestLogging } from '@/lib/requestLogging.server'

export const Route = createFileRoute('/api/auth/callback')({
  server: {
    handlers: {
      GET: withRequestLogging(async ({ request }) => {
        const requestUrl = new URL(request.url)
        const params = AuthModel.callbackParams.safeParse(
          Object.fromEntries(requestUrl.searchParams)
        )
        if (!params.success)
          return redirectResponse(
            new URL('/auth/login?error=invalid_callback', env.BASE_URL)
          )

        // Behind CloudFront + Lambda Function URL, request.url reflects the Lambda hostname (CloudFront strips the viewer Host for OAC SigV4 signing).
        const publicUrl = new URL(
          `${requestUrl.pathname}${requestUrl.search}`,
          env.BASE_URL
        )

        const { redirectUrl } = await handleCallback(publicUrl, params.data)

        return redirectResponse(new URL(redirectUrl, env.BASE_URL))
      })
    }
  }
})
