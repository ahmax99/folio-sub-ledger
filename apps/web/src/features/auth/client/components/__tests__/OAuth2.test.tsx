import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@/test/render'

import { OAuth2Callback } from '../OAuth2Callback'
import { OAuth2Start } from '../OAuth2Start'

const stubLocation = () => {
  const location = { href: '' }
  vi.stubGlobal('location', location)
  return location
}

describe('OAuth2Start', () => {
  it.each([
    ['/account', '/api/auth/login?callbackUrl=%2Faccount'],
    ['https://evil.example.com', '/api/auth/login'],
    [undefined, '/api/auth/login']
  ])('starts the login for callback %s', async (callbackUrl, loginUrl) => {
    const location = stubLocation()

    await renderWithProviders(<OAuth2Start callbackUrl={callbackUrl} />)

    expect(location.href).toBe(loginUrl)
  })
})

describe('OAuth2Callback', () => {
  it('hands the provider response to the callback route', async () => {
    const location = stubLocation()

    await renderWithProviders(<OAuth2Callback />, {
      path: '/auth/callback?code=abc&state=xyz'
    })

    expect(location.href).toBe('/api/auth/callback?code=abc&state=xyz')
  })
})
