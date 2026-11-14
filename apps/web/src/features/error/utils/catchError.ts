import { Result, ResultAsync } from 'neverthrow'

import { mapToAppError } from '../lib/mapToAppError'

import { captureError } from './captureError'

export const catchSyncError = <T>(fn: () => T) =>
  Result.fromThrowable(fn, mapToAppError)()

export const catchAsyncError = <T>(promise: Promise<T>) =>
  ResultAsync.fromPromise(promise, mapToAppError).orTee(captureError)
