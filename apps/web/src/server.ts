import './instrument.server'
import handler, { createServerEntry } from '@tanstack/react-start/server-entry'

import { wrapFetchWithSentry } from '@sentry/tanstackstart-react'

export default createServerEntry(
  wrapFetchWithSentry({ fetch: (request: Request) => handler.fetch(request) })
)
