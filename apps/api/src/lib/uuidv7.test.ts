import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { uuidv7 } from '@/lib/uuidv7.js'

describe('uuidv7', () => {
  it('returns an RFC 9562 version 7 id', () => {
    const id = uuidv7()

    expect(z.uuid({ version: 'v7' }).safeParse(id).success).toBe(true)
  })

  it('encodes the current time in the first 48 bits', () => {
    const before = Date.now()
    const id = uuidv7()
    const after = Date.now()

    const ms = Number.parseInt(id.replace('-', '').slice(0, 12), 16)
    expect(ms).toBeGreaterThanOrEqual(before)
    expect(ms).toBeLessThanOrEqual(after)
  })

  it('sorts later ids after earlier ones', async () => {
    const first = uuidv7()
    await new Promise((resolve) => setTimeout(resolve, 2))
    const second = uuidv7()

    expect(second > first).toBe(true)
  })
})
