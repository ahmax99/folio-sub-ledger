import { TanStackDevtools } from '@tanstack/react-devtools'
/// <reference types="vite/client" />
import type { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

import { Toaster } from 'sonner'

import { NotFound, RouteError } from '@/components/layout'
import { generatePageMetadata } from '@/features/metadata/utils/generatePageMetadata'
import globalsCss from '@/styles/globals.css?url'

const RootDocument = ({
  children
}: Readonly<{ children: React.ReactNode }>) => (
  <html lang="en" suppressHydrationWarning>
    <head>
      <HeadContent />
    </head>
    <body>
      {children}
      <Toaster position="bottom-right" richColors />
      <TanStackDevtools
        plugins={[
          { name: 'TanStack Query', render: <ReactQueryDevtoolsPanel /> },
          { name: 'TanStack Router', render: <TanStackRouterDevtoolsPanel /> }
        ]}
      />
      <Scripts />
    </body>
  </html>
)

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => {
    const { meta } = generatePageMetadata()

    return {
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        ...meta
      ],
      links: [
        { rel: 'stylesheet', href: globalsCss },
        { rel: 'icon', href: '/favicon.ico', sizes: '32x32' },
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' }
      ]
    }
  },
  shellComponent: RootDocument,
  component: Outlet,
  errorComponent: RouteError,
  notFoundComponent: NotFound
})
