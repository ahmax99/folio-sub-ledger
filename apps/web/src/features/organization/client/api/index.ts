import type { Organization, SetupFirmBody } from '@shared/config'

import { apiClient } from '@/lib/apiClient'

export const setupFirm = async (data: SetupFirmBody) =>
  apiClient.post('organizations', { json: data }).json<Organization>()
