// fallow-ignore-file
'use client'

import { useEffect } from 'react'

import { AppError } from '@/features/error/lib/AppError'
import { useErrorStore } from '@/features/error/stores/useErrorStore'

export const TriggerTestError = () => {
  useEffect(() => {
    if (import.meta.env.PROD) return

    useErrorStore
      .getState()
      .setError(
        new AppError('INTERNAL_ERROR', 'Test error for styling preview')
      )
  }, [])

  return null
}
