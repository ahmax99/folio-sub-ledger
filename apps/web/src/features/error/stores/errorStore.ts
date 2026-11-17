import { createStore } from '@tanstack/react-store'

import type { AppError } from '../lib/AppError'

interface ErrorState {
  error?: AppError
}

const initialState: ErrorState = { error: undefined }

export const errorStore = createStore(initialState, ({ setState }) => ({
  setError: (error: AppError) => setState(() => ({ error })),
  clearError: () => setState(() => ({ error: undefined }))
}))
