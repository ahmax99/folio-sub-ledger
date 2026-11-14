import { describe, expect, it, vi } from 'vitest'

import { fetchPresignedUrl } from '../../account.functions'
import { uploadProfileImage } from '../uploadProfileImage'

vi.mock('../../account.functions', () => ({ fetchPresignedUrl: vi.fn() }))

describe('uploadProfileImage', () => {
  it('uploads the file to the presigned URL with its content type', async () => {
    vi.mocked(fetchPresignedUrl).mockResolvedValue({
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
    expect(fetchPresignedUrl).toHaveBeenCalledWith({
      data: { filename: 'a.png', contentType: 'image/png' }
    })
    expect(s3Upload).toHaveBeenCalledWith('https://s3.test/upload', {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': 'image/png' }
    })
  })
})
