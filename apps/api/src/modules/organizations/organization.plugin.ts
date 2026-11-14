import { Elysia } from 'elysia'

import { handleApiError } from '@/error/utils/handleApiError.js'
import { authPlugin } from '@/modules/auth/auth.plugin.js'
import { getUserPermissions } from '@/modules/auth/permission.js'
import { organizationDb } from '@/modules/organizations/organization.db.js'
import { OrganizationService } from '@/modules/organizations/organization.service.js'

export const organizationPlugin = new Elysia({ name: 'organization-plugin' })
  .use(authPlugin)
  .decorate({ organizationService: OrganizationService })
  .macro('organization', {
    auth: true,
    async resolve({ user }) {
      const member = await handleApiError(
        OrganizationService.findMember(user.cognitoSub)
      )

      return {
        member,
        ability: getUserPermissions(member),
        db: organizationDb(
          member ? { orgId: member.orgId } : { cognitoSub: user.cognitoSub }
        )
      }
    }
  })
