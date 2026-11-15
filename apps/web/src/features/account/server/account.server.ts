import type {
  UpdateUserBody,
  UploadImageQuery,
  UserIdParams
} from '@shared/config'

import { serverAuthApiClient } from '@/lib/serverApiClient.server'

// The UI ignores the updated/deleted row, so the response body isn't parsed.
export const updateUser = async (
  userId: UserIdParams['id'],
  data: UpdateUserBody
): Promise<void> => {
  await serverAuthApiClient.put(`users/${userId}`, { json: data })
}

export const deleteUser = async (userId: UserIdParams['id']): Promise<void> => {
  await serverAuthApiClient.delete(`users/${userId}`)
}

export const fetchPresignedUrl = async (query: UploadImageQuery) =>
  serverAuthApiClient
    .get('users/presigned-url', { searchParams: query })
    .json<{ presignedUrl: string; publicUrl: string; key: string }>()
