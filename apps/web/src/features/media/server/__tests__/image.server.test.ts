import { describe, expect, it, vi } from 'vitest'

import { fetchMock, lastRequest, respondWith } from '@/test/http'

import { fetchImage, serveImage } from '../image.server'

vi.mock('@/lib/serverApiClient.server', async () => {
  const { testClient } = await import('@/test/http')
  return { serverApiClient: testClient }
})

const query = (path: string) => new URLSearchParams({ path })

describe('fetchImage', () => {
  it('requests the image from the backend proxy', async () => {
    respondWith({})

    await fetchImage('account/a.png')

    expect(lastRequest().url).toBe('http://api.test/images/account/a.png')
  })
})

describe('serveImage', () => {
  it('streams a stored image with long-lived caching', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('png', { headers: { 'Content-Type': 'image/png' } })
    )

    const response = await serveImage(query('account/1700000000-a_b.png'))

    expect(lastRequest().url).toBe(
      'http://api.test/images/account/1700000000-a_b.png'
    )
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('image/png')
    expect(await response.text()).toBe('png')
  })

  it.each([
    ['a parent segment', '../users/me'],
    ['a nested parent segment', 'account/../../admin'],
    ['a current-directory segment', './a.png'],
    ['a leading slash', '/etc/passwd'],
    ['an encoded character', '%2e%2e/admin'],
    ['an empty path', '']
  ])('rejects %s without calling the backend', async (_case, path) => {
    fetchMock.mockClear()

    const response = await serveImage(query(path))

    expect(response.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects a request without a path', async () => {
    const response = await serveImage(new URLSearchParams())

    expect(response.status).toBe(400)
  })
})
