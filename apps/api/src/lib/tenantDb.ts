import { type Prisma, prisma } from '@shared/neon'

import { catchAsyncError } from '@/error/utils/catchError.js'

type TenantScope = { orgId: string } | { cognitoSub: string }

export const tenantDb = (scope: TenantScope) => ({
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

export type TenantDb = ReturnType<typeof tenantDb>
