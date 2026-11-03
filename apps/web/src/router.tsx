import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'

import * as Sentry from '@sentry/tanstackstart-react'

import { createQueryClient } from './lib/queryClient'
import { routeTree } from './routeTree.gen'

export const getRouter = () => {
  const queryClient = createQueryClient()
  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  })

  setupRouterSsrQueryIntegration({ router, queryClient })

  if (!router.isServer)
    Sentry.addIntegration(
      Sentry.tanstackRouterBrowserTracingIntegration(router)
    )

  return router
}
