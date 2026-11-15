import { describe, expect, it, vi } from 'vitest'

import { lastRequest, respondWith } from '@/test/http'

import { findMe, findMeWithIdToken, getMe } from '../user.server'

vi.mock('@/lib/serverApiClient.server', async () => {
  const { testClient } = await import('@/test/http')
  return {
    ID_TOKEN_HEADER: 'X-Id-Token',
    serverApiClient: testClient,
    serverAuthApiClient: testClient
  }
})

const user = { id: 'u1', email: 'a@example.com' }

describe('getMe', () => {
  it('fetches the signed-in user', async () => {
    respondWith(user)

    expect(await getMe()).toEqual(user)
    expect(lastRequest().url).toBe('http://api.test/users/me')
  })
})

describe('findMe', () => {
  it('returns null when the identity has no user yet', async () => {
    respondWith({ error: { message: 'Not found' } }, 404)

    expect(await findMe()).toBeNull()
  })

  it('rethrows any other failure', async () => {
    respondWith({ error: { message: 'Down' } }, 500)

    await expect(findMe()).rejects.toMatchObject({
      response: { status: 500 }
    })
  })
})

describe('findMeWithIdToken', () => {
  it('sends the given ID token instead of the session', async () => {
    respondWith(user)

    expect(await findMeWithIdToken('id-1')).toEqual(user)
    expect(lastRequest().headers.get('X-Id-Token')).toBe('id-1')
  })
})
