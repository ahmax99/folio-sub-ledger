export const uuidv7 = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  const ms = Date.now()
  for (let i = 0; i < 6; i++)
    bytes[i] = Math.floor(ms / 2 ** (8 * (5 - i))) % 256
  bytes[6] = (bytes[6]! & 0x0f) | 0x70
  bytes[8] = (bytes[8]! & 0x3f) | 0x80
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'))
  return [4, 2, 2, 2, 6]
    .map((length, index, lengths) => {
      const start = lengths.slice(0, index).reduce((sum, n) => sum + n, 0)
      return hex.slice(start, start + length).join('')
    })
    .join('-')
}
