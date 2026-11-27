import './instrument.server'
import handler, { createServerEntry } from '@tanstack/react-start/server-entry'

import { wrapFetchWithSentry } from '@sentry/tanstackstart-react'

import { withRequestContext } from '@/lib/requestContext.server'

export default createServerEntry(
  wrapFetchWithSentry({
    fetch: (request: Request) =>
      withRequestContext(request, async (request) => handler.fetch(request))
  })
)
