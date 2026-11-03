import { AbilityBuilder, createMongoAbility } from '@casl/ability'
import { COGNITO_GROUPS } from '@shared/config'

import type { AppAbility } from '@/lib/casl'

export const getUserPermissions = (user?: {
  id: string
  role: string[]
}): AppAbility => {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility)

  if (!user) return build()

  // Admins (Admins group)
  if (user.role.includes(COGNITO_GROUPS.ADMINS)) can('manage', 'all')

  return build()
}
