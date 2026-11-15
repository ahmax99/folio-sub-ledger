import { z } from 'zod'

const IMAGE_PATH = /^[\w-][\w.-]*(?:\/[\w-][\w.-]*)*$/

export const MediaModel = {
  imageQuery: z.object({
    path: z.string().min(1).max(1024).regex(IMAGE_PATH)
  })
}

export type ImageQuery = z.infer<typeof MediaModel.imageQuery>
