// fallow-ignore-file
'use client'

import { useEffect } from 'react'

import { AppError } from '@/features/error/lib/AppError'
import { errorStore } from '@/features/error/stores/errorStore'

export const TriggerTestError = () => {
  useEffect(() => {
    if (import.meta.env.PROD) return

    errorStore.actions.setError(
      new AppError('INTERNAL_ERROR', 'Test error for styling preview')
    )
  }, [])

  return null
}
