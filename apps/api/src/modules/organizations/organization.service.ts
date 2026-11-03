import type { Organization, SetupFirmBody } from '@shared/config'
import { Prisma, prisma } from '@shared/neon'
import { errAsync, okAsync, ResultAsync } from 'neverthrow'

import { logger } from '@/config/logger.js'
import { AppError } from '@/error/lib/AppError.js'
import { captureError } from '@/error/utils/captureError.js'
import { catchAsyncError } from '@/error/utils/catchError.js'
import type { AuthUser } from '@/modules/auth/auth.plugin.js'

type Identity = Pick<AuthUser, 'cognitoSub' | 'email' | 'name'>

const select = { organization: { select: { id: true, name: true } } }

export const OrganizationService = {
  findOrganization: (
    cognitoSub: Identity['cognitoSub']
  ): ResultAsync<Organization | null, AppError> =>
    catchAsyncError(
      prisma.user.findUnique({ where: { cognitoSub }, select })
    ).map((user) => user?.organization ?? null),

  isUniqueViolation: (error: unknown) =>
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002',

  redact: (error: unknown) =>
    new Error(
      `Firm setup failed (${error instanceof Prisma.PrismaClientKnownRequestError ? error.code : 'unknown'})`
    ),

  recoverFromRace: (
    cognitoSub: Identity['cognitoSub']
  ): ResultAsync<Organization, AppError> =>
    OrganizationService.findOrganization(cognitoSub).andThen((organization) =>
      organization
        ? okAsync(organization)
        : errAsync(new AppError('INTERNAL_ERROR', 'Firm setup failed'))
    ),

  createFirm: (
    { cognitoSub, email, name }: Identity,
    { firmName }: SetupFirmBody
  ): ResultAsync<Organization, AppError> =>
    ResultAsync.fromPromise(
      prisma.user.create({
        data: {
          cognitoSub,
          email,
          name,
          role: 'OWNER',
          organization: { create: { name: firmName } }
        },
        select
      }),
      (error) => error
    )
      .map(({ organization }) => organization)
      .andTee(({ id }) =>
        logger.info({
          msg: 'Access provisioned',
          actor: cognitoSub,
          orgId: id,
          role: 'OWNER',
          at: new Date().toISOString()
        })
      )
      .orElse((error) =>
        OrganizationService.isUniqueViolation(error)
          ? OrganizationService.recoverFromRace(cognitoSub)
          : errAsync(new AppError('INTERNAL_ERROR', 'Firm setup failed')).orTee(
              () => captureError(OrganizationService.redact(error))
            )
      ),

  setupFirm: (
    identity: Identity,
    input: SetupFirmBody
  ): ResultAsync<Organization, AppError> =>
    OrganizationService.findOrganization(identity.cognitoSub).andThen(
      (existing) =>
        existing
          ? okAsync(existing)
          : OrganizationService.createFirm(identity, input)
    )
} as const
