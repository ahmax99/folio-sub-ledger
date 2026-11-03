import { prisma } from '@shared/neon'
import { describe, expect, it } from 'vitest'

import { userController } from '@/modules/users/user.controller.js'

const authHeaders = {
  authorization: 'Bearer test-token',
  'content-type': 'application/json'
}

const registerUser = () =>
  userController.handle(
    new Request('http://localhost/users', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        cognitoSub: 'test-sub',
        email: 'test@example.com',
        name: 'Test User'
      })
    })
  )

describe('user controller', () => {
  it('starts every test with empty tables', async () => {
    expect(await prisma.user.count()).toBe(0)
  })

  it('POST /users registers the caller and persists the row', async () => {
    const res = await registerUser()

    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({
      cognitoSub: 'test-sub',
      email: 'test@example.com',
      name: 'Test User'
    })
    const row = await prisma.user.findUnique({
      where: { cognitoSub: 'test-sub' }
    })
    expect(row).toMatchObject({
      cognitoSub: 'test-sub',
      email: 'test@example.com',
      name: 'Test User'
    })
  })

  it('GET /users/me returns the registered user', async () => {
    await registerUser()

    const res = await userController.handle(
      new Request('http://localhost/users/me', { headers: authHeaders })
    )

    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ email: 'test@example.com' })
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
