import {
  GetSecretValueCommand,
  SecretsManagerClient
} from '@aws-sdk/client-secrets-manager'
import { DatabaseModel, type RuntimeDatabaseSecret } from '@shared/config'
import { setDatabasePasswordProvider } from '@shared/neon'
import { Result } from 'neverthrow'

import { DATABASE_PASSWORD_TTL_MS } from '@/constants/index.js'
import { catchAsyncError } from '@/error/utils/catchError.js'

const fetchSecretValue = async (secretName: string) => {
  const client = new SecretsManagerClient()
  const response = await client.send(
    new GetSecretValueCommand({ SecretId: secretName })
  )

  const secretValue =
    response.SecretString ||
    (response.SecretBinary
      ? new TextDecoder('utf-8').decode(response.SecretBinary)
      : null)

  if (!secretValue) throw new Error(`Secret ${secretName} has no value`)
  return secretValue
}

let cached: { secret: RuntimeDatabaseSecret; readAt: number } | undefined

const readRuntimeSecret = async (secretName: string) => {
  if (!cached) return refreshRuntimeSecret(secretName)
  if (Date.now() - cached.readAt < DATABASE_PASSWORD_TTL_MS)
    return cached.secret

  // The cached password stays valid until the next rotation, so a failed refresh (reported to Sentry) must not fail the connection.
  const stale = cached.secret
  return (await catchAsyncError(refreshRuntimeSecret(secretName))).unwrapOr(
    stale
  )
}

const refreshRuntimeSecret = async (secretName: string) => {
  const raw = await fetchSecretValue(secretName)
  const parsed = DatabaseModel.runtimeSecret.safeParse(
    Result.fromThrowable(JSON.parse)(raw).unwrapOr(undefined)
  )
  // Never echo the value: it holds passwords.
  if (!parsed.success)
    throw new Error(
      `Secret ${secretName} is not a valid runtime database secret`
    )

  cached = { secret: parsed.data, readAt: Date.now() }
  return parsed.data
}

export const loadSecrets = async () => {
  if (process.env.NODE_ENV !== 'production') return

  const secretName = process.env.DATABASE_URL_SECRET_NAME
  if (!secretName)
    throw new Error(
      'DATABASE_URL_SECRET_NAME environment variable is required in production'
    )

  // The user is pinned at cold start; only its password is re-read, so a flip of `active` never breaks warm connections.
  const { host, database, active } = await readRuntimeSecret(secretName)
  process.env.DATABASE_URL = `postgresql://${active}@${host}/${database}?sslmode=require`
  setDatabasePasswordProvider(
    async () => (await readRuntimeSecret(secretName)).passwords[active]
  )
}
