import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

import { RUNTIME_ROLE, RUNTIME_TEST_PASSWORD } from './runtimeRole.js'

const abort = (message: string) => {
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

  const prisma = (args: string[], input?: string) =>
    execFileSync('bun', ['--bun', 'prisma', ...args], {
      cwd: fileURLToPath(new URL('../../../../shared/neon', import.meta.url)),
      env: { ...process.env, DATABASE_URL: url },
      input,
      stdio: [input === undefined ? 'inherit' : 'pipe', 'inherit', 'inherit']
    })

  prisma(['migrate', 'deploy'])
  // The migration creates the runtime role without a password; give it one the test client can log in with.
  prisma(
    ['db', 'execute', '--stdin'],
    `ALTER ROLE ${RUNTIME_ROLE} PASSWORD '${RUNTIME_TEST_PASSWORD}';`
  )
}
