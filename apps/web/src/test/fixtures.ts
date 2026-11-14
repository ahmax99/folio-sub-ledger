import type { User } from '@shared/config'

export const testUser: User = {
  id: '019a0000-0000-7000-8000-000000000001',
  orgId: '019a0000-0000-7000-8000-000000000002',
  organization: { id: '019a0000-0000-7000-8000-000000000002', name: 'Acme' },
  cognitoSub: 'sub-1',
  email: 'jane@example.com',
  name: 'Jane',
  role: 'OWNER',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01')
}
