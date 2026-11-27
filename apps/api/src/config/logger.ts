import { createPinoLogger } from '@bogeychan/elysia-logger'

import { env } from '@/config/env.js'
import {
  currentRequestContext,
  requestContextOf
} from '@/config/requestContext.js'

export const logger = createPinoLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  ...(env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname'
      }
    }
  }),
  mixin: currentRequestContext,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers["x-api-key"]',
      '*.password',
      '*.token',
      '*.secret'
    ],
    censor: '[REDACTED]'
  }
})

export const loggerPlugin = () =>
  logger.into({
    autoLogging: {
      ignore: (ctx) =>
        env.NODE_ENV === 'production' &&
        (ctx.path === '/' || ctx.path === '/health')
    },
    // These lines are written after the handler returns, outside the store, and their formatter drops mixin fields.
    customProps: (ctx) => {
      const user = 'user' in ctx ? (ctx.user as { cognitoSub?: string }) : null

      return {
        ...requestContextOf(ctx.request),
        ...(user && { userId: user.cognitoSub })
      }
    }
  })
