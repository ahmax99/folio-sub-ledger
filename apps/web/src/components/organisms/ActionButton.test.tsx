import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ActionButton } from './ActionButton'

describe('ActionButton', () => {
  it('runs the action and the click handler', async () => {
    const action = vi.fn()
    const onClick = vi.fn()
    render(
      <ActionButton action={action} onClick={onClick}>
        Save
      </ActionButton>
    )

    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    expect(action).toHaveBeenCalledOnce()
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('is disabled while pending', () => {
    render(
      <ActionButton action={vi.fn()} isPending>
        Save
      </ActionButton>
    )

    expect(
      screen.getByRole('button', { name: /save/i }).hasAttribute('disabled')
    ).toBe(true)
  })

  it('asks for confirmation before running the action', async () => {
    const action = vi.fn()
    render(
      <ActionButton
        action={action}
        areYouSureDescription="This removes the firm."
        requireAreYouSure
      >
        Remove
      </ActionButton>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Remove' }))

    expect(await screen.findByText('This removes the firm.')).toBeDefined()
    expect(action).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: /yes/i }))

    expect(action).toHaveBeenCalledOnce()
  })
})
