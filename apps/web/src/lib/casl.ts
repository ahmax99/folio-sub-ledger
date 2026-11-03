import type { MongoAbility } from '@casl/ability'

type Action = 'create' | 'read' | 'update' | 'delete' | 'manage'

type AppSubjects = 'all' | 'User' | { id: string }

export type AppAbility = MongoAbility<[Action, AppSubjects]>
