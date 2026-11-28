import { act, fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@/test/render'

import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip'

const renderTooltip = () =>
  renderWithProviders(
    <Tooltip>
      <TooltipTrigger>Trigger</TooltipTrigger>
      <TooltipContent>Full value</TooltipContent>
    </Tooltip>
  )

describe('Tooltip', () => {
  it('stays closed until the trigger takes focus, then shows its content', async () => {
    await renderTooltip()

    expect(screen.queryByText('Full value')).toBeNull()
    const trigger = screen.getByText('Trigger')
    expect(trigger.closest('[data-slot="tooltip-trigger"]')).not.toBeNull()

    act(() => trigger.focus())

    const content = await screen.findByText('Full value')
    expect(content.closest('[data-slot="tooltip-content"]')).not.toBeNull()
  })

  it('opens on a touch tap (pointerdown then click), which Base UI alone closes', async () => {
    await renderTooltip()

    const trigger = screen.getByText('Trigger')
    fireEvent.pointerDown(trigger, { pointerType: 'touch' })
    fireEvent.click(trigger)

    expect(await screen.findByText('Full value')).toBeDefined()
  })

  it('does not open on a mouse click, which Base UI treats as a press that closes', async () => {
    await renderTooltip()

    const trigger = screen.getByText('Trigger')
    fireEvent.pointerDown(trigger, { pointerType: 'mouse' })
    fireEvent.click(trigger)

    expect(screen.queryByText('Full value')).toBeNull()
  })
})
