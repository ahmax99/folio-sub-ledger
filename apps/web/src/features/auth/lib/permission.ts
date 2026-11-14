import { AbilityBuilder, createMongoAbility } from '@casl/ability'
import type { User } from '@shared/config'

import type { AppAbility } from '@/lib/casl'

export const getUserPermissions = (
  user?: Pick<User, 'id' | 'orgId' | 'role'>
): AppAbility => {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility)

  if (!user) return build()

  can('read', 'User', { orgId: user.orgId })
  can(['update', 'delete'], 'User', { id: user.id })

  if (user.role === 'OWNER') can('manage', 'User', { orgId: user.orgId })

  return build()
}
