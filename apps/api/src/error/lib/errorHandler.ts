import type { FieldErrors } from '@shared/config'
import { Elysia, ValidationError } from 'elysia'

import { logger } from '@/config/logger.js'
import { AppError } from '@/error/lib/AppError.js'
import { captureError } from '@/error/utils/captureError.js'
import { mapToAppError } from '@/error/utils/catchError.js'

const toBadRequest = ({ all }: ValidationError) => {
  const fields: FieldErrors = {}
  for (const issue of all)
    if ('path' in issue) fields[issue.path.replace(/^\//, '')] ??= issue.message

  return new AppError('BAD_REQUEST', 'Invalid request', fields)
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
