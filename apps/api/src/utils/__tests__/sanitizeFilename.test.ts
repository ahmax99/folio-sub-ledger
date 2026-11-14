import { describe, expect, it } from 'vitest'

import { sanitizeFilename } from '@/utils/sanitizeFilename.js'

describe('sanitizeFilename', () => {
  it.each([
    ['avatar.png', 'avatar.png'],
    ['../../etc/passwd', 'etcpasswd'],
    ['a\\b/c.png', 'abc.png'],
    ['nul\0l.png', 'null.png'],
    ['my photo (1).png', 'my_photo_1_.png'],
    ['a  b.png', 'a_b.png']
  ])('turns %j into %j', (input, expected) => {
    expect(sanitizeFilename(input)).toBe(expected)
  })
})
