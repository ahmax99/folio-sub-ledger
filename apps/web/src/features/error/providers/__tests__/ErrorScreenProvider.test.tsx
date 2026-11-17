import { act, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AppError } from '@/features/error/lib/AppError'
import { captureError } from '@/features/error/utils/captureError'
import { renderWithProviders } from '@/test/render'

import { errorStore } from '../../stores/errorStore'
import { ErrorScreenProvider } from '../ErrorScreenProvider'

vi.mock('@/features/error/utils/captureError', () => ({
  captureError: vi.fn()
}))

const error = new AppError('INTERNAL_ERROR', 'Database unavailable')

const renderWithError = async () => {
  const rendered = await renderWithProviders(<ErrorScreenProvider />, {
    path: '/account'
  })
  act(() => errorStore.actions.setError(error))
  await screen.findByText('Database unavailable')
  return rendered
}

describe('ErrorScreenProvider', () => {
  afterEach(() => errorStore.actions.clearError())

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

    expect(errorStore.state.error).toBeUndefined()
    expect(invalidate).toHaveBeenCalled()
  })

  it('goes home', async () => {
    const { user, router } = await renderWithError()

    await user.click(screen.getByRole('button', { name: 'Go home' }))

    expect(errorStore.state.error).toBeUndefined()
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })
})
