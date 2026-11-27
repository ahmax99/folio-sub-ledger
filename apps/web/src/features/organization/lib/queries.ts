import { queryOptions } from '@tanstack/react-query'

import { fetchMembers } from '../organization.functions'

// Invite and role-change mutations invalidate this key.
export const membersQueryOptions = queryOptions({
  queryKey: ['organization', 'members'],
  queryFn: () => fetchMembers()
})
