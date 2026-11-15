import { describe, expect, it, vi } from 'vitest'

const loadSigningHook = async (nodeEnv: 'development' | 'production') => {
  vi.resetModules()
  vi.stubEnv('NODE_ENV', nodeEnv)
  return (await import('../sig4.server')).signingHook
}

const request = () => new Request('https://lambda.test/api/v1/users/me')

describe('signingHook', () => {
  it('leaves requests unsigned outside production', async () => {
    vi.stubEnv('AWS_ACCESS_KEY_ID', 'key')
    vi.stubEnv('AWS_SECRET_ACCESS_KEY', 'secret')
    const signingHook = await loadSigningHook('development')

    expect(await signingHook({ request: request() })).toBeUndefined()
  })

  it('leaves requests unsigned without AWS credentials', async () => {
    vi.stubEnv('AWS_ACCESS_KEY_ID', '')
    const signingHook = await loadSigningHook('production')

    expect(await signingHook({ request: request() })).toBeUndefined()
  })

  it('SigV4-signs requests for the lambda service in production', async () => {
    vi.stubEnv('AWS_ACCESS_KEY_ID', 'key')
    vi.stubEnv('AWS_SECRET_ACCESS_KEY', 'secret')
    const signingHook = await loadSigningHook('production')

    const signed = await signingHook({ request: request() })

    expect(signed?.headers.get('authorization')).toMatch(
      /^AWS4-HMAC-SHA256 Credential=key\/\d{8}\/ap-northeast-1\/lambda\/aws4_request/
    )
  })
})
