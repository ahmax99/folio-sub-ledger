import type { User } from '@shared/config'

import { serverAuthApiClient } from '@/lib/serverApiClient'

export const getMe = async () =>
  serverAuthApiClient.get('/users/me').json<User>()
