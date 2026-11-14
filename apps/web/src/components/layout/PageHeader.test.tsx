import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { testUser } from '@/test/fixtures'
import { renderWithProviders } from '@/test/render'

import { PageHeader } from './PageHeader'

describe('PageHeader', () => {
  it('offers sign in to visitors', async () => {
    await renderWithProviders(<PageHeader user={null} />)

    expect(
      screen.getByRole('button', { name: /sign in/i }).getAttribute('href')
    ).toBe('/auth/login')
    expect(screen.queryByRole('button', { name: 'Sign Out' })).toBeNull()
  })

  it('shows the firm, role and account links to members', async () => {
    await renderWithProviders(<PageHeader user={testUser} />)

    expect(screen.getByText('Acme')).toBeDefined()
    expect(screen.getByText('Owner')).toBeDefined()
    expect(
      screen.getByRole('button', { name: 'Go to Account' }).getAttribute('href')
    ).toBe('/account')
    expect(
      screen.getByRole('button', { name: 'Sign Out' }).getAttribute('href')
    ).toBe('/api/auth/logout')
  })
})
