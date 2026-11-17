import { toast } from 'sonner'
import { describe, expect, it, vi } from 'vitest'

import { errorStore } from '../../stores/errorStore'
import { AppError } from '../AppError'
import { showError } from '../showError'

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }))

describe('showError', () => {
  it('shows a recoverable error as a toast', () => {
    showError(new AppError('FORBIDDEN', 'Not allowed'))

    expect(toast.error).toHaveBeenCalledWith('Not allowed')
    expect(errorStore.state.error).toBeUndefined()
  })

  it('shows an internal error on the error screen', () => {
    const error = new AppError('INTERNAL_ERROR')

    showError(error)

    expect(errorStore.state.error).toBe(error)
    expect(toast.error).not.toHaveBeenCalled()

    errorStore.actions.clearError()
    expect(errorStore.state.error).toBeUndefined()
  })
})
