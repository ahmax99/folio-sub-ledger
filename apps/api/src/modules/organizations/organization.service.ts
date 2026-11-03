import type { Organization, SetupFirmBody } from '@shared/config'
import { Prisma, prisma } from '@shared/neon'
import { errAsync, okAsync, ResultAsync } from 'neverthrow'

import { logger } from '@/config/logger.js'
import { AppError } from '@/error/lib/AppError.js'
import { captureError } from '@/error/utils/captureError.js'
import { catchAsyncError, mapToAppError } from '@/error/utils/catchError.js'
import type { AuthUser } from '@/modules/auth/auth.plugin.js'

type Identity = Pick<AuthUser, 'cognitoSub' | 'email' | 'name'>

const select = { organization: { select: { id: true, name: true } } }

const findOrganization = (cognitoSub: Identity['cognitoSub']) =>
  catchAsyncError(
    prisma.user.findUnique({ where: { cognitoSub }, select })
  ).map((user) => user?.organization ?? null)

const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === 'P2002'

const recoverFromRace = (cognitoSub: Identity['cognitoSub']) =>
  findOrganization(cognitoSub).andThen((organization) =>
    organization
      ? okAsync(organization)
      : errAsync(new AppError('INTERNAL_ERROR', 'Firm setup failed'))
  )

const createFirm = (
  { cognitoSub, email, name }: Identity,
  { firmName }: SetupFirmBody
) =>
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
      isUniqueViolation(error)
        ? recoverFromRace(cognitoSub)
        : errAsync(mapToAppError(error)).orTee(captureError)
    )

export const OrganizationService = {
  setupFirm: (
    identity: Identity,
    input: SetupFirmBody
  ): ResultAsync<Organization, AppError> =>
    findOrganization(identity.cognitoSub).andThen((existing) =>
      existing ? okAsync(existing) : createFirm(identity, input)
    )
} as const
