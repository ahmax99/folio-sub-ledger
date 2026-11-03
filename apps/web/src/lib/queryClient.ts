import { MutationCache, QueryClient } from '@tanstack/react-query'

import { captureError } from '@/features/error-tracking/utils/captureError'
import { showError } from '@/features/error/client/lib/showError'
import { mapToAppError } from '@/features/error/lib/mapToAppError'

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000 }
    },
    mutationCache: new MutationCache({
      onError: (error) => {
        const appError = mapToAppError(error)
        captureError(appError)
        showError(appError)
      }
    })
  })
