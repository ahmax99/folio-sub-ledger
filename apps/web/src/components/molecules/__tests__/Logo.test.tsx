import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Logo } from '../Logo'

describe('Logo', () => {
  it('is a named image that draws the horizontal lockup by default', () => {
    render(<Logo />)

    const logo = screen.getByRole('img', { name: 'Folio' })
    expect(logo.getAttribute('viewBox')).toBe('0 20 588 162')
    expect(logo.querySelectorAll('path').length).toBe(5)
  })

  it('draws the symbol alone, with no wordmark', () => {
    render(<Logo type="symbol" />)

    const logo = screen.getByRole('img', { name: 'Folio' })
    expect(logo.getAttribute('viewBox')).toBe('0 0 256 256')
    expect(logo.querySelectorAll('path').length).toBe(2)
  })

  it('draws the stacked lockup', () => {
    render(<Logo type="stacked" />)

    expect(
      screen.getByRole('img', { name: 'Folio' }).getAttribute('viewBox')
    ).toBe('0 36 256 304')
  })

  it('tags every coloured shape so the theme tokens can recolour it', () => {
    render(<Logo />)

    const logo = screen.getByRole('img', { name: 'Folio' })
    expect(logo.querySelectorAll('.ink').length).toBe(2)
    expect(logo.querySelectorAll('.pencil').length).toBe(1)
    expect(logo.getAttribute('class')).toContain('[&_.ink]:fill-primary')
  })
})
