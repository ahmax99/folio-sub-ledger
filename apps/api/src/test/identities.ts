export const identities = {
  'test-token': {
    sub: 'test-sub',
    email: 'test@example.com',
    name: 'Test User'
  },
  'other-token': {
    sub: 'other-sub',
    email: 'other@example.com',
    name: 'Other User'
  },
  'analyst-token': {
    sub: 'analyst-sub',
    email: 'analyst@example.com',
    name: 'Analyst User'
  },
  'reviewer-token': {
    sub: 'reviewer-sub',
    email: 'reviewer@example.com',
    name: 'Reviewer User'
  }
}

export type Token = keyof typeof identities
