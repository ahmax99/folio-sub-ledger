import { createFileRoute } from '@tanstack/react-router'

import { handleLogout } from '@/features/auth/server/services/auth'
import { redirectResponse } from '@/lib/redirectResponse'
import { withRequestLogging } from '@/lib/requestLogging'

export const Route = createFileRoute('/api/auth/logout')({
  server: {
    handlers: {
      GET: withRequestLogging(async () => {
        const { logoutUrl } = await handleLogout()

        return redirectResponse(logoutUrl)
      })
    }
  }
})
