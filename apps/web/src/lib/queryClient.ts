import { MutationCache, QueryClient } from '@tanstack/react-query'

import { captureError } from '@/features/error-tracking/utils/captureError'
import { showError } from '@/features/error/client/lib/showError'
import { mapToAppError } from '@/features/error/lib/mapToAppError'

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      // Loader-fetched data stays fresh long enough not to refetch on hydrate.
      queries: { staleTime: 30_000 }
    },
    // Every mutation failure is reported and shown here, once.
    mutationCache: new MutationCache({
      onError: (error) => {
        const appError = mapToAppError(error)
        captureError(appError)
        showError(appError)
      }
    })
  })
