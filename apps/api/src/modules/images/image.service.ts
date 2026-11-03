import { GetObjectCommand } from '@aws-sdk/client-s3'
import { err, ok } from 'neverthrow'

import { env } from '@/config/env.js'
import { AppError } from '@/error/lib/AppError.js'
import { catchAsyncError } from '@/error/utils/catchError.js'
import { s3Client } from '@/lib/s3.js'

export const ImageService = {
  getImage: (imagePath: string) =>
    catchAsyncError(
      s3Client.send(
        new GetObjectCommand({ Bucket: env.S3_BUCKET_NAME, Key: imagePath })
      )
    ).andThen((response) =>
      response.Body
        ? ok({
            body: response.Body,
            contentType: response.ContentType || 'application/octet-stream',
            contentLength: response.ContentLength,
            lastModified: response.LastModified,
            etag: response.ETag
          })
        : err(new AppError('NOT_FOUND', 'Image not found'))
    )
}
