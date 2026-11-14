import { describe, expect, it, vi } from 'vitest'

import { captureError } from '@/features/error-tracking/utils/captureError'
import { showError } from '@/features/error/client/lib/showError'
import { AppError } from '@/features/error/lib/AppError'

import { createQueryClient } from './queryClient'

vi.mock('@/features/error-tracking/utils/captureError', () => ({
  captureError: vi.fn()
}))
vi.mock('@/features/error/client/lib/showError', () => ({
  showError: vi.fn()
}))

const failing = (error: AppError) => () => Promise.reject(error)

describe('createQueryClient', () => {
  it('reports every failed mutation once', async () => {
    const error = new AppError('BAD_REQUEST')
    const client = createQueryClient()

    await client
      .getMutationCache()
      .build(client, { mutationFn: failing(error) })
      .execute(undefined)
      .catch(() => undefined)

    expect(captureError).toHaveBeenCalledWith(error)
    expect(showError).toHaveBeenCalledWith(error)
  })

  it('stays quiet when a first load fails, since the page shows the error', async () => {
    const client = createQueryClient()

    await client
      .fetchQuery({
        queryKey: ['first'],
        queryFn: failing(new AppError('NOT_FOUND'))
      })
      .catch(() => undefined)

    expect(showError).not.toHaveBeenCalled()
  })

  it('reports a failed refetch of data already on screen', async () => {
    const error = new AppError('NOT_FOUND')
    const client = createQueryClient()
    client.setQueryData(['cached'], 'old')

    await client
      .fetchQuery({
        queryKey: ['cached'],
        queryFn: failing(error),
        staleTime: 0
      })
      .catch(() => undefined)

    expect(showError).toHaveBeenCalledWith(error)
  })

  it('does not retry on the server', () => {
    const { retry } = createQueryClient().getDefaultOptions().queries ?? {}

    expect(
      typeof retry === 'function' && retry(0, new AppError('INTERNAL_ERROR'))
    ).toBe(false)
  })
})
