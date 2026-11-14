import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { testUser } from '@/test/fixtures'

import { UserInfo } from '../UserInfo'

describe('UserInfo', () => {
  it('shows the name and email', () => {
    render(<UserInfo user={testUser} />)

    expect(screen.getByRole('heading', { name: 'Jane' })).toBeDefined()
    expect(screen.getByText('jane@example.com')).toBeDefined()
  })
})
