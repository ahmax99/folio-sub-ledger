import { createFileRoute } from '@tanstack/react-router'

import { setupFirm } from '@/features/organization/server/api'
import { withRequestLogging } from '@/lib/requestLogging'

export const Route = createFileRoute('/api/organizations')({
  server: {
    handlers: {
      POST: withRequestLogging(async ({ request }) => {
        const response = await setupFirm(await request.json())

        return Response.json(response, { status: 200 })
      })
    }
  }
})
