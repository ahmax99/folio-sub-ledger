import { serverApiClient } from '@/lib/serverApiClient.server'

export const fetchImage = (imagePath: string) =>
  serverApiClient.get(`images/${imagePath}`)
