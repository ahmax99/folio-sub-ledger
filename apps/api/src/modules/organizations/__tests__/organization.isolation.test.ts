import { type Prisma, prisma } from '@shared/neon'
import { describe, expect, it } from 'vitest'

import { organizationDb } from '@/modules/organizations/organization.db.js'
import { seedOwner } from '@/test/fixtures.js'

const asApp = <T>(
  orgId: string | null,
  query: (tx: Prisma.TransactionClient) => Promise<T>
) =>
  prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe('SET LOCAL ROLE folio_app')
    if (orgId)
      await tx.$executeRaw`SELECT set_config('app.org_id', ${orgId}, true)`
    return query(tx)
  })

describe('row-level security', () => {
  it('returns only the current firm rows to folio_app', async () => {
    const a = await seedOwner('test-token', 'Firm A')
    await seedOwner('other-token', 'Firm B')

    const rows = await asApp(
      a.orgId,
      (tx) => tx.$queryRaw<{ org_id: string }[]>`SELECT org_id FROM users`
    )
    const orgs = await asApp(
      a.orgId,
      (tx) => tx.$queryRaw<{ id: string }[]>`SELECT id FROM organizations`
    )

    expect(rows).toEqual([{ org_id: a.orgId }])
    expect(orgs).toEqual([{ id: a.orgId }])
  })

  it('returns no rows to folio_app when app.org_id is unset', async () => {
    await seedOwner('test-token', 'Firm A')

    const rows = await asApp(
      null,
      (tx) => tx.$queryRaw<{ id: string }[]>`SELECT id FROM users`
    )

    expect(rows).toEqual([])
  })

  it('rejects an insert into another firm', async () => {
    const a = await seedOwner('test-token', 'Firm A')
    const b = await seedOwner('other-token', 'Firm B')

    await expect(
      asApp(
        a.orgId,
        (tx) =>
          tx.$executeRaw`INSERT INTO users (id, org_id, role, cognito_sub, email, name, updated_at)
          VALUES (gen_random_uuid(), ${b.orgId}, 'ANALYST', 'x-sub', 'x@example.com', 'X', now())`
      )
    ).rejects.toThrow()
    expect(await prisma.user.count({ where: { orgId: b.orgId } })).toBe(1)
  })

  it('forces RLS on every table and gives folio_app no bypass', async () => {
    const tables = await prisma.$queryRaw<
      {
        relname: string
        relrowsecurity: boolean
        relforcerowsecurity: boolean
      }[]
    >`SELECT c.relname, c.relrowsecurity, c.relforcerowsecurity
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relname <> '_prisma_migrations'`
    const [role] = await prisma.$queryRaw<
      { rolbypassrls: boolean; rolsuper: boolean }[]
    >`SELECT rolbypassrls, rolsuper FROM pg_roles WHERE rolname = 'folio_app'`

    expect(tables.length).toBeGreaterThan(0)
    for (const table of tables)
      expect(table).toMatchObject({
        relrowsecurity: true,
        relforcerowsecurity: true
      })
    expect(role).toEqual({ rolbypassrls: false, rolsuper: false })
  })
})

describe('organization table ids', () => {
  it('stores ids and org ids as native uuid', async () => {
    const columns = await prisma.$queryRaw<
      { table_name: string; column_name: string; data_type: string }[]
    >`SELECT table_name, column_name, data_type FROM information_schema.columns
      WHERE table_schema = 'public' AND column_name IN ('id', 'org_id')
        AND table_name <> '_prisma_migrations'
      ORDER BY table_name, column_name`

    expect(columns.length).toBeGreaterThan(0)
    for (const column of columns) expect(column.data_type).toBe('uuid')
  })

  it('generates version 7 ids', async () => {
    const { id, orgId } = await seedOwner()

    expect(id[14]).toBe('7')
    expect(orgId[14]).toBe('7')
  })
})

describe('organizationDb', () => {
  it('scopes queries to the given firm', async () => {
    const a = await seedOwner('test-token', 'Firm A')
    await seedOwner('other-token', 'Firm B')

    const users = await organizationDb({ orgId: a.orgId }).run((tx) =>
      tx.user.findMany()
    )

    expect(users._unsafeUnwrap().map(({ orgId }) => orgId)).toEqual([a.orgId])
  })

  it('finds only the caller own user by cognitoSub before the firm is known', async () => {
    await seedOwner('test-token', 'Firm A')
    await seedOwner('other-token', 'Firm B')

    const users = await organizationDb({ cognitoSub: 'other-sub' }).run((tx) =>
      tx.user.findMany()
    )

    expect(users._unsafeUnwrap().map(({ cognitoSub }) => cognitoSub)).toEqual([
      'other-sub'
    ])
  })

  it('leaves no organization setting on the connection afterwards', async () => {
    const a = await seedOwner('test-token', 'Firm A')

    await organizationDb({ orgId: a.orgId }).run((tx) => tx.user.findMany())
    const after = await prisma.$queryRaw<
      { org: string | null; role: string }[]
    >`SELECT coalesce(current_setting('app.org_id', true), '') AS org, current_user AS role`

    expect(after).toEqual([{ org: '', role: 'postgres' }])
  })
})
