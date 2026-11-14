import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { captureError } from '@/features/error/utils/captureError'
import { renderWithProviders } from '@/test/render'

import { NotFound, RouteError } from '../RouteError'

vi.mock('@/features/error/utils/captureError', () => ({
  captureError: vi.fn()
}))

describe('RouteError', () => {
  it('reports the error and offers a reload', async () => {
    const error = new Error('loader failed')

    await renderWithProviders(<RouteError error={error} reset={vi.fn()} />)

    expect(captureError).toHaveBeenCalledWith(error)
    expect(screen.getByRole('button', { name: /reload page/i })).toBeDefined()
  })
})

describe('NotFound', () => {
  it('links home', async () => {
    await renderWithProviders(<NotFound />)

    expect(
      screen.getByRole('button', { name: /go home/i }).getAttribute('href')
    ).toBe('/')
  })
})
