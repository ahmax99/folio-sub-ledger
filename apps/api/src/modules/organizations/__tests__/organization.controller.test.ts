import { prisma } from '@shared/neon'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { logger } from '@/config/logger.js'
import { organizationController } from '@/modules/organizations/organization.controller.js'
import { send } from '@/test/fixtures.js'
import type { Token } from '@/test/identities.js'

const setupFirm = (body: unknown, token: Token = 'test-token') =>
  send(organizationController, 'POST', '/organizations', { token, body })

describe('organization controller', () => {
  afterEach(async () => {
    vi.restoreAllMocks()
    await prisma.$executeRawUnsafe(
      'DROP TRIGGER IF EXISTS fail_user_insert ON users'
    )
    await prisma.$executeRawUnsafe('DROP FUNCTION IF EXISTS fail_user_insert()')
  })

  it('creates one organization and one OWNER user with that orgId', async () => {
    const res = await setupFirm({ firmName: 'Acme CPA' })

    expect(res.status).toBe(200)
    const org = await res.json()
    expect(org).toMatchObject({ name: 'Acme CPA' })
    expect(await prisma.organization.count()).toBe(1)
    expect(await prisma.user.findMany()).toMatchObject([
      {
        orgId: org.id,
        role: 'OWNER',
        cognitoSub: 'test-sub',
        email: 'test@example.com',
        name: 'Test User'
      }
    ])
  })

  it('rolls back the organization when the user insert fails', async () => {
    await prisma.$executeRawUnsafe(`
      CREATE FUNCTION fail_user_insert() RETURNS trigger AS $$
      BEGIN RAISE EXCEPTION 'forced failure'; END;
      $$ LANGUAGE plpgsql`)
    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER fail_user_insert BEFORE INSERT ON users
      FOR EACH ROW EXECUTE FUNCTION fail_user_insert()`)

    const res = await setupFirm({ firmName: 'Acme CPA' })

    expect(res.status).toBeGreaterThanOrEqual(500)
    expect(await prisma.organization.count()).toBe(0)
    expect(await prisma.user.count()).toBe(0)
  })

  it('returns the same organization on a second call and creates no rows', async () => {
    const first = await (await setupFirm({ firmName: 'Acme CPA' })).json()

    const res = await setupFirm({ firmName: 'Another Name' })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual(first)
    expect(await prisma.organization.count()).toBe(1)
    expect(await prisma.user.count()).toBe(1)
  })

  it('produces exactly one organization for two parallel calls', async () => {
    const [a, b] = await Promise.all([
      setupFirm({ firmName: 'Acme CPA' }),
      setupFirm({ firmName: 'Acme CPA' })
    ])

    expect(a.status).toBe(200)
    expect(b.status).toBe(200)
    expect(await a.json()).toEqual(await b.json())
    expect(await prisma.organization.count()).toBe(1)
    expect(await prisma.user.count()).toBe(1)
  })

  it('ignores role, orgId, userId and cognitoSub in the body', async () => {
    const existing = await prisma.organization.create({
      data: { name: 'Victim Firm' }
    })

    const res = await setupFirm({
      firmName: 'Acme CPA',
      role: 'ANALYST',
      orgId: existing.id,
      userId: existing.id,
      cognitoSub: 'someone-else'
    })

    expect(res.status).toBe(200)
    const user = await prisma.user.findFirstOrThrow()
    expect(user).toMatchObject({ role: 'OWNER', cognitoSub: 'test-sub' })
    expect(user.orgId).not.toBe(existing.id)
    expect(await prisma.organization.count()).toBe(2)
  })

  it('gives two identities two organizations even with the same firm name', async () => {
    const a = await (await setupFirm({ firmName: 'Acme CPA' })).json()
    const b = await (
      await setupFirm({ firmName: 'Acme CPA' }, 'other-token')
    ).json()

    expect(a.id).not.toBe(b.id)
    expect(await prisma.organization.count()).toBe(2)
    expect(await prisma.user.count({ where: { role: 'OWNER' } })).toBe(2)
  })

  it('returns 401 without a token', async () => {
    const res = await send(organizationController, 'POST', '/organizations', {
      body: { firmName: 'Acme CPA' }
    })

    expect(res.status).toBe(401)
    expect(await prisma.organization.count()).toBe(0)
  })

  it.each([
    ['empty', ''],
    ['whitespace-only', '   '],
    ['101 characters', 'a'.repeat(101)]
  ])(
    'returns 400 with a firmName field error for a %s name',
    async (_, firmName) => {
      const res = await setupFirm({ firmName })

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error.fields).toHaveProperty('firmName')
      expect(await prisma.organization.count()).toBe(0)
    }
  )

  it('logs one access-provisioning line without the email or firm name', async () => {
    const info = vi.spyOn(logger, 'info')

    await setupFirm({ firmName: 'Acme CPA' })

    const org = await prisma.organization.findFirstOrThrow()
    const lines = info.mock.calls.filter(([entry]) =>
      JSON.stringify(entry).includes('Access provisioned')
    )
    expect(lines).toHaveLength(1)
    const logged = JSON.stringify(lines[0])
    expect(logged).toContain('test-sub')
    expect(logged).toContain(org.id)
    expect(logged).toContain('OWNER')
    expect(logged).not.toContain('test@example.com')
    expect(logged).not.toContain('Acme CPA')
  })
})
