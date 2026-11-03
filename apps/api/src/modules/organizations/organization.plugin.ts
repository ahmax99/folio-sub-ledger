import { Elysia } from 'elysia'

import { OrganizationService } from '@/modules/organizations/organization.service.js'

export const organizationPlugin = new Elysia({
  name: 'organization-plugin'
}).decorate({ organizationService: OrganizationService })
