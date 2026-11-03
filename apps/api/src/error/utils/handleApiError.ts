import type { ResultAsync } from 'neverthrow'

import type { AppError } from '@/error/lib/AppError.js'

export const handleApiError = <T>(resultAsync: ResultAsync<T, AppError>) =>
  resultAsync.match(
    (value) => value,
    (error) => {
      throw error
    }
  )
