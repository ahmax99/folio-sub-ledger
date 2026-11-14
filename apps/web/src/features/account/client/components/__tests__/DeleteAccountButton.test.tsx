import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { logout } from '@/features/auth/server/functions'
import { renderWithProviders } from '@/test/render'

import { deleteUser } from '../../api'
import { DeleteAccountButton } from '../DeleteAccountButton'

vi.mock('../../api', () => ({
  updateUser: vi.fn(),
  uploadProfileImage: vi.fn(),
  deleteUser: vi.fn()
}))
vi.mock('@/features/auth/server/functions', () => ({ logout: vi.fn() }))

describe('DeleteAccountButton', () => {
  it('deletes the account and signs out after confirmation', async () => {
    const assign = vi.fn()
    vi.stubGlobal('location', { assign })
    vi.mocked(deleteUser).mockResolvedValue({})
    vi.mocked(logout).mockResolvedValue({ logoutUrl: 'https://auth.test/out' })
    const { user } = await renderWithProviders(<DeleteAccountButton />)

    await user.click(
      screen.getByRole('button', { name: 'Delete Account Permanently' })
    )
    await user.click(await screen.findByRole('button', { name: /yes/i }))

    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith('https://auth.test/out')
    )
    expect(deleteUser).toHaveBeenCalledOnce()
  })

  it('keeps the account when the confirmation is cancelled', async () => {
    const { user } = await renderWithProviders(<DeleteAccountButton />)

    await user.click(
      screen.getByRole('button', { name: 'Delete Account Permanently' })
    )
    await user.click(await screen.findByRole('button', { name: 'Cancel' }))

    expect(deleteUser).not.toHaveBeenCalled()
  })
})
