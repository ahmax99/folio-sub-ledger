import { randomUUID } from 'node:crypto'

import type { Organization, SetupFirmBody } from '@shared/config'
import { Prisma } from '@shared/neon'
import { errAsync, okAsync, ResultAsync } from 'neverthrow'

import { logger } from '@/config/logger.js'
import { AppError } from '@/error/lib/AppError.js'
import { captureError } from '@/error/utils/captureError.js'
import { catchAsyncError } from '@/error/utils/catchError.js'
import { withTenant } from '@/lib/withTenant.js'
import type { AuthUser } from '@/modules/auth/auth.plugin.js'
import type { Member } from '@/modules/auth/permission.js'
import { UserService } from '@/modules/users/user.service.js'

type Identity = Pick<AuthUser, 'cognitoSub' | 'email' | 'name'>

const select = { id: true, name: true }

export const OrganizationService = {
  findOrganization: ({
    orgId
  }: Member): ResultAsync<Organization | null, AppError> =>
    catchAsyncError(
      withTenant({ orgId }, (tx) =>
        tx.organization.findUnique({ where: { id: orgId }, select })
      )
    ),

  createFirm: (
    { cognitoSub, email, name }: Identity,
    { firmName }: SetupFirmBody
  ): ResultAsync<Organization, AppError> => {
    const orgId = randomUUID()

    return ResultAsync.fromPromise(
      withTenant({ orgId }, (tx) =>
        tx.user.create({
          data: {
            cognitoSub,
            email,
            name,
            role: 'OWNER',
            organization: { create: { id: orgId, name: firmName } }
          },
          select: { organization: { select } }
        })
      ),
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
      .orElse((error) => {
        const code =
          error instanceof Prisma.PrismaClientKnownRequestError
            ? error.code
            : 'unknown'

        return code === 'P2002'
          ? UserService.findMember(cognitoSub)
              .andThen((member) =>
                member
                  ? OrganizationService.findOrganization(member)
                  : okAsync(null)
              )
              .andThen((organization) =>
                organization
                  ? okAsync(organization)
                  : errAsync(
                      new AppError('INTERNAL_ERROR', 'Firm setup failed')
                    )
              )
          : errAsync(new AppError('INTERNAL_ERROR', 'Firm setup failed')).orTee(
              () => captureError(new Error(`Firm setup failed (${code})`))
            )
      })
  },

  setupFirm: (
    identity: Identity,
    member: Member | null,
    input: SetupFirmBody
  ): ResultAsync<Organization, AppError> =>
    (member
      ? OrganizationService.findOrganization(member)
      : okAsync(null)
    ).andThen((existing) =>
      existing
        ? okAsync(existing)
        : OrganizationService.createFirm(identity, input)
    )
} as const
