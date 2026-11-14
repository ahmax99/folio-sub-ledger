import { fetchPresignedUrl } from '../account.functions'

export const uploadProfileImage = async (file: File) => {
  const { presignedUrl, publicUrl, key } = await fetchPresignedUrl({
    data: { filename: file.name, contentType: file.type }
  })

  const uploadResponse = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type
    }
  })

  return { uploadResponse, publicUrl, key }
}
