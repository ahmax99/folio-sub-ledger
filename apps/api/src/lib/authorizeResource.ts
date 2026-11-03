import { err, errAsync, ok, okAsync, type ResultAsync } from 'neverthrow'

import { AppError } from '@/error/lib/AppError.js'
import { catchAsyncError } from '@/error/utils/catchError.js'

interface FindAuthorizedOptions<TRecord> {
  notFound: string
  forbidden: string
  can: (record: TRecord) => boolean
}

const authorize = (
  allowed: boolean,
  forbidden: string
): ResultAsync<void, AppError> =>
  allowed ? okAsync(undefined) : errAsync(new AppError('FORBIDDEN', forbidden))

const findOrFail = <TRecord>(
  query: Promise<TRecord | null>,
  notFound: string
) =>
  catchAsyncError(query).andThen((record) =>
    record ? ok(record) : err(new AppError('NOT_FOUND', notFound))
  )

const findAuthorized = <TRecord>(
  query: Promise<TRecord | null>,
  { notFound, forbidden, can }: FindAuthorizedOptions<TRecord>
) =>
  findOrFail(query, notFound).andThen((record) =>
    can(record) ? ok(record) : err(new AppError('FORBIDDEN', forbidden))
  )

export { authorize, findAuthorized, findOrFail }
