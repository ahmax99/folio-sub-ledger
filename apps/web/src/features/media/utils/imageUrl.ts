// Stored images are served through the BFF's /api/images route, never from S3 directly.
export const imageUrl = (path: string) =>
  `/api/images?path=${encodeURIComponent(path)}`
