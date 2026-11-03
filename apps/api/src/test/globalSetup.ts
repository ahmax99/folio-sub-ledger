import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

export const setup = () => {
  const url = process.env.TEST_DATABASE_URL
  if (!url) {
    const error = new Error(
      'TEST_DATABASE_URL is not set. API integration tests need a dedicated Postgres database (see apps/api/README.md).'
    )
    error.stack = `${error.name}: ${error.message}`
    throw error
  }

  execFileSync('bun', ['--bun', 'prisma', 'migrate', 'deploy'], {
    cwd: fileURLToPath(new URL('../../../../shared/neon', import.meta.url)),
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'inherit'
  })
}
