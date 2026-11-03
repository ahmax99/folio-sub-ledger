import type { User } from '@shared/config'
import { HTTPError } from 'ky'

import {
  ID_TOKEN_HEADER,
  serverApiClient,
  serverAuthApiClient
} from '@/lib/serverApiClient'

const nullWhenNotFound = (error: unknown) => {
  if (error instanceof HTTPError && error.response.status === 404) return null
  throw error
}

export const getMe = async () =>
  serverAuthApiClient.get('/users/me').json<User>()

export const findMe = async () => getMe().catch(nullWhenNotFound)

export const findMeWithIdToken = async (idToken: string) =>
  serverApiClient
    .get('/users/me', { headers: { [ID_TOKEN_HEADER]: idToken } })
    .json<User>()
    .catch(nullWhenNotFound)
