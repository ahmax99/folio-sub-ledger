import { neonConfig, parseIntoClientConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { WebSocket } from 'ws'

import { PrismaClient } from '../prisma/generated/client.js'

neonConfig.webSocketConstructor = WebSocket
// Over HTTP fetch, pool queries fail to authenticate with a password function; WebSocket calls it per connection.
neonConfig.poolQueryViaFetch = false

declare global {
  var prisma: PrismaClient | undefined
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

let passwordProvider: (() => Promise<string>) | undefined

// Supplies the password for each new connection, so a rotated credential needs no restart. Call before the first query.
export const setDatabasePasswordProvider = (
  provider: () => Promise<string>
) => {
  if (globalForPrisma.prisma)
    throw new Error(
      'The database client already exists. Set the password provider before the first query.'
    )
  passwordProvider = provider
}

const createPrismaClient = () => {
  const DATABASE_URL = process.env.DATABASE_URL
  if (!DATABASE_URL)
    throw new Error(
      'DATABASE_URL is required. Ensure secrets are loaded before accessing the database.'
    )

  const adapter = new PrismaNeon(
    passwordProvider
      ? { ...parseIntoClientConfig(DATABASE_URL), password: passwordProvider }
      : { connectionString: DATABASE_URL }
  )
  return new PrismaClient({ adapter })
}

// Lazy initialization
const getPrismaClient = () => {
  if (!globalForPrisma.prisma) globalForPrisma.prisma = createPrismaClient()

  return globalForPrisma.prisma
}

export const prisma = new Proxy({} as PrismaClient, {
  get: (_, prop) => {
    const client = getPrismaClient()
    return client[prop as keyof PrismaClient]
  }
})
