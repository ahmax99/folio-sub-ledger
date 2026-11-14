import type { Organization } from '@shared/config'
import { type Prisma, prisma } from '@shared/neon'
import type { ResultAsync } from 'neverthrow'

import type { AppError } from '@/error/lib/AppError.js'
import { catchAsyncError } from '@/error/utils/catchError.js'
import type { AuthUser } from '@/modules/auth/auth.plugin.js'

type OrganizationScope =
  | { orgId: Organization['id'] }
  | { cognitoSub: AuthUser['cognitoSub'] }

export interface OrganizationDb {
  run: <T>(
    query: (tx: Prisma.TransactionClient) => Promise<T>
  ) => ResultAsync<T, AppError>
}

export const organizationDb = (scope: OrganizationScope): OrganizationDb => ({
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
})
