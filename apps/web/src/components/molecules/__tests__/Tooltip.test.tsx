import { act, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@/test/render'

import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip'

describe('Tooltip', () => {
  it('stays closed until the trigger takes focus, then shows its content', async () => {
    await renderWithProviders(
      <Tooltip>
        <TooltipTrigger>Trigger</TooltipTrigger>
        <TooltipContent>Full value</TooltipContent>
      </Tooltip>
    )

    expect(screen.queryByText('Full value')).toBeNull()
    const trigger = screen.getByText('Trigger')
    expect(trigger.closest('[data-slot="tooltip-trigger"]')).not.toBeNull()

    act(() => trigger.focus())

    const content = await screen.findByText('Full value')
    expect(content.closest('[data-slot="tooltip-content"]')).not.toBeNull()
  })
})
