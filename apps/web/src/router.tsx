import { createRouter } from '@tanstack/react-router'

import * as Sentry from '@sentry/tanstackstart-react'

import { routeTree } from './routeTree.gen'

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true
  })

  if (!router.isServer)
    Sentry.addIntegration(
      Sentry.tanstackRouterBrowserTracingIntegration(router)
    )

  return router
}
