import { AbilityBuilder } from '@casl/ability'
import type { User } from '@shared/neon'

import { type AppAbility, createPrismaAbility } from '@/lib/casl-prisma.js'

export type Member = Pick<User, 'id' | 'orgId' | 'role'>

export const getUserPermissions = (member?: Member | null) => {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility)

  if (!member) return build()

  can('read', 'Organization', { id: member.orgId })
  can('read', 'User', { orgId: member.orgId })
  can(['update', 'delete'], 'User', { id: member.id })

  if (member.role === 'OWNER') {
    can('update', 'Organization', { id: member.orgId })
    can('manage', 'User', { orgId: member.orgId })
  }

  return build()
}
