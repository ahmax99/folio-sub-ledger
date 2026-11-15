export const imageUrl = (path: string) =>
  `/api/images?path=${encodeURIComponent(path)}`
