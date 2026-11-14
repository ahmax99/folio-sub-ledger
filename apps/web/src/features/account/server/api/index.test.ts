import { describe, expect, it, vi } from 'vitest'

import { lastRequest, respondWith } from '@/test/http'

import { deleteUser, fetchPresignedUrl, updateUser } from '.'

vi.mock('@/lib/serverApiClient', async () => {
  const { testClient } = await import('@/test/http')
  return { serverAuthApiClient: testClient }
})

describe('account server api', () => {
  it('updates a user by id', async () => {
    respondWith({ id: 'u1', name: 'New' })

    expect(await updateUser('u1', { name: 'New' })).toEqual({
      id: 'u1',
      name: 'New'
    })
    expect(lastRequest().method).toBe('PUT')
    expect(lastRequest().url).toBe('http://api.test/users/u1')
    expect(await lastRequest().json()).toEqual({ name: 'New' })
  })

  it('deletes a user by id', async () => {
    respondWith({ success: true })

    await deleteUser('u1')

    expect(lastRequest().method).toBe('DELETE')
    expect(lastRequest().url).toBe('http://api.test/users/u1')
  })

  it('requests a presigned upload URL', async () => {
    respondWith({ presignedUrl: 'p', publicUrl: 'u', key: 'k' })

    await fetchPresignedUrl({ filename: 'a.png', contentType: 'image/png' })

    expect(lastRequest().url).toBe(
      'http://api.test/users/presigned-url?filename=a.png&contentType=image%2Fpng'
    )
  })
})
