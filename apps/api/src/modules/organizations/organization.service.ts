import type { Organization, SetupFirmBody } from '@shared/config'
import { errAsync, okAsync, type ResultAsync } from 'neverthrow'

import { logger } from '@/config/logger.js'
import { AppError } from '@/error/lib/AppError.js'
import { type TenantDb, tenantDb } from '@/lib/tenantDb.js'
import type { AuthUser } from '@/modules/auth/auth.plugin.js'
import type { Member } from '@/modules/auth/permission.js'
import { UserService } from '@/modules/users/user.service.js'

type Identity = Pick<AuthUser, 'cognitoSub' | 'email' | 'name'>

const select = { id: true, name: true }

export const OrganizationService = {
  findOrganization: (
    { orgId }: Member,
    db: TenantDb
  ): ResultAsync<Organization | null, AppError> =>
    db.run((tx) =>
      tx.organization.findUnique({ where: { id: orgId }, select })
    ),

  createFirm: (
    { cognitoSub, email, name }: Identity,
    { firmName }: SetupFirmBody
  ): ResultAsync<Organization, AppError> => {
    const orgId = crypto.randomUUID()

    return tenantDb({ orgId })
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
          : UserService.findMember(cognitoSub)
              .andThen((member) =>
                member
                  ? OrganizationService.findOrganization(
                      member,
                      tenantDb({ orgId: member.orgId })
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
    db: TenantDb,
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
