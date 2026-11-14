import type { Organization, SetupFirmBody } from '@shared/config'
import { type Prisma, prisma } from '@shared/neon'
import { errAsync, okAsync, type ResultAsync } from 'neverthrow'

import { logger } from '@/config/logger.js'
import { AppError } from '@/error/lib/AppError.js'
import { catchAsyncError } from '@/error/utils/catchError.js'
import { uuidv7 } from '@/lib/uuidv7.js'
import type { AuthUser } from '@/modules/auth/auth.plugin.js'
import type { Member } from '@/modules/auth/permission.js'

type Identity = Pick<AuthUser, 'cognitoSub' | 'email' | 'name'>

type OrganizationScope =
  | { orgId: Organization['id'] }
  | { cognitoSub: Identity['cognitoSub'] }

export interface OrganizationDb {
  run: <T>(
    query: (tx: Prisma.TransactionClient) => Promise<T>
  ) => ResultAsync<T, AppError>
}

const select = { id: true, name: true }

export const OrganizationService = {
  db: (scope: OrganizationScope): OrganizationDb => ({
    run: <T>(query: (tx: Prisma.TransactionClient) => Promise<T>) =>
      catchAsyncError(
        prisma.$transaction(
          async (tx) => {
            await tx.$executeRaw`SELECT
              set_config('role', 'folio_app', true),
              set_config('app.org_id', ${'orgId' in scope ? scope.orgId : ''}, true),
              set_config('app.cognito_sub', ${'cognitoSub' in scope ? scope.cognitoSub : ''}, true)`
            return query(tx)
          },
          { maxWait: 10_000 }
        )
      )
  }),

  findMember: (cognitoSub: Identity['cognitoSub']) =>
    OrganizationService.db({ cognitoSub }).run((tx) =>
      tx.user.findUnique({
        where: { cognitoSub },
        select: { id: true, orgId: true, role: true }
      })
    ),

  findOrganization: (
    { orgId }: Member,
    db: OrganizationDb
  ): ResultAsync<Organization | null, AppError> =>
    db.run((tx) =>
      tx.organization.findUnique({ where: { id: orgId }, select })
    ),

  createFirm: (
    { cognitoSub, email, name }: Identity,
    { firmName }: SetupFirmBody
  ): ResultAsync<Organization, AppError> => {
    const orgId = uuidv7()

    return OrganizationService.db({ orgId })
      .run(async (tx) => {
        const organization = await tx.organization.create({
          data: { id: orgId, name: firmName },
          select
        })
        const { count } = await tx.user.createMany({
          data: { cognitoSub, email, name, role: 'OWNER', orgId },
          skipDuplicates: true
        })
        if (count) return organization
        await tx.organization.delete({ where: { id: orgId } })
        return null
      })
      .mapErr(() => new AppError('INTERNAL_ERROR', 'Firm setup failed'))
      .andThen((organization) =>
        organization
          ? okAsync(organization).andTee(({ id }) =>
              logger.info({
                msg: 'Access provisioned',
                actor: cognitoSub,
                orgId: id,
                role: 'OWNER',
                at: new Date().toISOString()
              })
            )
          : OrganizationService.findMember(cognitoSub)
              .andThen((member) =>
                member
                  ? OrganizationService.findOrganization(
                      member,
                      OrganizationService.db({ orgId: member.orgId })
                    )
                  : okAsync(null)
              )
              .andThen((existing) =>
                existing
                  ? okAsync(existing)
                  : errAsync(
                      new AppError('INTERNAL_ERROR', 'Firm setup failed')
                    )
              )
      )
  },

  setupFirm: (
    identity: Identity,
    member: Member | null,
    db: OrganizationDb,
    input: SetupFirmBody
  ): ResultAsync<Organization, AppError> =>
    (member
      ? OrganizationService.findOrganization(member, db)
      : okAsync(null)
    ).andThen((existing) =>
      existing
        ? okAsync(existing)
        : OrganizationService.createFirm(identity, input)
    )
} as const
