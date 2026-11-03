import type { UpdateUserBody } from '@shared/config'

import { apiClient } from '@/lib/apiClient'

const PLACEHOLDER_IMAGE_URL =
  'https://images.unsplash.com/photo-1761019646782-4bc46ba43fe9?q=80&w=1631&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'

export const fetchProfileImage = (imagePath: string) => {
  if (!imagePath) return PLACEHOLDER_IMAGE_URL

  return `/api/images?path=${encodeURIComponent(imagePath)}`
}

export const updateUser = async (data: UpdateUserBody) =>
  apiClient.put('account', { json: data }).json()

export const uploadProfileImage = async (file: File) => {
  const { presignedUrl, publicUrl, key } = await apiClient
    .get('account/presigned-url', {
      searchParams: {
        filename: file.name,
        contentType: file.type
      }
    })
    .json<{ presignedUrl: string; publicUrl: string; key: string }>()

  const uploadResponse = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type
    }
  })

  return { uploadResponse, publicUrl, key }
}

export const deleteUser = async () => apiClient.delete('account').json()
