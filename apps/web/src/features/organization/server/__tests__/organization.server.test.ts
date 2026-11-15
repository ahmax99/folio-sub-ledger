import { describe, expect, it, vi } from 'vitest'

import { lastRequest, respondWith } from '@/test/http'

import { setupOrganization } from '../organization.server'

vi.mock('@/lib/serverApiClient.server', async () => {
  const { testClient } = await import('@/test/http')
  return { serverAuthApiClient: testClient }
})

describe('setupOrganization', () => {
  it('posts the firm name and returns the organization', async () => {
    respondWith({ id: 'o1', name: 'Acme' })

    expect(await setupOrganization({ name: 'Acme' })).toEqual({
      id: 'o1',
      name: 'Acme'
    })
    expect(lastRequest().method).toBe('POST')
    expect(lastRequest().url).toBe('http://api.test/organizations')
    expect(await lastRequest().json()).toEqual({ name: 'Acme' })
  })
})
