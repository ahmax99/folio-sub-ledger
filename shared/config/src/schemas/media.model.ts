import { z } from 'zod'

// Each segment starts with a word character or `-`, so `.` and `..` segments
// (path traversal) cannot match. Mirrors the backend's upload key format.
const IMAGE_PATH = /^[\w-][\w.-]*(?:\/[\w-][\w.-]*)*$/

export const MediaModel = {
  imageQuery: z.object({
    path: z.string().min(1).max(1024).regex(IMAGE_PATH)
  })
}

export type ImageQuery = z.infer<typeof MediaModel.imageQuery>
