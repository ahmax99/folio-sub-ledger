import { randomUUID } from 'node:crypto'

import { prisma } from '@shared/neon'
import { describe, expect, it } from 'vitest'

import { userController } from '@/modules/users/user.controller.js'

const authHeaders = {
  authorization: 'Bearer test-token',
  'content-type': 'application/json'
}

const otherHeaders = { ...authHeaders, authorization: 'Bearer other-token' }
const analystHeaders = { ...authHeaders, authorization: 'Bearer analyst-token' }

const seedOwner = (
  sub = 'test-sub',
  email = 'test@example.com',
  firmName = 'Test Firm'
) =>
  prisma.organization.create({
    data: {
      name: firmName,
      users: {
        create: { cognitoSub: sub, email, name: 'Test User', role: 'OWNER' }
      }
    }
  })

const addAnalyst = (orgId: string) =>
  prisma.user.create({
    data: {
      cognitoSub: 'analyst-sub',
      email: 'analyst@example.com',
      name: 'Analyst User',
      role: 'ANALYST',
      orgId
    }
  })

const call = (
  method: string,
  path: string,
  headers: Record<string, string>,
  body?: unknown
) =>
  userController.handle(
    new Request(`http://localhost${path}`, {
      method,
      headers,
      ...(body !== undefined && { body: JSON.stringify(body) })
    })
  )

const getMe = (headers: Record<string, string>) =>
  userController.handle(new Request('http://localhost/users/me', { headers }))

describe('user controller', () => {
  it('starts every test with empty tables', async () => {
    expect(await prisma.user.count()).toBe(0)
  })

  it('GET /users/me returns the seeded user', async () => {
    await seedOwner()

    const res = await userController.handle(
      new Request('http://localhost/users/me', { headers: authHeaders })
    )

    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ email: 'test@example.com' })
  })

  it("GET /users/me returns the caller's organization and role", async () => {
    const org = await seedOwner()

    const res = await getMe(authHeaders)

    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({
      orgId: org.id,
      role: 'OWNER',
      organization: { id: org.id, name: 'Test Firm' }
    })
  })

  it("GET /users/me with two firms returns only the caller's own", async () => {
    const first = await seedOwner('test-sub', 'test@example.com', 'First Firm')
    const second = await seedOwner(
      'other-sub',
      'other@example.com',
      'Second Firm'
    )

    const mine = await (await getMe(authHeaders)).json()
    const theirs = await (await getMe(otherHeaders)).json()

    expect(mine.organization).toEqual({ id: first.id, name: 'First Firm' })
    expect(theirs.organization).toEqual({ id: second.id, name: 'Second Firm' })
  })

  it('GET /users/me for an identity without a user record returns 404', async () => {
    const res = await getMe(authHeaders)

    expect(res.status).toBe(404)
  })

  it.each([
    ['GET', '/users'],
    ['GET', '/users/me'],
    ['GET', '/users/presigned-url?filename=a.png&contentType=image/png'],
    ['GET', `/users/${randomUUID()}`],
    ['PUT', `/users/${randomUUID()}`],
    ['DELETE', `/users/${randomUUID()}`]
  ])(
    'refuses %s %s for an identity without a user record',
    async (method, path) => {
      const res = await userController.handle(
        new Request(`http://localhost${path}`, {
          method,
          headers: authHeaders,
          ...(method === 'PUT' && {
            body: JSON.stringify({ name: 'New Name' })
          })
        })
      )

      expect([403, 404]).toContain(res.status)
    }
  )

  it('DELETE /users/:id by an Owner removes the user and their organization', async () => {
    const org = await seedOwner()
    const user = await prisma.user.findFirstOrThrow({
      where: { orgId: org.id }
    })

    const res = await userController.handle(
      new Request(`http://localhost/users/${user.id}`, {
        method: 'DELETE',
        headers: authHeaders
      })
    )

    expect(res.status).toBe(200)
    expect(await prisma.user.count()).toBe(0)
    expect(await prisma.organization.count()).toBe(0)
  })

  it('DELETE /users/:id by an Owner is refused while other members remain', async () => {
    const org = await seedOwner()
    const owner = await prisma.user.findFirstOrThrow({
      where: { orgId: org.id }
    })
    await prisma.user.create({
      data: {
        cognitoSub: 'colleague-sub',
        email: 'colleague@example.com',
        name: 'Colleague',
        role: 'ANALYST',
        orgId: org.id
      }
    })

    const res = await userController.handle(
      new Request(`http://localhost/users/${owner.id}`, {
        method: 'DELETE',
        headers: authHeaders
      })
    )

    expect(res.status).toBe(400)
    expect(await prisma.user.count()).toBe(2)
    expect(await prisma.organization.count()).toBe(1)
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
        const other = await seedOwner(
          'other-sub',
          'other@example.com',
          'Other Firm'
        )
        const victim = await prisma.user.findFirstOrThrow({
          where: { orgId: other.id }
        })

        const res = await call(method, `/users/${victim.id}`, authHeaders, body)

        expect(res.status).toBe(404)
        expect(
          await prisma.user.findUnique({ where: { id: victim.id } })
        ).toEqual(victim)
      }
    )

    it("GET /users lists only the caller's own firm", async () => {
      const mine = await seedOwner()
      await addAnalyst(mine.id)
      await seedOwner('other-sub', 'other@example.com', 'Other Firm')

      const res = await call('GET', '/users', authHeaders)

      expect(res.status).toBe(200)
      const users = await res.json()
      expect(users).toHaveLength(2)
      expect(
        users.every(({ orgId }: { orgId: string }) => orgId === mine.id)
      ).toBe(true)
    })
  })

  it('PUT /users/:id by an Analyst on a colleague returns 403', async () => {
    const org = await seedOwner()
    await addAnalyst(org.id)
    const owner = await prisma.user.findFirstOrThrow({
      where: { orgId: org.id, role: 'OWNER' }
    })

    const res = await call('PUT', `/users/${owner.id}`, analystHeaders, {
      name: 'Renamed'
    })

    expect(res.status).toBe(403)
  })

  it('PUT /users/:id by an Owner on a member of their firm succeeds', async () => {
    const org = await seedOwner()
    const analyst = await addAnalyst(org.id)

    const res = await call('PUT', `/users/${analyst.id}`, authHeaders, {
      name: 'Renamed'
    })

    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ name: 'Renamed' })
  })

  it('PUT /users/:id by an Analyst on themselves succeeds', async () => {
    const org = await seedOwner()
    const analyst = await addAnalyst(org.id)

    const res = await call('PUT', `/users/${analyst.id}`, analystHeaders, {
      name: 'Renamed'
    })

    expect(res.status).toBe(200)
  })

  it('GET /users/me without a token returns 401 and creates nothing', async () => {
    const res = await userController.handle(
      new Request('http://localhost/users/me')
    )

    expect(res.status).toBe(401)
    expect(res.headers.get('www-authenticate')).toBe('Bearer realm="api"')
    expect(await prisma.user.count()).toBe(0)
  })
})
