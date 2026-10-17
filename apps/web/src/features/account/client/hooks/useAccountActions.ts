import { useNavigate } from '@tanstack/react-router'

import { toast } from 'sonner'

import { PROTECTED_ROUTES } from '@/features/auth/lib/routes'
import { logout } from '@/features/auth/server/functions'
import { useErrorHandler } from '@/features/error/client/hooks/useErrorHandler'
import {
  handleClientAuthError,
  handleClientError
} from '@/features/error/client/lib/handleError'

import type { UpdateProfileSchema } from '../../schemas/accountForm.schema'
import { deleteUser, updateUser, uploadProfileImage } from '../api'

export const useAccountActions = () => {
  const navigate = useNavigate()
  const handleError = useErrorHandler()

  const handleUpdateProfile = async (
    updateProfileData: UpdateProfileSchema,
    imageFile: File | null,
    onSuccess?: () => void
  ) => {
    let imageUrl = updateProfileData.imagePath ?? undefined

    if (imageFile) {
      const uploadResult = await handleClientError(
        uploadProfileImage(imageFile),
        handleError
      )

      if (uploadResult.error) return uploadResult

      if (!uploadResult.value.uploadResponse.ok)
        return handleError('Failed to upload image')

      imageUrl = uploadResult.value.key
    }

    return handleClientAuthError(
      updateUser({ ...updateProfileData, imagePath: imageUrl }),
      handleError,
      () => {
        onSuccess?.()
        toast.success('Profile updated successfully')
        navigate({ to: PROTECTED_ROUTES.ACCOUNT, replace: true })
      }
    )
  }

  const handleDeleteAccount = () =>
    handleClientAuthError(
      deleteUser().then(async () => {
        const { logoutUrl } = await logout()
        return logoutUrl
      }),
      handleError,
      (logoutUrl) => {
        toast.success('Account deleted successfully')
        globalThis.location.assign(logoutUrl)
      }
    )

  return {
    handleUpdateProfile,
    handleDeleteAccount
  }
}
