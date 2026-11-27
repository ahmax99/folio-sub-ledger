import { prisma } from '@shared/neon'
import { v7 as uuidv7 } from 'uuid'

import { identities, type Token } from '@/test/identities.js'

const userOf = (token: Token) => {
  const { sub, email, name } = identities[token]
  return { cognitoSub: sub, email, name }
}

export const seedOwner = (
  token: Token = 'test-token',
  organizationName = 'Test Firm'
) =>
  prisma.user.create({
    data: {
      ...userOf(token),
      role: 'OWNER',
      organization: { create: { name: organizationName } }
    }
  })

export const addAnalyst = (orgId: string) =>
  prisma.user.create({
    data: { ...userOf('analyst-token'), role: 'ANALYST', orgId }
  })

export const addReviewer = (orgId: string) =>
  prisma.user.create({
    data: { ...userOf('reviewer-token'), role: 'REVIEWER', orgId }
  })

// Bulk Analysts without a test identity, for list ordering and size tests.
export const addMembers = (
  orgId: string,
  rows: { name: string; email: string }[]
) =>
  prisma.user.createMany({
    data: rows.map((row) => ({
      ...row,
      cognitoSub: `seed-${uuidv7()}`,
      role: 'ANALYST' as const,
      orgId
    }))
  })

export const send = (
  app: { handle: (request: Request) => Promise<Response> },
  method: string,
  path: string,
  { token, body }: { token?: Token; body?: unknown } = {}
) =>
  app.handle(
    new Request(`http://localhost${path}`, {
      method,
      headers: {
        'content-type': 'application/json',
        ...(token && { authorization: `Bearer ${token}` })
      },
      ...(body !== undefined && { body: JSON.stringify(body) })
    })
  )
