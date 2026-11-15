import { describe, expect, it } from 'vitest'

import { imageUrl } from '../imageUrl'

describe('imageUrl', () => {
  it('proxies a stored image through the BFF', () => {
    expect(imageUrl('account/1 a.png')).toBe(
      '/api/images?path=account%2F1%20a.png'
    )
  })
})
