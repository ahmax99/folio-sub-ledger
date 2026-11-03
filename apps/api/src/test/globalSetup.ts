import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const abort = (message: string): never => {
  const error = new Error(message)
  error.stack = `${error.name}: ${error.message}`
  throw error
}

export const setup = () => {
  const url = process.env.TEST_DATABASE_URL
  if (!url)
    abort(
      'TEST_DATABASE_URL is not set. API integration tests need a dedicated Postgres database (see apps/api/README.md).'
    )

  if (!new URL(url!).pathname.endsWith('_test'))
    abort(
      'TEST_DATABASE_URL must point at a database whose name ends in _test, because every table is truncated before each test.'
    )

  execFileSync('bun', ['--bun', 'prisma', 'migrate', 'deploy'], {
    cwd: fileURLToPath(new URL('../../../../shared/neon', import.meta.url)),
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'inherit'
  })
}
