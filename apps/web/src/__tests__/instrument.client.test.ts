import { init, replayIntegration } from '@sentry/tanstackstart-react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@sentry/tanstackstart-react', () => ({
  init: vi.fn(),
  replayIntegration: vi.fn(() => ({}))
}))

describe('instrument.client', () => {
  it('initialises Replay with maskAllText and blockAllMedia true', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ sentryDsn: 'https://dsn.test/1' }))
    )

    await import('../instrument.client')
    await vi.waitFor(() => expect(init).toHaveBeenCalledOnce())

    expect(replayIntegration).toHaveBeenCalledWith(
      expect.objectContaining({ maskAllText: true, blockAllMedia: true })
    )
    vi.unstubAllGlobals()
  })
})
