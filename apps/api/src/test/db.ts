import { PrismaPg } from '@prisma/adapter-pg'
import { vi } from 'vitest'

// The real client: setup.ts mocks '@shared/neon' so the app's singleton logs in as the runtime role.
const { PrismaClient } =
  await vi.importActual<typeof import('@shared/neon')>('@shared/neon')

// The table owner, for seeding, truncating and asserting on rows outside RLS.
export const ownerPrisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.TEST_DATABASE_URL })
})
