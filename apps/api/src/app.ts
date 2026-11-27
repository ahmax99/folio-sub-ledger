import { cors } from '@elysiajs/cors'
import { Elysia } from 'elysia'
import { helmet } from 'elysia-helmet'

import { env } from '@/config/env.js'
import { loggerPlugin } from '@/config/logger.js'
import { requestContextPlugin } from '@/config/requestContext.js'
import { routes } from '@/routes/index.js'

export const app = new Elysia()
  .use(loggerPlugin)
  .use(helmet())
  .use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true
    })
  )
  .get('/', () => ({
    message: 'Folio API',
    version: '1.0.0',
    documentation: '/api/v1/openapi',
    endpoints: {
      users: '/api/v1/users'
    }
  }))
  .use(routes)
  // Must stay last: a plugin used after it drops its wrap, and log lines lose the request id.
  .use(requestContextPlugin)
