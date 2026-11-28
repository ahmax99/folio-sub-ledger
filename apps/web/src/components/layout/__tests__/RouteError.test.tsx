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

  it('renders the given title at the Headline size, and the description', async () => {
    await renderWithProviders(
      <RouteError
        description="Check your connection and try again."
        error={new Error('down')}
        reset={vi.fn()}
        title="We couldn't load your firm's members"
      />
    )

    const heading = screen.getByRole('heading', {
      name: "We couldn't load your firm's members"
    })
    expect(heading.className).toContain('text-3xl')
    expect(
      screen.getByText('Check your connection and try again.')
    ).toBeDefined()
  })

  it('with retry, shows a Retry button that calls router.invalidate and offers no document reload', async () => {
    const { router, user } = await renderWithProviders(
      <RouteError error={new Error('down')} reset={vi.fn()} retry />
    )
    const invalidate = vi.spyOn(router, 'invalidate')

    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(invalidate).toHaveBeenCalledOnce()
    expect(screen.queryByRole('button', { name: /reload page/i })).toBeNull()
    expect(document.querySelector('a[href]')).toBeNull()
  })

  it('fills the viewport by default, so the root error view centres on screen', async () => {
    await renderWithProviders(
      <RouteError error={new Error('down')} reset={vi.fn()} />
    )

    expect(
      document.querySelector('[data-slot="route-error"]')?.className
    ).toContain('min-h-[calc(100vh-4rem)]')
  })

  it('with fill="parent", drops the viewport height so a PageTemplate page does not scroll', async () => {
    await renderWithProviders(
      <RouteError error={new Error('down')} fill="parent" reset={vi.fn()} />
    )

    expect(
      document.querySelector('[data-slot="route-error"]')?.className
    ).not.toContain('min-h-')
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
