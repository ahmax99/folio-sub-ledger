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
import { withTenant } from '@/lib/withTenant.js'
import type { AuthUser } from '@/modules/auth/auth.plugin.js'
import type { Member } from '@/modules/auth/permission.js'

export const UserService = {
  requireMember: (member: Member | null) =>
    authorizeResource(member, { notFound: 'User not found' }),

  findMember: (cognitoSub: AuthUser['cognitoSub']) =>
    catchAsyncError(
      withTenant({ cognitoSub }, (tx) =>
        tx.user.findUnique({
          where: { cognitoSub },
          select: { id: true, orgId: true, role: true }
        })
      )
    ),

  findUser: (
    id: UserIdParams['id'],
    member: Member | null,
    ability: AppAbility,
    action: 'read' | 'update' | 'delete'
  ) =>
    UserService.requireMember(member).andThen(({ orgId }) =>
      authorizeResource(
        withTenant({ orgId }, (tx) =>
          tx.user.findFirst({
            where: { AND: [accessibleBy(ability).ofType('User'), { id }] }
          })
        ),
        {
          notFound: 'User not found',
          forbidden: `Cannot ${action} this user`,
          can: (user) => ability.can(action, subject('User', user))
        }
      )
    ),

  getAll: (member: Member | null, ability: AppAbility) =>
    UserService.requireMember(member).andThen(({ orgId }) =>
      catchAsyncError(
        withTenant({ orgId }, (tx) =>
          tx.user.findMany({
            where: accessibleBy(ability).ofType('User'),
            orderBy: { createdAt: 'desc' }
          })
        )
      )
    ),

  getById: (
    id: UserIdParams['id'],
    member: Member | null,
    ability: AppAbility
  ) => UserService.findUser(id, member, ability, 'read'),

  getMe: (member: Member | null) =>
    UserService.requireMember(member).andThen(({ id, orgId }) =>
      authorizeResource(
        withTenant({ orgId }, (tx) =>
          tx.user.findUnique({
            where: { id },
            include: { organization: { select: { id: true, name: true } } }
          })
        ),
        { notFound: 'User not found' }
      )
    ),

  update: (
    id: UserIdParams['id'],
    input: UpdateUserBody,
    member: Member | null,
    ability: AppAbility
  ) =>
    UserService.findUser(id, member, ability, 'update').andThen(({ orgId }) =>
      catchAsyncError(
        withTenant({ orgId }, (tx) =>
          tx.user.update({ where: { id }, data: input })
        )
      )
    ),

  delete: (
    id: UserIdParams['id'],
    member: Member | null,
    ability: AppAbility
  ) =>
    UserService.findUser(id, member, ability, 'delete')
      .andThrough((user) =>
        user.role === 'OWNER'
          ? catchAsyncError(
              withTenant({ orgId: user.orgId }, (tx) =>
                tx.user.count({ where: { orgId: user.orgId } })
              )
            ).andThen((count) =>
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
        catchAsyncError(
          withTenant({ orgId: user.orgId }, (tx) =>
            user.role === 'OWNER'
              ? tx.organization.delete({ where: { id: user.orgId } })
              : tx.user.delete({ where: { id } })
          )
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
