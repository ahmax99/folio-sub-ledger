import { AsyncLocalStorage } from 'node:async_hooks'
import { randomUUID } from 'node:crypto'

import * as Sentry from '@sentry/tanstackstart-react'
import { REQUEST_ID_HEADER, RequestModel } from '@shared/config'

type RequestContext = { requestId: string }

const storage = new AsyncLocalStorage<RequestContext>()

// CloudFront's id is already in its access logs, so reusing it joins those to ours; a malformed value is replaced, never logged.
const requestIdFor = (request: Request) => {
  const cloudFrontId = RequestModel.requestId.safeParse(
    request.headers.get('x-amz-cf-id')
  )
  return cloudFrontId.success ? cloudFrontId.data : randomUUID()
}

/** A copy of the current request's ids, for the logger; empty outside a request. */
// A copy, because pino's mixin merge writes the log object's fields into what the mixin returns.
export const currentRequestContext = (): Partial<RequestContext> => ({
  ...storage.getStore()
})

/** Runs one incoming request with its request id in scope, and echoes the id on the response. */
export const withRequestContext = async (
  request: Request,
  handle: (request: Request) => Promise<Response>
) => {
  const requestId = requestIdFor(request)
  Sentry.setTag('requestId', requestId)
  const response = await storage.run({ requestId }, () => handle(request))

  // A copy, because some responses (Response.redirect) have immutable headers.
  const headers = new Headers(response.headers)
  headers.set(REQUEST_ID_HEADER, requestId)
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  })
}

/** ky hook: forwards the request id and the Sentry trace to the backend. Must run before signingHook, so SigV4 signs these headers. */
export const forwardRequestContext = ({ request }: { request: Request }) => {
  const { requestId } = currentRequestContext()
  if (requestId) request.headers.set(REQUEST_ID_HEADER, requestId)

  for (const [name, value] of Object.entries(Sentry.getTraceData()))
    if (value) request.headers.set(name, value)
}
