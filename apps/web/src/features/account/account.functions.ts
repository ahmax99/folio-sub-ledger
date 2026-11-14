import { createServerFn } from '@tanstack/react-start'

import { UserModel } from '@shared/config'

import { getMe } from '@/features/auth/server/user.server'
import { handleApiError } from '@/features/error/lib/handleApiError'
import { catchAsyncError } from '@/features/error/utils/catchError'

import * as accountApi from './server/account.server'

// Errors leave as AppError so the client keeps the backend's status and fields.
export const updateUser = createServerFn({ method: 'POST' })
  .validator(UserModel.updateUserBody)
  .handler(async ({ data }) =>
    handleApiError(
      catchAsyncError(
        getMe().then((user) => accountApi.updateUser(user.id, data))
      )
    )
  )

export const deleteUser = createServerFn({ method: 'POST' }).handler(async () =>
  handleApiError(
    catchAsyncError(getMe().then((user) => accountApi.deleteUser(user.id)))
  )
)

export const fetchPresignedUrl = createServerFn()
  .validator(UserModel.uploadImageQuery)
  .handler(async ({ data }) =>
    handleApiError(catchAsyncError(accountApi.fetchPresignedUrl(data)))
  )
