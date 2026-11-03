import type { Ability } from '@casl/ability'
import type { PrismaQueryOf, Subjects } from '@casl/prisma'
import type { Prisma } from '@shared/neon'

export { subject } from '@casl/ability'
export { createPrismaAbility } from '@casl/prisma'

type Action = 'create' | 'read' | 'update' | 'delete' | 'manage'

type AppSubjects =
  | 'all'
  | Subjects<{
      User: Prisma.UserGetPayload<object>
    }>

export type AppAbility = Ability<
  [Action, AppSubjects],
  PrismaQueryOf<Prisma.TypeMap>
>
