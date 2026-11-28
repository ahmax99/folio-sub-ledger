import { setResponseHeader } from '@tanstack/react-start/server'

import type {
  MemberList,
  Organization,
  SetupOrganizationBody
} from '@shared/config'

import { serverAuthApiClient } from '@/lib/serverApiClient.server'

export const setupOrganization = async (data: SetupOrganizationBody) =>
  serverAuthApiClient.post('organizations', { json: data }).json<Organization>()

export const listMembers = async () => {
  // The member list is personal data: during SSR this marks the HTML that embeds it, otherwise the RPC response.
  setResponseHeader('Cache-Control', 'private, no-store')
  return serverAuthApiClient.get('users').json<MemberList>()
}
