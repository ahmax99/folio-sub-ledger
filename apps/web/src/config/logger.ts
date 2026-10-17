import pino from 'pino'
import pretty from 'pino-pretty'

import { env } from '@/config/env'

const isDevelopment = env.NODE_ENV === 'development'

const devStream = isDevelopment
  ? pretty({
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'SYS:HH:MM:ss'
    })
  : undefined

export const logger = pino(
  {
    level: isDevelopment ? 'debug' : 'info',
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.headers["x-id-token"]',
        '*.password',
        '*.token',
        '*.secret',
        '*.idToken',
        '*.accessToken',
        '*.refreshToken',
        '*.id_token',
        '*.access_token',
        '*.refresh_token'
      ],
      censor: '[REDACTED]'
    }
  },
  devStream
)
