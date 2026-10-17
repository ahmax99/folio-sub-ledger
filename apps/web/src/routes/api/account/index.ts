import { createFileRoute } from '@tanstack/react-router'

import { deleteUser, updateUser } from '@/features/account/server/api'
import { getMe } from '@/features/auth/server/api'
import { withRequestLogging } from '@/lib/requestLogging'

export const Route = createFileRoute('/api/account/')({
  server: {
    handlers: {
      PUT: withRequestLogging(async ({ request }) => {
        const [body, user] = await Promise.all([request.json(), getMe()])
        const response = await updateUser(user.id, body)

        return Response.json(response, { status: 200 })
      }),
      DELETE: withRequestLogging(async () => {
        const user = await getMe()
        const response = await deleteUser(user.id)

        return Response.json(response, { status: 200 })
      })
    }
  }
})
