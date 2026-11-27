import { describe, expect, it } from 'vitest'

import { getInitials } from '../initials'

describe('getInitials', () => {
  it('takes the first letters of the first and last words', () => {
    expect(getInitials('Jane Mary Doe')).toBe('JD')
    expect(getInitials('  jane   doe ')).toBe('JD')
  })

  it('returns one letter for a single word', () => {
    expect(getInitials('Cher')).toBe('C')
  })

  it('returns ? for a blank name', () => {
    expect(getInitials(' ')).toBe('?')
  })

  it('keeps a non-BMP first character whole', () => {
    expect(getInitials('𝒜da Lovelace')).toBe('𝒜L')
  })
})
