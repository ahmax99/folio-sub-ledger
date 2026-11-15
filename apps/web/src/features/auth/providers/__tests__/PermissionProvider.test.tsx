import { Can } from '@casl/react'
import { waitFor } from '@testing-library/react'
import { screen } from '@testing-library/react'
import { toast } from 'sonner'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@/test/render'

import { AbilityProvider } from '../PermissionProvider'

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }))

describe('AbilityProvider', () => {
  it('provides the ability built from the rules', async () => {
    await renderWithProviders(
      <AbilityProvider rules={[{ action: 'read', subject: 'User' }]}>
        <Can I="read" a="User">
          <p>Can read users</p>
        </Can>
        <Can I="delete" a="User">
          <p>Can delete users</p>
        </Can>
      </AbilityProvider>
    )

    expect(screen.getByText('Can read users')).toBeDefined()
    expect(screen.queryByText('Can delete users')).toBeNull()
  })

  it('shows an error passed in the URL once and removes it', async () => {
    const { router } = await renderWithProviders(
      <AbilityProvider rules={[]}>content</AbilityProvider>,
      { path: '/account?error=Session%20expired&tab=profile' }
    )

    await waitFor(() =>
      expect(router.state.location.searchStr).toBe('?tab=profile')
    )
    expect(toast.error).toHaveBeenCalledExactlyOnceWith('Session expired')
    expect(router.state.location.pathname).toBe('/account')
  })
})
