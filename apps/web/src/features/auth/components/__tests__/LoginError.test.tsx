import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@/test/render'

import { LoginError } from '../LoginError'

describe('LoginError', () => {
  it('explains a known error and retries through the BFF login route', async () => {
    await renderWithProviders(
      <LoginError
        error="missing_verifier"
        retryHref="/api/auth/login?callbackUrl=%2Faccount"
      />
    )

    expect(screen.getByRole('alert').textContent).toMatch(/cookies are enabled/)
    expect(
      screen.getByRole('link', { name: 'Try again' }).getAttribute('href')
    ).toBe('/api/auth/login?callbackUrl=%2Faccount')
  })

  it('falls back to a generic message for an unknown error', async () => {
    await renderWithProviders(
      <LoginError error="server_error" retryHref="/api/auth/login" />
    )

    expect(screen.getByRole('alert').textContent).toBe(
      'Something went wrong while signing you in.'
    )
  })
})
