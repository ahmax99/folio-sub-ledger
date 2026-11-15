import { describe, expect, it } from 'vitest'

import { AuthModel } from '../auth.schema'

describe('AuthModel.callbackParams', () => {
  it.each([
    [{ code: 'c', state: 's' }],
    [{ error: 'access_denied' }],
    [{ error: 'access_denied', state: 's' }]
  ])('accepts %j', (params) => {
    expect(AuthModel.callbackParams.safeParse(params).success).toBe(true)
  })

  it.each([
    [{}],
    [{ state: 's' }],
    [{ code: 'c' }],
    [{ code: '', state: 's' }],
    [{ error: '' }]
  ])('rejects %j', (params) => {
    expect(AuthModel.callbackParams.safeParse(params).success).toBe(false)
  })
})
