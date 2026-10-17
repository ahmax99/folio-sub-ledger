import type { Logger } from 'pino'

import { logger } from '@/config/logger'
import { catchAsyncError } from '@/features/error/utils/catchError'

const log = logger.child({ module: 'api' })

type RouteHandler<Context extends { request: Request }> = (
  context: Context
) => Promise<Response>

export const withRequestLogging =
  <Context extends { request: Request }>(
    handler: RouteHandler<Context>
  ): RouteHandler<Context> =>
  async (context) => {
    const { method } = context.request
    const { pathname } = new URL(context.request.url)
    const start = performance.now()

    const result = await catchAsyncError(handler(context))

    return result.match(
      (response) => {
        log.info(
          {
            req: { method, url: pathname },
            res: { status: response.status },
            durationMs: Math.round(performance.now() - start)
          },
          'Request completed'
        )
        return response
      },
      (error) => {
        log.error(
          {
            req: { method, url: pathname },
            res: { status: error.status },
            durationMs: Math.round(performance.now() - start),
            error
          },
          'Request failed'
        )
        return Response.json(
          { error: { message: error.message } },
          { status: error.status }
        )
      }
    )
  }

export const logBeforeRequest =
  (clientLog: Logger) =>
  ({ request }: { request: Request }) =>
    clientLog.info(
      { req: { method: request.method, url: request.url } },
      'Calling backend'
    )

export const logAfterResponse =
  (clientLog: Logger) =>
  ({ request, response }: { request: Request; response: Response }) =>
    clientLog.info(
      {
        req: { method: request.method, url: request.url },
        res: { status: response.status }
      },
      'Backend responded'
    )
