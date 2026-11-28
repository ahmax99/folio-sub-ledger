import { describe, expect, it } from 'vitest'

import { buttonVariants } from '../Button.variants'

describe('buttonVariants', () => {
  // WCAG 2.1 asks 3:1 for a focus indicator. Against the background, card and
  // muted tokens, the destructive ring needs 90% in light (3.17:1 or more) and
  // 70% in dark (3.33:1 or more); the old 20% / 40% measured under 2:1.
  it('draws the destructive focus ring at an opacity that passes 3:1', () => {
    const classes = buttonVariants({ variant: 'destructive' }).split(' ')

    expect(classes).toContain('focus-visible:ring-destructive/90')
    expect(classes).toContain('dark:focus-visible:ring-destructive/70')
    expect(classes).not.toContain('focus-visible:ring-destructive/20')
    expect(classes).not.toContain('dark:focus-visible:ring-destructive/40')
  })
})
