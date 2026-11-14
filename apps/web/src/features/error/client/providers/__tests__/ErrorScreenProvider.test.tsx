import { act, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { captureError } from '@/features/error-tracking/utils/captureError'
import { AppError } from '@/features/error/lib/AppError'
import { renderWithProviders } from '@/test/render'

import { useErrorStore } from '../../stores/useErrorStore'
import { ErrorScreenProvider } from '../ErrorScreenProvider'

vi.mock('@/features/error-tracking/utils/captureError', () => ({
  captureError: vi.fn()
}))

const error = new AppError('INTERNAL_ERROR', 'Database unavailable')

const renderWithError = async () => {
  const rendered = await renderWithProviders(<ErrorScreenProvider />, {
    path: '/account'
  })
  act(() => useErrorStore.getState().setError(error))
  await screen.findByText('Database unavailable')
  return rendered
}

describe('ErrorScreenProvider', () => {
  afterEach(() => useErrorStore.getState().clearError())

  it('stays hidden without an error', async () => {
    await renderWithProviders(<ErrorScreenProvider />)

    expect(screen.queryByText('Something went wrong')).toBeNull()
  })

  it('shows and reports the current error', async () => {
    await renderWithError()

    expect(screen.getByText('Something went wrong')).toBeDefined()
    expect(captureError).toHaveBeenCalledWith(error)
  })

  it('retries the current page', async () => {
    const { user, router } = await renderWithError()
    const invalidate = vi.spyOn(router, 'invalidate')

    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(useErrorStore.getState().error).toBeUndefined()
    expect(invalidate).toHaveBeenCalled()
  })

  it('goes home', async () => {
    const { user, router } = await renderWithError()

    await user.click(screen.getByRole('button', { name: 'Go home' }))

    expect(useErrorStore.getState().error).toBeUndefined()
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })
})
