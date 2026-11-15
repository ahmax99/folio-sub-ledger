import type { Organization, SetupOrganizationBody } from '@shared/config'

import { serverAuthApiClient } from '@/lib/serverApiClient.server'

export const setupOrganization = async (data: SetupOrganizationBody) =>
  serverAuthApiClient.post('organizations', { json: data }).json<Organization>()
