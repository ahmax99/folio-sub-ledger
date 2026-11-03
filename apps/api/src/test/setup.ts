import { PrismaPg } from '@prisma/adapter-pg'
import { errAsync, okAsync } from 'neverthrow'
import { afterAll, beforeEach, vi } from 'vitest'

import { AppError } from '@/error/lib/AppError.js'

vi.mock('@shared/neon', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@shared/neon')>()
  return {
    ...actual,
    prisma: new actual.PrismaClient({
      adapter: new PrismaPg({ connectionString: process.env.TEST_DATABASE_URL })
    })
  }
})

vi.mock('@/modules/auth/jwt.js', () => ({
  verifyToken: (token: string) =>
    token === 'test-token'
      ? okAsync({
          sub: 'test-sub',
          email: 'test@example.com',
          'cognito:groups': []
        })
      : errAsync(new AppError('UNAUTHORIZED', 'Invalid or expired token'))
}))

vi.mock('@/error/utils/captureError.js', () => ({ captureError: vi.fn() }))
vi.mock('@/lib/cognito.js', () => ({ cognitoClient: { send: vi.fn() } }))
vi.mock('@/lib/s3.js', () => ({ s3Client: { send: vi.fn() } }))

const { prisma } = await import('@shared/neon')

beforeEach(async () => {
  const tables = await prisma.$queryRaw<
    { tablename: string }[]
  >`SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`
  if (tables.length === 0) return
  const names = tables.map(({ tablename }) => `"${tablename}"`).join(', ')
  await prisma.$executeRawUnsafe(`TRUNCATE ${names} RESTART IDENTITY CASCADE`)
})

afterAll(() => prisma.$disconnect())
