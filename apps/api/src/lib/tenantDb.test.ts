import { type Prisma, prisma } from '@shared/neon'
import { describe, expect, it } from 'vitest'

import { tenantDb } from '@/lib/tenantDb.js'

const seedFirm = (name: string, sub: string) =>
  prisma.organization.create({
    data: {
      name,
      users: {
        create: {
          cognitoSub: sub,
          email: `${sub}@example.com`,
          name,
          role: 'OWNER'
        }
      }
    },
    include: { users: true }
  })

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
    const a = await seedFirm('Firm A', 'a-sub')
    await seedFirm('Firm B', 'b-sub')

    const rows = await asApp(
      a.id,
      (tx) => tx.$queryRaw<{ org_id: string }[]>`SELECT org_id FROM users`
    )
    const orgs = await asApp(
      a.id,
      (tx) => tx.$queryRaw<{ id: string }[]>`SELECT id FROM organizations`
    )

    expect(rows).toEqual([{ org_id: a.id }])
    expect(orgs).toEqual([{ id: a.id }])
  })

  it('returns no rows to folio_app when app.org_id is unset', async () => {
    await seedFirm('Firm A', 'a-sub')

    const rows = await asApp(
      null,
      (tx) => tx.$queryRaw<{ id: string }[]>`SELECT id FROM users`
    )

    expect(rows).toEqual([])
  })

  it('rejects an insert into another firm', async () => {
    const a = await seedFirm('Firm A', 'a-sub')
    const b = await seedFirm('Firm B', 'b-sub')

    await expect(
      asApp(
        a.id,
        (tx) =>
          tx.$executeRaw`INSERT INTO users (id, org_id, role, cognito_sub, email, name, updated_at)
          VALUES (gen_random_uuid(), ${b.id}, 'ANALYST', 'x-sub', 'x@example.com', 'X', now())`
      )
    ).rejects.toThrow()
    expect(await prisma.user.count({ where: { orgId: b.id } })).toBe(1)
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

describe('tenantDb', () => {
  it('scopes queries to the given firm', async () => {
    const a = await seedFirm('Firm A', 'a-sub')
    await seedFirm('Firm B', 'b-sub')

    const users = await tenantDb({ orgId: a.id }).run((tx) =>
      tx.user.findMany()
    )

    expect(users._unsafeUnwrap().map(({ orgId }) => orgId)).toEqual([a.id])
  })

  it('finds only the caller own user by cognitoSub before the firm is known', async () => {
    await seedFirm('Firm A', 'a-sub')
    await seedFirm('Firm B', 'b-sub')

    const users = await tenantDb({ cognitoSub: 'b-sub' }).run((tx) =>
      tx.user.findMany()
    )

    expect(users._unsafeUnwrap().map(({ cognitoSub }) => cognitoSub)).toEqual([
      'b-sub'
    ])
  })

  it('leaves no tenant setting on the connection afterwards', async () => {
    const a = await seedFirm('Firm A', 'a-sub')

    await tenantDb({ orgId: a.id }).run((tx) => tx.user.findMany())
    const after = await prisma.$queryRaw<
      { org: string | null; role: string }[]
    >`SELECT coalesce(current_setting('app.org_id', true), '') AS org, current_user AS role`

    expect(after).toEqual([{ org: '', role: 'postgres' }])
  })
})
