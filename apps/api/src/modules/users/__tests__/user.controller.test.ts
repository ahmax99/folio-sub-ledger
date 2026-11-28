import type { MemberList } from '@shared/config'
import { v7 as uuidv7 } from 'uuid'
import { describe, expect, it, vi } from 'vitest'

import { logger } from '@/config/logger.js'
import { MEMBER_LIST_LIMIT } from '@/constants/index.js'
import { userController } from '@/modules/users/user.controller.js'
import { ownerPrisma } from '@/test/db.js'
import {
  addAnalyst,
  addMembers,
  addReviewer,
  seedOwner,
  send
} from '@/test/fixtures.js'
import type { Token } from '@/test/identities.js'

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn().mockResolvedValue('https://s3.example.com/signed')
}))

const call = (method: string, path: string, token?: Token, body?: unknown) =>
  send(userController, method, path, { token, body })

describe('user controller', () => {
  it('starts every test with empty tables', async () => {
    expect(await ownerPrisma.user.count()).toBe(0)
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
    expect(await ownerPrisma.user.count()).toBe(0)
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
    expect(await ownerPrisma.user.count()).toBe(0)
    expect(await ownerPrisma.organization.count()).toBe(0)
  })

  it('DELETE /users/:id by an Owner is refused while other members remain', async () => {
    const owner = await seedOwner()
    await addAnalyst(owner.orgId)

    const res = await call('DELETE', `/users/${owner.id}`, 'test-token')

    expect(res.status).toBe(400)
    expect(await ownerPrisma.user.count()).toBe(2)
    expect(await ownerPrisma.organization.count()).toBe(1)
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
          await ownerPrisma.user.findUnique({ where: { id: victim.id } })
        ).toEqual(victim)
      }
    )

    it("GET /users lists only the caller's own firm", async () => {
      const { orgId } = await seedOwner()
      await addAnalyst(orgId)
      await seedOwner('other-token', 'Other Firm')

      const res = await call('GET', '/users', 'test-token')

      expect(res.status).toBe(200)
      const members: MemberList = await res.json()
      expect(members.map((member) => member.email)).toEqual([
        'analyst@example.com',
        'test@example.com'
      ])
    })
  })

  describe('GET /users', () => {
    it('returns exactly id, name, email and role for each member', async () => {
      const { orgId } = await seedOwner()
      await addAnalyst(orgId)

      const members: MemberList = await (
        await call('GET', '/users', 'test-token')
      ).json()

      expect(members).toHaveLength(2)
      for (const member of members)
        expect(Object.keys(member).sort()).toEqual([
          'email',
          'id',
          'name',
          'role'
        ])
    })

    it('orders members by name, then email', async () => {
      const { orgId } = await seedOwner()
      await addMembers(orgId, [
        { name: 'Sam Lee', email: 'b@x.test' },
        { name: 'Sam Lee', email: 'a@x.test' }
      ])

      const members: MemberList = await (
        await call('GET', '/users', 'test-token')
      ).json()

      expect(members.map(({ name, email }) => `${name} <${email}>`)).toEqual([
        'Sam Lee <a@x.test>',
        'Sam Lee <b@x.test>',
        'Test User <test@example.com>'
      ])
    })

    it('returns the same list to an Owner, an Analyst and a Reviewer', async () => {
      const { orgId } = await seedOwner()
      await addAnalyst(orgId)
      await addReviewer(orgId)

      const bodies = await Promise.all(
        (['test-token', 'analyst-token', 'reviewer-token'] as const).map(
          async (token) => (await call('GET', '/users', token)).json()
        )
      )

      expect(bodies[0]).toHaveLength(3)
      expect(bodies[1]).toEqual(bodies[0])
      expect(bodies[2]).toEqual(bodies[0])
    })

    it('is sent with Cache-Control: private, no-store', async () => {
      await seedOwner()

      const res = await call('GET', '/users', 'test-token')

      expect(res.status).toBe(200)
      expect(res.headers.get('cache-control')).toBe('private, no-store')
    })

    it('without a token returns 401', async () => {
      const res = await call('GET', '/users')

      expect(res.status).toBe(401)
    })

    it('for an identity with no firm returns 403 and no member data', async () => {
      await seedOwner('other-token', 'Other Firm')

      const res = await call('GET', '/users', 'test-token')

      expect(res.status).toBe(403)
      const body = await res.json()
      expect(Array.isArray(body)).toBe(false)
      expect(body).toHaveProperty('error')
      expect(JSON.stringify(body)).not.toContain('other@example.com')
    })

    it('for a firm over MEMBER_LIST_LIMIT returns an error, never a cut list', async () => {
      const { orgId } = await seedOwner()
      const rows = Array.from({ length: MEMBER_LIST_LIMIT }, (_, index) => ({
        name: `Member ${index}`,
        email: `member${index}@x.test`
      }))
      await addMembers(orgId, rows)
      const warn = vi.spyOn(logger, 'warn')

      const res = await call('GET', '/users', 'test-token')

      expect(res.status).toBe(500)
      const body = await res.json()
      expect(Array.isArray(body)).toBe(false)
      expect(body).toHaveProperty('error')
      const logged = JSON.stringify(warn.mock.calls)
      expect(logged).not.toContain('@x.test')
      expect(logged).not.toContain('Member 0')
      warn.mockRestore()
    })

    it('for a firm at exactly MEMBER_LIST_LIMIT returns every member', async () => {
      const { orgId } = await seedOwner()
      await addMembers(
        orgId,
        Array.from({ length: MEMBER_LIST_LIMIT - 1 }, (_, index) => ({
          name: `Member ${index}`,
          email: `member${index}@x.test`
        }))
      )

      const res = await call('GET', '/users', 'test-token')

      expect(res.status).toBe(200)
      expect(await res.json()).toHaveLength(MEMBER_LIST_LIMIT)
    })
  })

  it('GET /users/presigned-url returns an upload URL under the account folder', async () => {
    await seedOwner()

    const res = await call(
      'GET',
      '/users/presigned-url?filename=my photo.png&contentType=image/png',
      'test-token'
    )

    expect(res.status).toBe(200)
    const { presignedUrl, publicUrl, key } = await res.json()
    expect(presignedUrl).toBe('https://s3.example.com/signed')
    expect(key).toMatch(/^account\/\d+-my_photo\.png$/)
    expect(publicUrl).toMatch(new RegExp(`/api/v1/images/${key}$`))
  })
})
