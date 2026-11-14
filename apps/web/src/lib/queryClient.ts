import {
  isServer,
  MutationCache,
  QueryCache,
  QueryClient
} from '@tanstack/react-query'

import { showError } from '@/features/error/client/lib/showError'
import { mapToAppError } from '@/features/error/lib/mapToAppError'
import { captureError } from '@/features/error/utils/captureError'

const reportError = (error: unknown) => {
  const appError = mapToAppError(error)
  captureError(appError)
  showError(appError)
}

const shouldRetry = (failureCount: number, error: unknown) =>
  !isServer && failureCount < 1 && mapToAppError(error).status >= 500

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: shouldRetry }
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.state.data !== undefined) reportError(error)
      }
    }),
    mutationCache: new MutationCache({ onError: reportError })
  })
