import { Elysia, ValidationError } from 'elysia'

import { logger } from '@/config/logger.js'
import { AppError } from '@/error/lib/AppError.js'
import { captureError } from '@/error/utils/captureError.js'
import { mapToAppError } from '@/error/utils/catchError.js'

const toBadRequest = (error: ValidationError) => {
  const issues = error.all.flatMap((issue) =>
    'path' in issue
      ? [[issue.path.replace(/^\//, ''), issue.message] as const]
      : []
  )
  const summary = issues.map(([field, message]) => `${field}: ${message}`)

  return new AppError(
    'BAD_REQUEST',
    summary.join('; ') || undefined,
    Object.fromEntries([...issues].reverse())
  )
}

export const errorHandler = new Elysia({ name: 'error-handler' })
  .error({ AppError })
  .onError({ as: 'scoped' }, ({ error, request, path }) => {
    if (error instanceof AppError) {
      logger.warn({
        msg: 'Application error',
        error: {
          name: error.name,
          message: error.message,
          status: error.status,
          code: error.code
        },
        path,
        method: request.method
      })
      return error.toResponse()
    }

    if (error instanceof ValidationError)
      return toBadRequest(error).toResponse()

    captureError(error as Error)
    return mapToAppError(error).toResponse()
  })
