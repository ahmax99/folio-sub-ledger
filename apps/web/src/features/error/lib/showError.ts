import { ERROR_DEFINITIONS, type ErrorCode } from '@shared/config'
import { toast } from 'sonner'

import { useErrorStore } from '../stores/useErrorStore'

import type { AppError } from './AppError'

const ERROR_DISPLAY: Record<ErrorCode, 'toast' | 'screen'> = {
  NOT_FOUND: 'toast',
  FORBIDDEN: 'toast',
  UNAUTHORIZED: 'toast',
  BAD_REQUEST: 'toast',
  RATE_LIMIT_EXCEEDED: 'toast',
  INTERNAL_ERROR: 'screen'
}

export const showError = (error: AppError) => {
  if (ERROR_DISPLAY[error.code] === 'toast')
    return toast.error(error.message ?? ERROR_DEFINITIONS[error.code].message)

  useErrorStore.getState().setError(error)
}
