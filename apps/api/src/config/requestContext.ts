import { AsyncLocalStorage } from 'node:async_hooks'
import { randomUUID } from 'node:crypto'

import * as Sentry from '@sentry/bun'
import { REQUEST_ID_HEADER, RequestModel } from '@shared/config'
import { Elysia } from 'elysia'

// Ids only: these fields go on every log line, so no email or name ever belongs here.
type RequestContext = {
  requestId: string
  orgId?: string
  memberId?: string
}

const storage = new AsyncLocalStorage<RequestContext>()
// For the logger's per-request lines, which run after the handler returns, outside the store.
const contextByRequest = new WeakMap<Request, RequestContext>()

/** A copy of the current request's ids, for the logger; empty outside a request. */
// A copy, because pino's mixin merge writes the log object's fields into what the mixin returns.
export const currentRequestContext = (): Partial<RequestContext> => ({
  ...storage.getStore()
})

/** The context of a request that may already have finished. */
export const requestContextOf = (
  request: Request
): Partial<RequestContext> => ({ ...contextByRequest.get(request) })

/** Adds the caller's organization and member once the `organization` macro resolves them. */
export const addMemberToRequestContext = (member: {
  id: string
  orgId: string
}) => {
  const context = storage.getStore()
  if (!context) return
  context.orgId = member.orgId
  context.memberId = member.id
}

// The BFF sends its request id; a missing or malformed one is replaced, so a caller cannot inject log content.
const contextFor = (request: Request): RequestContext => {
  const incoming = RequestModel.requestId.safeParse(
    request.headers.get(REQUEST_ID_HEADER)
  )
  const context = {
    requestId: incoming.success ? incoming.data : randomUUID()
  }
  contextByRequest.set(request, context)
  return context
}

// wrap runs the whole handler, hooks included, inside one store, so every log line of the request sees it.
export const requestContextPlugin = new Elysia({ name: 'request-context' })
  .wrap(
    (handle, request) =>
      (...args: unknown[]) =>
        storage.run(contextFor(request), () => handle(...args))
  )
  .onRequest(({ set }) => {
    const { requestId } = currentRequestContext()
    if (!requestId) return
    set.headers[REQUEST_ID_HEADER] = requestId
    Sentry.setTag('requestId', requestId)
  })

/** Echoes the request id on a Response, which Elysia's `set.headers` does not reach. */
export const withRequestId = (response: Response) => {
  const { requestId } = currentRequestContext()
  if (requestId) response.headers.set(REQUEST_ID_HEADER, requestId)
  return response
}
