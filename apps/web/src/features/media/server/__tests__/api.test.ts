import { describe, expect, it, vi } from 'vitest'

import { lastRequest, respondWith } from '@/test/http'

import { fetchImage } from '../api'

vi.mock('@/lib/serverApiClient', async () => {
  const { testClient } = await import('@/test/http')
  return { serverApiClient: testClient }
})

describe('fetchImage', () => {
  it('requests the image from the backend proxy', async () => {
    respondWith({})

    await fetchImage('account/a.png')

    expect(lastRequest().url).toBe('http://api.test/images/account/a.png')
  })
})
