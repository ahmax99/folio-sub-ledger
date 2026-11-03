import { describe, expect, it } from 'vitest'

import { safeRelativePath } from './redirect'

describe('safeRelativePath', () => {
  it.each(['/account', '/contact?x=1#h'])('keeps same-site path %s', (path) => {
    expect(safeRelativePath(path)).toBe(path)
  })

  it.each([
    '//evil.com',
    '/\\evil.com',
    'https://evil.com',
    'javascript:alert(1)',
    '',
    null,
    undefined
  ])('rejects %s', (value) => {
    expect(safeRelativePath(value)).toBeNull()
  })
})
