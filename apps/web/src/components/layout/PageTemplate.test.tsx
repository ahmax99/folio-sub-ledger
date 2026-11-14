import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@/test/render'

import { PageTemplate } from './PageTemplate'

describe('PageTemplate', () => {
  it('renders a back link above the content', async () => {
    await renderWithProviders(
      <PageTemplate back={{ to: '/account', label: 'Back to account' }}>
        <p>Content</p>
      </PageTemplate>
    )

    expect(
      screen.getByRole('link', { name: 'Back to account' }).getAttribute('href')
    ).toBe('/account')
    expect(screen.getByText('Content')).toBeDefined()
  })

  it('centers content without a back link', async () => {
    await renderWithProviders(
      <PageTemplate alignment="center">
        <p>Centered</p>
      </PageTemplate>
    )

    expect(screen.getByText('Centered')).toBeDefined()
    expect(screen.queryByRole('navigation')).toBeNull()
  })
})
