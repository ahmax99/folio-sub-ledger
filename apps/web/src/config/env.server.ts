import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    AWS_REGION: z.string().min(1).default('ap-northeast-1'),
    BACKEND_INTERNAL_URL: z.url().default('http://localhost:4000/api/v1'),
    BASE_URL: z.url().default('http://localhost:3000'),
    COGNITO_CLIENT_ID: z.string().min(1).default('dummy-client-id'),
    COGNITO_DOMAIN: z.string().min(1).default('dummy-domain'),
    COGNITO_USERPOOL_ID: z.string().min(1).default('dummy-userpool-id'),
    CONTACT_TO_EMAIL: z.email().default('noreply@example.com'),
    FROM_EMAIL: z.email().default('noreply@example.com'),
    NODE_ENV: z.enum(['development', 'production']).default('production'),
    RESEND_API_KEY: z.string().min(1).default('dummy-key'),
    SENTRY_DSN: z.url().optional(),
    SENTRY_ENVIRONMENT: z.string().min(1).default('local'),
    // Baked into the image from its tag at build time, read here at runtime.
    SENTRY_RELEASE: z.string().min(1).optional(),
    SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0),
    SESSION_SECRET: z.string().min(32)
  },
  runtimeEnv: process.env,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true
})
