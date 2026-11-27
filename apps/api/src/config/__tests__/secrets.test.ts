import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DATABASE_PASSWORD_TTL_MS } from '@/constants/index.js'

const { send, setDatabasePasswordProvider } = vi.hoisted(() => ({
  send: vi.fn(),
  setDatabasePasswordProvider: vi.fn()
}))

vi.mock('@aws-sdk/client-secrets-manager', () => ({
  SecretsManagerClient: class {
    send = send
  },
  GetSecretValueCommand: class {
    constructor(readonly input: { SecretId: string }) {}
  }
}))

vi.mock('@shared/neon', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@shared/neon')>()),
  setDatabasePasswordProvider
}))

const secret = (
  active: 'folio_runtime_a' | 'folio_runtime_b',
  passwords = { folio_runtime_a: 'pass-a-1', folio_runtime_b: 'pass-b-1' }
) => ({
  SecretString: JSON.stringify({
    host: 'ep-test-pooler.aws.neon.tech',
    database: 'folio',
    active,
    passwords
  })
})

// loadSecrets keeps its cache in module state, so each test loads a fresh copy.
const loadSecrets = async () => {
  const { loadSecrets } = await import('@/config/secrets.js')
  await loadSecrets()
  const [[provider]] = setDatabasePasswordProvider.mock.calls as [
    [() => Promise<string>]
  ]
  return provider
}

describe('loadSecrets', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.useFakeTimers()
    vi.stubEnv('DATABASE_URL_SECRET_NAME', 'folio-dev/database-url')
    vi.stubEnv('DATABASE_URL', '')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('sets DATABASE_URL to the active runtime user without a password', async () => {
    send.mockResolvedValue(secret('folio_runtime_b'))

    await loadSecrets()

    expect(process.env.DATABASE_URL).toBe(
      'postgresql://folio_runtime_b@ep-test-pooler.aws.neon.tech/folio?sslmode=require'
    )
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: { SecretId: 'folio-dev/database-url' }
      })
    )
  })

  it('returns the pinned user password from cache within the TTL without calling Secrets Manager', async () => {
    send.mockResolvedValue(secret('folio_runtime_a'))
    const provider = await loadSecrets()

    vi.advanceTimersByTime(4 * 60_000)

    expect(await provider()).toBe('pass-a-1')
    expect(send).toHaveBeenCalledTimes(1)
  })

  it('re-reads the secret after the TTL and returns the pinned user new password', async () => {
    send.mockResolvedValueOnce(secret('folio_runtime_a'))
    const provider = await loadSecrets()
    send.mockResolvedValueOnce(
      secret('folio_runtime_a', {
        folio_runtime_a: 'pass-a-2',
        folio_runtime_b: 'pass-b-1'
      })
    )

    vi.advanceTimersByTime(DATABASE_PASSWORD_TTL_MS + 1)

    expect(await provider()).toBe('pass-a-2')
    expect(send).toHaveBeenCalledTimes(2)
  })

  it('keeps the user pinned at cold start after the secret flips active', async () => {
    send.mockResolvedValueOnce(secret('folio_runtime_a'))
    const provider = await loadSecrets()
    send.mockResolvedValueOnce(
      secret('folio_runtime_b', {
        folio_runtime_a: 'pass-a-1',
        folio_runtime_b: 'pass-b-2'
      })
    )

    vi.advanceTimersByTime(DATABASE_PASSWORD_TTL_MS + 1)

    expect(await provider()).toBe('pass-a-1')
    expect(process.env.DATABASE_URL).toContain('folio_runtime_a@')
  })

  it('keeps the cached password when a refresh fails after the TTL, and retries on the next connection', async () => {
    send.mockResolvedValueOnce(secret('folio_runtime_a'))
    const provider = await loadSecrets()
    send.mockRejectedValueOnce(new Error('ThrottlingException'))

    vi.advanceTimersByTime(DATABASE_PASSWORD_TTL_MS + 1)

    expect(await provider()).toBe('pass-a-1')
    send.mockResolvedValueOnce(
      secret('folio_runtime_a', {
        folio_runtime_a: 'pass-a-2',
        folio_runtime_b: 'pass-b-1'
      })
    )
    expect(await provider()).toBe('pass-a-2')
    expect(send).toHaveBeenCalledTimes(3)
  })

  it.each([
    [
      'a plain connection string',
      'postgresql://owner:pw@ep-old.aws.neon.tech/folio'
    ],
    [
      'an unknown active user',
      JSON.stringify({
        host: 'h',
        database: 'd',
        active: 'neondb_owner',
        passwords: { folio_runtime_a: 'a', folio_runtime_b: 'b' }
      })
    ],
    [
      'a missing password',
      JSON.stringify({
        host: 'h',
        database: 'd',
        active: 'folio_runtime_a',
        passwords: { folio_runtime_a: '' }
      })
    ]
  ])(
    'rejects a secret that fails the runtimeDatabaseSecret schema: %s',
    async (_, SecretString) => {
      send.mockResolvedValue({ SecretString })
      const { loadSecrets } = await import('@/config/secrets.js')

      const failure = loadSecrets()

      await expect(failure).rejects.toThrow(
        'Secret folio-dev/database-url is not a valid runtime database secret'
      )
      await expect(failure).rejects.not.toThrow(/pw@|owner:/)
      expect(setDatabasePasswordProvider).not.toHaveBeenCalled()
    }
  )
})
