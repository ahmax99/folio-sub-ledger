// Array.from splits by code point, so a non-BMP first letter stays whole.
const firstLetter = (word = '') => Array.from(word)[0]?.toUpperCase() ?? ''

export const getInitials = (name: string) => {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'

  const first = firstLetter(words[0])
  return words.length === 1 ? first : first + firstLetter(words.at(-1))
}
