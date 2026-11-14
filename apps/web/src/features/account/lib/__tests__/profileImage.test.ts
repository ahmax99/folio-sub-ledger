import { describe, expect, it } from 'vitest'

import { fetchProfileImage } from '../profileImage'

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
