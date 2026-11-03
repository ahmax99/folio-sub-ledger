import { AbilityBuilder } from '@casl/ability'
import { COGNITO_GROUPS } from '@shared/config'

import { type AppAbility, createPrismaAbility } from '@/lib/casl-prisma.js'
import type { AuthUser } from '@/modules/auth/auth.plugin.js'

export const getUserPermissions = (user?: AuthUser, userId?: string) => {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility)

  if (!user) return build()

  // Authenticated users (Users group)
  if (user.role?.includes(COGNITO_GROUPS.USERS) && userId) {
    can('update', 'User', { id: userId })
    can('delete', 'User', { id: userId })
  }

  // Admins (Admins group)
  if (user.role?.includes(COGNITO_GROUPS.ADMINS)) can('manage', 'all')

  return build()
}
