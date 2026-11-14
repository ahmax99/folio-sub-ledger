import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@/test/render'

import { AccountManagement } from './AccountManagement'

vi.mock('../api', () => ({ deleteUser: vi.fn() }))
vi.mock('@/features/auth/server/functions', () => ({ logout: vi.fn() }))

describe('AccountManagement', () => {
  it('opens the profile editor', async () => {
    const { user, router } = await renderWithProviders(
      <AccountManagement activeTab="profile" onTabChange={vi.fn()} />,
      { path: '/account' }
    )

    await user.click(screen.getByRole('button', { name: 'Update Profile' }))

    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/account/edit')
    )
  })

  it('reports the selected tab', async () => {
    const onTabChange = vi.fn()
    const { user } = await renderWithProviders(
      <AccountManagement activeTab="profile" onTabChange={onTabChange} />
    )

    await user.click(screen.getByRole('tab', { name: /danger zone/i }))

    expect(onTabChange).toHaveBeenCalledWith('danger-zone')
  })

  it('shows the delete action on the danger zone tab', async () => {
    await renderWithProviders(
      <AccountManagement activeTab="danger-zone" onTabChange={vi.fn()} />
    )

    expect(
      screen.getByRole('button', { name: 'Delete Account Permanently' })
    ).toBeDefined()
  })
})
