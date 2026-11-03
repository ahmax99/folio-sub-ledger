import { err, ok } from 'neverthrow'

import { AppError } from '@/error/lib/AppError.js'
import { catchAsyncError } from '@/error/utils/catchError.js'

interface AuthorizeResourceOptions<TRecord> {
  notFound?: string
  forbidden?: string
  can?: (record: TRecord) => boolean
}

const authorizeResource = <TRecord>(
  resource: TRecord | null | Promise<TRecord | null>,
  {
    notFound = 'Resource not found',
    forbidden = 'Forbidden',
    can = () => true
  }: AuthorizeResourceOptions<TRecord>
) =>
  catchAsyncError(Promise.resolve(resource)).andThen((record) => {
    if (record === null) return err(new AppError('NOT_FOUND', notFound))
    if (!can(record)) return err(new AppError('FORBIDDEN', forbidden))
    return ok(record)
  })

export { authorizeResource }
