import { queryOptions } from '@tanstack/react-query'

import { fetchSessionState } from '../auth.functions'

// Layout routes read the session through `fetchQuery`, so navigations and
// hover preloads reuse it for the default staleTime instead of calling the
// BFF (and Cognito) every time. Invalidate it after anything that changes it.
export const sessionQueryOptions = queryOptions({
  queryKey: ['auth', 'session'],
  queryFn: () => fetchSessionState()
})
