import { readFile } from 'node:fs/promises'

import { prisma } from '@shared/neon'
import { describe, expect, it } from 'vitest'

const postgresVersionFile = new URL(
  '../../../../../.postgres-version',
  import.meta.url
)

describe('test database', () => {
  it('runs the Postgres major in .postgres-version', async () => {
    const pinned = Number((await readFile(postgresVersionFile, 'utf8')).trim())
    const rows = await prisma.$queryRaw<{ major: number }[]>`
      SELECT current_setting('server_version_num')::int / 10000 AS major`

    expect(rows).toEqual([{ major: pinned }])
  })
})
