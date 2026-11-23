import {
  GetSecretValueCommand,
  SecretsManagerClient
} from '@aws-sdk/client-secrets-manager'
import { setDatabasePasswordProvider } from '@shared/neon'
import { Result } from 'neverthrow'
import { z } from 'zod'

// Rotation alternates two runtime users; see docs/decisions/2026-11-21-rotated-runtime-database-credentials.md.
const runtimeDatabaseSecret = z.object({
  host: z.string().min(1),
  database: z.string().min(1),
  active: z.enum(['folio_runtime_a', 'folio_runtime_b']),
  passwords: z.object({
    folio_runtime_a: z.string().min(1),
    folio_runtime_b: z.string().min(1)
  })
})

type RuntimeDatabaseSecret = z.infer<typeof runtimeDatabaseSecret>

// A rotation reaches warm Lambdas within this long.
const PASSWORD_TTL_MS = 5 * 60_000

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
  if (cached && Date.now() - cached.readAt < PASSWORD_TTL_MS)
    return cached.secret

  const raw = await fetchSecretValue(secretName)
  const parsed = runtimeDatabaseSecret.safeParse(
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
