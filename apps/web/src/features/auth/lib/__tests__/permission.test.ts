import { subject } from '@casl/ability'
import { describe, expect, it } from 'vitest'

import { getUserPermissions } from '../permission'

const self = { id: 'u1', orgId: 'o1' }
const colleague = { id: 'u2', orgId: 'o1' }
const stranger = { id: 'u3', orgId: 'o2' }

describe('getUserPermissions', () => {
  it('grants nothing without a user', () => {
    expect(getUserPermissions().rules).toEqual([])
  })

  it('lets an analyst read their firm and edit only themselves', () => {
    const ability = getUserPermissions({ ...self, role: 'ANALYST' })

    expect(ability.can('read', subject('User', colleague))).toBe(true)
    expect(ability.can('read', subject('User', stranger))).toBe(false)
    expect(ability.can('update', subject('User', self))).toBe(true)
    expect(ability.can('update', subject('User', colleague))).toBe(false)
  })

  it('lets an owner manage everyone in their firm only', () => {
    const ability = getUserPermissions({ ...self, role: 'OWNER' })

    expect(ability.can('delete', subject('User', colleague))).toBe(true)
    expect(ability.can('delete', subject('User', stranger))).toBe(false)
  })
})
