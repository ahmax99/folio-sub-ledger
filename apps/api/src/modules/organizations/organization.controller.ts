import { fromTypes, openapi } from '@elysiajs/openapi'
import { OrganizationModel } from '@shared/config'
import { Elysia } from 'elysia'

import { errorHandler } from '@/error/lib/errorHandler.js'
import { handleApiError } from '@/error/utils/handleApiError.js'
import { authPlugin } from '@/modules/auth/auth.plugin.js'
import { organizationPlugin } from '@/modules/organizations/organization.plugin.js'

export const organizationController = new Elysia({ prefix: '/organizations' })
  .use(organizationPlugin)
  .use(authPlugin)
  .use(errorHandler)
  .use(openapi({ references: fromTypes() }))
  .post(
    '/',
    async ({ body, user, organizationService }) =>
      handleApiError(organizationService.setupFirm(user, body)),
    {
      body: OrganizationModel.setupFirmBody,
      auth: true,
      detail: {
        summary: "Set up the caller's firm",
        description:
          'Creates the caller as the Owner of a new organization. Identity comes from the JWT. Idempotent - returns the existing organization if the caller already has one.',
        tags: ['Organizations']
      }
    }
  )
