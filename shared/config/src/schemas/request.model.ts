import { z } from 'zod'

// Our own UUIDs and CloudFront's x-amz-cf-id (URL-safe base64) both fit; anything else is replaced, never logged.
const REQUEST_ID = /^[\w=-]{1,128}$/

export const REQUEST_ID_HEADER = 'x-request-id'

export const RequestModel = {
  requestId: z.string().regex(REQUEST_ID)
}
