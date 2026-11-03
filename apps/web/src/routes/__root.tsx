/// <reference types="vite/client" />
import type { QueryClient } from '@tanstack/react-query'
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts
} from '@tanstack/react-router'

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
        { rel: 'icon', href: '/favicon.ico' }
      ]
    }
  },
  shellComponent: RootDocument,
  component: Outlet,
  errorComponent: RouteError,
  notFoundComponent: NotFound
})
