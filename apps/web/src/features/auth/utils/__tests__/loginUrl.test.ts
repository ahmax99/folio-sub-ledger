import { describe, expect, it } from 'vitest'

import { loginUrl } from '../loginUrl'

describe('loginUrl', () => {
  it.each([
    ['/account', '/api/auth/login?callbackUrl=%2Faccount'],
    ['https://evil.example.com', '/api/auth/login'],
    ['//evil.example.com', '/api/auth/login'],
    [undefined, '/api/auth/login']
  ])('starts the login for callback %s', (callbackUrl, expected) => {
    expect(loginUrl(callbackUrl)).toBe(expected)
  })
})
