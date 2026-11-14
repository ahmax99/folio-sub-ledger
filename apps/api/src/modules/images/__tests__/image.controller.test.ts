import { describe, expect, it, vi } from 'vitest'

import { s3Client } from '@/lib/s3.js'
import { imageController } from '@/modules/images/image.controller.js'
import { send } from '@/test/fixtures.js'

const s3Send = vi.mocked(s3Client.send)

describe('image controller', () => {
  it('streams the S3 object with cache headers', async () => {
    const lastModified = new Date('2026-11-01T00:00:00Z')
    s3Send.mockResolvedValueOnce({
      Body: new TextEncoder().encode('image-bytes'),
      ContentType: 'image/png',
      ContentLength: 11,
      ETag: '"abc"',
      LastModified: lastModified
    } as never)

    const res = await send(imageController, 'GET', '/images/account/a.png')

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('image-bytes')
    expect(Object.fromEntries(res.headers)).toMatchObject({
      'content-type': 'image/png',
      'cache-control': 'public, max-age=31536000, immutable',
      'content-length': '11',
      etag: '"abc"',
      'last-modified': lastModified.toUTCString()
    })
  })

  it('falls back to a binary content type', async () => {
    s3Send.mockResolvedValueOnce({
      Body: new TextEncoder().encode('bytes')
    } as never)

    const res = await send(imageController, 'GET', '/images/account/a.bin')

    expect(res.headers.get('content-type')).toBe('application/octet-stream')
  })

  it('returns 404 when S3 has no body for the key', async () => {
    s3Send.mockResolvedValueOnce({} as never)

    const res = await send(
      imageController,
      'GET',
      '/images/account/missing.png'
    )

    expect(res.status).toBe(404)
  })

  it('returns 500 when S3 fails', async () => {
    s3Send.mockRejectedValueOnce(new Error('S3 unavailable') as never)

    const res = await send(imageController, 'GET', '/images/account/a.png')

    expect(res.status).toBe(500)
  })

  it('returns 400 without an image path', async () => {
    const res = await send(imageController, 'GET', '/images/')

    expect(res.status).toBe(400)
  })
})
