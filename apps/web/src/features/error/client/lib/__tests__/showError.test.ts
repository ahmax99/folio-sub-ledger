import { toast } from 'sonner'
import { describe, expect, it, vi } from 'vitest'

import { AppError } from '../../../lib/AppError'
import { useErrorStore } from '../../stores/useErrorStore'
import { showError } from '../showError'

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }))

describe('showError', () => {
  it('shows a recoverable error as a toast', () => {
    showError(new AppError('FORBIDDEN', 'Not allowed'))

    expect(toast.error).toHaveBeenCalledWith('Not allowed')
    expect(useErrorStore.getState().error).toBeUndefined()
  })

  it('shows an internal error on the error screen', () => {
    const error = new AppError('INTERNAL_ERROR')

    showError(error)

    expect(useErrorStore.getState().error).toBe(error)
    expect(toast.error).not.toHaveBeenCalled()

    useErrorStore.getState().clearError()
    expect(useErrorStore.getState().error).toBeUndefined()
  })
})
