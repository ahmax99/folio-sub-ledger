import { AdminDeleteUserCommand } from '@aws-sdk/client-cognito-identity-provider'
import type { UpdateUserBody, User, UserIdParams } from '@shared/config'
import { prisma } from '@shared/neon'
import { errAsync, okAsync } from 'neverthrow'

import { env } from '@/config/env.js'
import { AppError } from '@/error/lib/AppError.js'
import { catchAsyncError } from '@/error/utils/catchError.js'
import { authorizeResource } from '@/lib/authorizeResource.js'
import { type AppAbility, subject } from '@/lib/casl-prisma.js'
import { cognitoClient } from '@/lib/cognito.js'

export const UserService = {
  findUser: (
    id: UserIdParams['id'],
    ability: AppAbility,
    action: 'read' | 'update' | 'delete'
  ) =>
    authorizeResource(prisma.user.findUnique({ where: { id } }), {
      notFound: 'User not found',
      forbidden: `Cannot ${action} this user`,
      can: (user) =>
        ability.can(action, subject('User', user)) ||
        ability.can('manage', 'all')
    }),

  ensureSoleMember: (orgId: string) =>
    catchAsyncError(prisma.user.count({ where: { orgId } })).andThen((count) =>
      count > 1
        ? errAsync(
            new AppError(
              'BAD_REQUEST',
              'Remove the other members before deleting the firm Owner'
            )
          )
        : okAsync(count)
    ),

  getAll: (ability: AppAbility) =>
    authorizeResource(ability, {
      forbidden: 'Only admins can list users',
      can: (admin) => admin.can('manage', 'all')
    }).andThen(() =>
      catchAsyncError(prisma.user.findMany({ orderBy: { createdAt: 'desc' } }))
    ),

  getById: (id: UserIdParams['id'], ability: AppAbility) =>
    UserService.findUser(id, ability, 'read'),

  getMe: (cognitoSub: User['cognitoSub'], groups: User['groups']) =>
    authorizeResource(
      prisma.user.findUnique({
        where: { cognitoSub },
        include: { organization: { select: { id: true, name: true } } }
      }),
      { notFound: 'User not found' }
    ).map((user) => ({ ...user, groups })),

  update: (
    id: UserIdParams['id'],
    input: UpdateUserBody,
    ability: AppAbility
  ) =>
    UserService.findUser(id, ability, 'update').andThen(() =>
      catchAsyncError(prisma.user.update({ where: { id }, data: input }))
    ),

  delete: (id: UserIdParams['id'], ability: AppAbility) =>
    UserService.findUser(id, ability, 'delete')
      .andThrough((user) =>
        user.role === 'OWNER'
          ? UserService.ensureSoleMember(user.orgId)
          : okAsync(user)
      )
      .andThrough((user) =>
        catchAsyncError(
          user.role === 'OWNER'
            ? prisma.organization.delete({ where: { id: user.orgId } })
            : prisma.user.delete({ where: { id } })
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
