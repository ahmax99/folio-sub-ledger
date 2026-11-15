import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import { toast } from 'sonner'

import { logout } from '@/features/auth/auth.functions'
import { PROTECTED_ROUTES } from '@/features/auth/lib/routes'
import { AppError } from '@/features/error/lib/AppError'

import { deleteUser, fetchPresignedUrl, updateUser } from '../account.functions'
import type { UpdateProfileSchema } from '../schemas/accountForm.schema'

const uploadAvatar = async (image: File | null) => {
  if (!image) return undefined

  const { presignedUrl, key } = await fetchPresignedUrl({
    data: { filename: image.name, contentType: image.type }
  })
  const response = await fetch(presignedUrl, {
    method: 'PUT',
    body: image,
    headers: { 'Content-Type': image.type }
  })
  if (!response.ok) throw new AppError('BAD_REQUEST', 'Failed to upload image')

  return key
}

export const useAccountActions = () => {
  const navigate = useNavigate()

  const updateProfile = useMutation({
    mutationFn: async ({ name, image }: UpdateProfileSchema) =>
      updateUser({
        data: { name, imagePath: await uploadAvatar(image) }
      }),
    onSuccess: async () => {
      toast.success('Profile updated successfully')
      await navigate({ to: PROTECTED_ROUTES.ACCOUNT, replace: true })
    }
  })

  const deleteAccount = useMutation({
    mutationFn: async () => {
      await deleteUser()
      const { logoutUrl } = await logout()
      return logoutUrl
    },
    onSuccess: (logoutUrl) => {
      toast.success('Account deleted successfully')
      globalThis.location.assign(logoutUrl)
    }
  })

  return { updateProfile, deleteAccount }
}
