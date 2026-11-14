import { AdminDeleteUserCommand } from '@aws-sdk/client-cognito-identity-provider'
import { accessibleBy } from '@casl/prisma'
import type { UpdateUserBody, UserIdParams } from '@shared/config'
import { errAsync, okAsync } from 'neverthrow'

import { env } from '@/config/env.js'
import { AppError } from '@/error/lib/AppError.js'
import { catchAsyncError } from '@/error/utils/catchError.js'
import { authorizeResource } from '@/lib/authorizeResource.js'
import { type AppAbility, subject } from '@/lib/casl-prisma.js'
import { cognitoClient } from '@/lib/cognito.js'
import { type TenantDb, tenantDb } from '@/lib/tenantDb.js'
import type { AuthUser } from '@/modules/auth/auth.plugin.js'

export const UserService = {
  findMember: (cognitoSub: AuthUser['cognitoSub']) =>
    tenantDb({ cognitoSub }).run((tx) =>
      tx.user.findUnique({
        where: { cognitoSub },
        select: { id: true, orgId: true, role: true }
      })
    ),

  findUser: (
    id: UserIdParams['id'],
    db: TenantDb,
    ability: AppAbility,
    action: 'read' | 'update' | 'delete'
  ) =>
    authorizeResource(
      db.run((tx) =>
        tx.user.findFirst({
          where: { AND: [accessibleBy(ability).ofType('User'), { id }] }
        })
      ),
      {
        notFound: 'User not found',
        forbidden: `Cannot ${action} this user`,
        can: (user) => ability.can(action, subject('User', user))
      }
    ),

  getAll: (db: TenantDb, ability: AppAbility) =>
    authorizeResource(ability, {
      forbidden: 'Cannot list users',
      can: (granted) => granted.can('read', 'User')
    }).andThen(() =>
      db.run((tx) =>
        tx.user.findMany({
          where: accessibleBy(ability).ofType('User'),
          orderBy: { createdAt: 'desc' }
        })
      )
    ),

  getById: (id: UserIdParams['id'], db: TenantDb, ability: AppAbility) =>
    UserService.findUser(id, db, ability, 'read'),

  getMe: (cognitoSub: AuthUser['cognitoSub'], db: TenantDb) =>
    authorizeResource(
      db.run((tx) =>
        tx.user.findUnique({
          where: { cognitoSub },
          include: { organization: { select: { id: true, name: true } } }
        })
      ),
      { notFound: 'User not found' }
    ),

  update: (
    id: UserIdParams['id'],
    input: UpdateUserBody,
    db: TenantDb,
    ability: AppAbility
  ) =>
    UserService.findUser(id, db, ability, 'update').andThen(() =>
      db.run((tx) => tx.user.update({ where: { id }, data: input }))
    ),

  delete: (id: UserIdParams['id'], db: TenantDb, ability: AppAbility) =>
    UserService.findUser(id, db, ability, 'delete')
      .andThrough((user) =>
        user.role === 'OWNER'
          ? db
              .run((tx) => tx.user.count({ where: { orgId: user.orgId } }))
              .andThen((count) =>
                count > 1
                  ? errAsync(
                      new AppError(
                        'BAD_REQUEST',
                        'Remove the other members before deleting the firm Owner'
                      )
                    )
                  : okAsync(count)
              )
          : okAsync(user)
      )
      .andThrough((user) =>
        db.run((tx) =>
          user.role === 'OWNER'
            ? tx.organization.delete({ where: { id: user.orgId } })
            : tx.user.delete({ where: { id } })
        )
      )
      .andThrough((user) =>
        catchAsyncError(
          cognitoClient.send(
            new AdminDeleteUserCommand({
              UserPoolId: env.COGNITO_USERPOOL_ID,
              Username: user.cognitoSub
            })
          )
        )
      )
} as const
