import { createHash } from 'node:crypto'

import { describe, expect, it } from 'vitest'

import { generateNonce, generatePKCE, generateState } from '../pkce'

describe('generatePKCE', () => {
  it('derives the S256 challenge from the verifier', async () => {
    const { codeVerifier, codeChallenge } = await generatePKCE()

    expect(codeChallenge).toBe(
      createHash('sha256').update(codeVerifier).digest('base64url')
    )
  })
})

describe('generateState and generateNonce', () => {
  it('return a fresh random value on every call', () => {
    const values = new Set([
      generateState(),
      generateState(),
      generateNonce(),
      generateNonce()
    ])

    expect(values.size).toBe(4)
  })
})
