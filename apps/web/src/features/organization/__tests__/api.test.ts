import { describe, expect, it, vi } from 'vitest'

import { lastRequest, respondWith } from '@/test/http'

import { setupFirm as setupFirmFromClient } from '../client/api'
import { setupFirm as setupFirmFromServer } from '../server/api'

vi.mock('@/lib/apiClient', async () => {
  const { testClient } = await import('@/test/http')
  return { apiClient: testClient }
})
vi.mock('@/lib/serverApiClient', async () => {
  const { testClient } = await import('@/test/http')
  return { serverAuthApiClient: testClient }
})

describe.each([
  ['client', setupFirmFromClient],
  ['server', setupFirmFromServer]
])('setupFirm from the %s', (_, setupFirm) => {
  it('posts the firm name and returns the organization', async () => {
    respondWith({ id: 'o1', name: 'Acme' })

    expect(await setupFirm({ firmName: 'Acme' })).toEqual({
      id: 'o1',
      name: 'Acme'
    })
    expect(lastRequest().method).toBe('POST')
    expect(lastRequest().url).toBe('http://api.test/organizations')
    expect(await lastRequest().json()).toEqual({ firmName: 'Acme' })
  })
})
