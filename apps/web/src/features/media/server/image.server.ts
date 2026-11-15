import { MediaModel } from '@shared/config'

import { serverApiClient } from '@/lib/serverApiClient.server'

export const fetchImage = (imagePath: string) =>
  serverApiClient.get(`images/${imagePath}`)

export const serveImage = async (searchParams: URLSearchParams) => {
  const query = MediaModel.imageQuery.safeParse(
    Object.fromEntries(searchParams)
  )
  if (!query.success) return new Response(null, { status: 400 })

  const upstream = await fetchImage(query.data.path)

  return new Response(upstream.body, {
    headers: {
      'Content-Type':
        upstream.headers.get('Content-Type') ?? 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  })
}
