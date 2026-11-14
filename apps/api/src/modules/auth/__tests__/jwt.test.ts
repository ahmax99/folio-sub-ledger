import { SignJWT } from 'jose'
import { describe, expect, it, vi } from 'vitest'

import { COGNITO_AUDIENCE, COGNITO_ISSUER } from '@/constants/index.js'

const keys = await vi.hoisted(async () => {
  const { exportJWK, generateKeyPair } = await import('jose')
  const pair = await generateKeyPair('RS256')
  const publicJwk = { ...(await exportJWK(pair.publicKey)), alg: 'RS256' }
  return { privateKey: pair.privateKey, publicJwk }
})

vi.mock('jose', async (importOriginal) => {
  const jose = await importOriginal<typeof import('jose')>()
  return {
    ...jose,
    createRemoteJWKSet: () => jose.createLocalJWKSet({ keys: [keys.publicJwk] })
  }
})

const { verifyToken } = await vi.importActual<
  typeof import('@/modules/auth/jwt.js')
>('@/modules/auth/jwt.js')

const sign = ({
  issuer = COGNITO_ISSUER,
  audience = COGNITO_AUDIENCE,
  expiresIn = '5m'
} = {}) =>
  new SignJWT({ email: 'test@example.com' })
    .setProtectedHeader({ alg: 'RS256' })
    .setSubject('test-sub')
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(keys.privateKey)

describe('verifyToken', () => {
  it('returns the payload of a token signed by the user pool', async () => {
    const result = await verifyToken(await sign())

    expect(result._unsafeUnwrap()).toMatchObject({
      sub: 'test-sub',
      email: 'test@example.com'
    })
  })

  it.each([
    ['another issuer', { issuer: 'https://evil.example.com' }],
    ['another audience', { audience: 'other-client' }],
    ['an expired token', { expiresIn: '-1m' }]
  ])('rejects %s as unauthorized', async (_, claims) => {
    const result = await verifyToken(await sign(claims))

    expect(result._unsafeUnwrapErr()).toMatchObject({ code: 'UNAUTHORIZED' })
  })

  it('rejects a malformed token as unauthorized', async () => {
    const result = await verifyToken('not-a-jwt')

    expect(result._unsafeUnwrapErr()).toMatchObject({ code: 'UNAUTHORIZED' })
  })
})
