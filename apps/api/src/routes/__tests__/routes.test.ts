import { describe, expect, it } from 'vitest'

import { routes } from '@/routes/index.js'
import { send } from '@/test/fixtures.js'

describe('routes', () => {
  it('documents every module under /api/v1', async () => {
    const res = await send(routes, 'GET', '/api/v1/openapi/json')

    expect(res.status).toBe(200)
    const { paths } = await res.json()
    expect(Object.keys(paths)).toEqual(
      expect.arrayContaining([
        '/api/v1/images/*',
        '/api/v1/organizations/',
        '/api/v1/users/',
        '/api/v1/users/me',
        '/api/v1/users/presigned-url'
      ])
    )
  })
})
