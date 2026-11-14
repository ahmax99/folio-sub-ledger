import { prisma } from '@shared/neon'

import { identities, type Token } from '@/test/identities.js'

const userOf = (token: Token) => {
  const { sub, email, name } = identities[token]
  return { cognitoSub: sub, email, name }
}

export const seedOwner = (
  token: Token = 'test-token',
  firmName = 'Test Firm'
) =>
  prisma.user.create({
    data: {
      ...userOf(token),
      role: 'OWNER',
      organization: { create: { name: firmName } }
    }
  })

export const addAnalyst = (orgId: string) =>
  prisma.user.create({
    data: { ...userOf('analyst-token'), role: 'ANALYST', orgId }
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
