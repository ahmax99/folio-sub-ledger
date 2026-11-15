import { createStart } from '@tanstack/react-start'

import {
  sentryGlobalFunctionMiddleware,
  sentryGlobalRequestMiddleware
} from '@sentry/tanstackstart-react'

import { routeGuardMiddleware } from '@/features/auth/middleware/routeGuard'

export const startInstance = createStart(() => ({
  requestMiddleware: [sentryGlobalRequestMiddleware, routeGuardMiddleware],
  functionMiddleware: [sentryGlobalFunctionMiddleware]
}))
