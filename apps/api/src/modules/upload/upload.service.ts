import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { env } from '@/config/env.js'
import { SIGNED_URL_EXPIRATION } from '@/constants/index.js'
import { catchAsyncError } from '@/error/utils/catchError.js'
import { authorize } from '@/lib/authorizeResource.js'
import { s3Client } from '@/lib/s3.js'
import { sanitizeFilename } from '@/utils/sanitizeFilename.js'

const toPublicUrl = (request: Request, key: string) => {
  const host = request.headers.get('host')
  const protocol = request.headers.get('x-forwarded-proto') ?? 'http'

  return `${protocol}://${host}/api/v1/images/${key}`
}

export const UploadService = {
  getPresignedUrl: (
    folder: string,
    request: Request,
    filename: string,
    contentType: string,
    allowed: boolean
  ) => {
    const key = `${folder}/${Date.now()}-${sanitizeFilename(filename)}`

    return authorize(allowed, 'Cannot upload files')
      .andThen(() =>
        catchAsyncError(
          getSignedUrl(
            s3Client,
            new PutObjectCommand({
              Bucket: env.S3_BUCKET_NAME,
              Key: key,
              ContentType: contentType
            }),
            { expiresIn: SIGNED_URL_EXPIRATION }
          )
        )
      )
      .map((presignedUrl) => ({
        presignedUrl,
        publicUrl: toPublicUrl(request, key),
        key
      }))
  }
}
