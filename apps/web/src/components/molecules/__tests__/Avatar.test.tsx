import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Avatar, AvatarFallback } from '../Avatar'

describe('AvatarFallback', () => {
  it('renders its children inside a data-slot=avatar-fallback element when no image is given', () => {
    render(
      <Avatar size="sm">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    )

    const fallback = screen.getByText('JD')
    expect(fallback.closest('[data-slot="avatar-fallback"]')).not.toBeNull()
    expect(document.querySelector('img')).toBeNull()
  })
})
