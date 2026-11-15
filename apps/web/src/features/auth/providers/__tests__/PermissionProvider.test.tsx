import { Can } from '@casl/react'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@/test/render'

import { AbilityProvider } from '../PermissionProvider'

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
})
