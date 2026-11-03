import type { Organization, SetupFirmBody } from '@shared/config'

import { serverAuthApiClient } from '@/lib/serverApiClient'

export const setupFirm = async (data: SetupFirmBody) =>
  serverAuthApiClient.post('organizations', { json: data }).json<Organization>()
