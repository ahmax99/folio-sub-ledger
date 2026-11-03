import { randomUUID } from 'node:crypto'

import { prisma } from '@shared/neon'
import { describe, expect, it } from 'vitest'

import { userController } from '@/modules/users/user.controller.js'

const authHeaders = {
  authorization: 'Bearer test-token',
  'content-type': 'application/json'
}

const otherHeaders = { ...authHeaders, authorization: 'Bearer other-token' }

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
      groups: [],
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
        headers: { ...authHeaders, authorization: 'Bearer member-token' }
      })
    )

    expect(res.status).toBe(200)
    expect(await prisma.user.count()).toBe(0)
    expect(await prisma.organization.count()).toBe(0)
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
