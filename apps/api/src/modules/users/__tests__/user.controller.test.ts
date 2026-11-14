import { prisma } from '@shared/neon'
import { v7 as uuidv7 } from 'uuid'
import { describe, expect, it } from 'vitest'

import { userController } from '@/modules/users/user.controller.js'
import { addAnalyst, seedOwner, send } from '@/test/fixtures.js'
import type { Token } from '@/test/identities.js'

const call = (method: string, path: string, token?: Token, body?: unknown) =>
  send(userController, method, path, { token, body })

describe('user controller', () => {
  it('starts every test with empty tables', async () => {
    expect(await prisma.user.count()).toBe(0)
  })

  it('GET /users/me returns the caller with their organization and role', async () => {
    const { orgId } = await seedOwner()

    const res = await call('GET', '/users/me', 'test-token')

    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({
      email: 'test@example.com',
      orgId,
      role: 'OWNER',
      organization: { id: orgId, name: 'Test Firm' }
    })
  })

  it("GET /users/me with two firms returns only the caller's own", async () => {
    const first = await seedOwner('test-token', 'First Firm')
    const second = await seedOwner('other-token', 'Second Firm')

    const mine = await (await call('GET', '/users/me', 'test-token')).json()
    const theirs = await (await call('GET', '/users/me', 'other-token')).json()

    expect(mine.organization).toEqual({ id: first.orgId, name: 'First Firm' })
    expect(theirs.organization).toEqual({
      id: second.orgId,
      name: 'Second Firm'
    })
  })

  it('GET /users/me for an identity without a user record returns 404', async () => {
    const res = await call('GET', '/users/me', 'test-token')

    expect(res.status).toBe(404)
  })

  it('GET /users/me without a token returns 401 and creates nothing', async () => {
    const res = await call('GET', '/users/me')

    expect(res.status).toBe(401)
    expect(res.headers.get('www-authenticate')).toBe('Bearer realm="api"')
    expect(await prisma.user.count()).toBe(0)
  })

  it.each([
    ['GET', '/users', undefined],
    ['GET', '/users/me', undefined],
    [
      'GET',
      '/users/presigned-url?filename=a.png&contentType=image/png',
      undefined
    ],
    ['GET', `/users/${uuidv7()}`, undefined],
    ['PUT', `/users/${uuidv7()}`, { name: 'New Name' }],
    ['DELETE', `/users/${uuidv7()}`, undefined]
  ])(
    'refuses %s %s for an identity without a user record',
    async (method, path, body) => {
      const res = await call(method, path, 'test-token', body)

      expect([403, 404]).toContain(res.status)
    }
  )

  it('DELETE /users/:id by an Owner removes the user and their organization', async () => {
    const owner = await seedOwner()

    const res = await call('DELETE', `/users/${owner.id}`, 'test-token')

    expect(res.status).toBe(200)
    expect(await prisma.user.count()).toBe(0)
    expect(await prisma.organization.count()).toBe(0)
  })

  it('DELETE /users/:id by an Owner is refused while other members remain', async () => {
    const owner = await seedOwner()
    await addAnalyst(owner.orgId)

    const res = await call('DELETE', `/users/${owner.id}`, 'test-token')

    expect(res.status).toBe(400)
    expect(await prisma.user.count()).toBe(2)
    expect(await prisma.organization.count()).toBe(1)
  })

  it('PUT /users/:id by an Analyst on a colleague returns 403', async () => {
    const owner = await seedOwner()
    await addAnalyst(owner.orgId)

    const res = await call('PUT', `/users/${owner.id}`, 'analyst-token', {
      name: 'Renamed'
    })

    expect(res.status).toBe(403)
  })

  it('PUT /users/:id by an Owner on a member of their firm succeeds', async () => {
    const { orgId } = await seedOwner()
    const analyst = await addAnalyst(orgId)

    const res = await call('PUT', `/users/${analyst.id}`, 'test-token', {
      name: 'Renamed'
    })

    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ name: 'Renamed' })
  })

  it('PUT /users/:id by an Analyst on themselves succeeds', async () => {
    const { orgId } = await seedOwner()
    const analyst = await addAnalyst(orgId)

    const res = await call('PUT', `/users/${analyst.id}`, 'analyst-token', {
      name: 'Renamed'
    })

    expect(res.status).toBe(200)
  })

  describe('across two firms', () => {
    it.each([
      ['GET', undefined],
      ['PUT', { name: 'Hijacked' }],
      ['DELETE', undefined]
    ])(
      "returns 404 for %s on another firm's user and leaves it unchanged",
      async (method, body) => {
        await seedOwner()
        const victim = await seedOwner('other-token', 'Other Firm')

        const res = await call(
          method,
          `/users/${victim.id}`,
          'test-token',
          body
        )

        expect(res.status).toBe(404)
        expect(
          await prisma.user.findUnique({ where: { id: victim.id } })
        ).toEqual(victim)
      }
    )

    it("GET /users lists only the caller's own firm", async () => {
      const { orgId } = await seedOwner()
      await addAnalyst(orgId)
      await seedOwner('other-token', 'Other Firm')

      const res = await call('GET', '/users', 'test-token')

      expect(res.status).toBe(200)
      const users: { orgId: string }[] = await res.json()
      expect(users.map((user) => user.orgId)).toEqual([orgId, orgId])
    })
  })
})
