import { z } from 'zod'

export const ErrorModel = {
  errorBody: z.object({
    error: z.object({
      message: z.string(),
      fields: z.record(z.string(), z.string()).optional()
    })
  })
}

export type ErrorBody = z.infer<typeof ErrorModel.errorBody>
export type FieldErrors = NonNullable<ErrorBody['error']['fields']>
