import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FieldError } from '../Field'

describe('FieldError', () => {
  it('renders nothing without errors', () => {
    const { container } = render(<FieldError errors={[]} />)

    expect(container.innerHTML).toBe('')
  })

  it('shows a single message once', () => {
    render(
      <FieldError errors={[{ message: 'Required' }, { message: 'Required' }]} />
    )

    expect(screen.getByRole('alert').textContent).toBe('Required')
  })

  it('lists several distinct messages', () => {
    render(
      <FieldError errors={[{ message: 'Too short' }, { message: 'Invalid' }]} />
    )

    expect(
      screen.getAllByRole('listitem').map((item) => item.textContent)
    ).toEqual(['Too short', 'Invalid'])
  })

  it('prefers explicit children over errors', () => {
    render(<FieldError errors={[{ message: 'Required' }]}>Custom</FieldError>)

    expect(screen.getByRole('alert').textContent).toBe('Custom')
  })
})
