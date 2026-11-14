import { describe, expect, it, vi } from 'vitest'

import { fetchMock, lastRequest, respondWith } from '@/test/http'

import {
  deleteUser,
  fetchProfileImage,
  updateUser,
  uploadProfileImage
} from '.'

vi.mock('@/lib/apiClient', async () => {
  const { testClient } = await import('@/test/http')
  return { apiClient: testClient }
})

describe('fetchProfileImage', () => {
  it('proxies a stored image through the BFF', () => {
    expect(fetchProfileImage('account/1 a.png')).toBe(
      '/api/images?path=account%2F1%20a.png'
    )
  })

  it('falls back to a placeholder without an image', () => {
    expect(fetchProfileImage('')).toMatch(/^https:\/\/images\.unsplash\.com\//)
  })
})

describe('account client api', () => {
  it('updates the signed-in account', async () => {
    respondWith({ name: 'New' })

    await updateUser({ name: 'New' })

    expect(lastRequest().method).toBe('PUT')
    expect(lastRequest().url).toBe('http://api.test/account')
  })

  it('deletes the signed-in account', async () => {
    respondWith({ success: true })

    await deleteUser()

    expect(lastRequest().method).toBe('DELETE')
  })

  it('uploads the file to the presigned URL with its content type', async () => {
    respondWith({
      presignedUrl: 'https://s3.test/upload',
      publicUrl: 'https://app.test/img',
      key: 'account/1-a.png'
    })
    const s3Upload = vi.fn().mockResolvedValue(new Response(null))
    vi.stubGlobal('fetch', s3Upload)
    const file = new File(['bytes'], 'a.png', { type: 'image/png' })

    const { publicUrl, key } = await uploadProfileImage(file)

    expect({ publicUrl, key }).toEqual({
      publicUrl: 'https://app.test/img',
      key: 'account/1-a.png'
    })
    expect(fetchMock.mock.lastCall?.[0]).toMatchObject({
      url: 'http://api.test/account/presigned-url?filename=a.png&contentType=image%2Fpng'
    })
    expect(s3Upload).toHaveBeenCalledWith('https://s3.test/upload', {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': 'image/png' }
    })
  })
})
