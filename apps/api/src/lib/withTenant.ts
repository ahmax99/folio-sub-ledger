import { type Prisma, prisma } from '@shared/neon'

type TenantScope = { orgId: string } | { cognitoSub: string }

export const withTenant = <T>(
  scope: TenantScope,
  query: (tx: Prisma.TransactionClient) => Promise<T>
) =>
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
