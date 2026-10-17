import { createFileRoute } from '@tanstack/react-router'

import { env } from '@/config/env'
import type { CallbackParams } from '@/features/auth/schemas/auth.schema'
import { handleCallback } from '@/features/auth/server/services/auth'
import { redirectResponse } from '@/lib/redirectResponse'
import { withRequestLogging } from '@/lib/requestLogging'

export const Route = createFileRoute('/api/auth/callback')({
  server: {
    handlers: {
      GET: withRequestLogging(async ({ request }) => {
        const requestUrl = new URL(request.url)
        const params = Object.fromEntries(
          requestUrl.searchParams
        ) as CallbackParams

        // Behind CloudFront + Lambda Function URL, request.url reflects the Lambda hostname (CloudFront strips the viewer Host for OAC SigV4 signing).
        const publicUrl = new URL(
          `${requestUrl.pathname}${requestUrl.search}`,
          env.BASE_URL
        )

        const { redirectUrl } = await handleCallback(publicUrl, params)

        return redirectResponse(new URL(redirectUrl, env.BASE_URL))
      })
    }
  }
})
