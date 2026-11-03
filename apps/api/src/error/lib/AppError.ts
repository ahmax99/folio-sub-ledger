import {
  ERROR_DEFINITIONS,
  type ErrorBody,
  type ErrorCode,
  type FieldErrors
} from '@shared/config'

export class AppError extends Error {
  readonly status: number
  readonly code: ErrorCode
  readonly fields?: FieldErrors

  constructor(code: ErrorCode, message?: string, fields?: FieldErrors) {
    const definition = ERROR_DEFINITIONS[code]
    super(message ?? definition.message)
    this.code = code
    this.status = definition.status
    this.fields = fields
  }

  toResponse() {
    const body: ErrorBody = {
      error: { message: this.message, fields: this.fields }
    }

    return Response.json(body, { status: this.status })
  }
}
