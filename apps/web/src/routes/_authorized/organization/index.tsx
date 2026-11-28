import { createFileRoute } from '@tanstack/react-router'

import { ButtonLink } from '@/components/atoms/ButtonLink'
import { PageTemplate } from '@/components/layout'
import { generatePageMetadata } from '@/features/metadata/utils/generatePageMetadata'
import { PROTECTED_ROUTES } from '@/lib/routes'

const OrganizationHomePage = () => {
  const { user } = Route.useRouteContext()

  return (
    <PageTemplate maxWidth="wide">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold break-words">
          {user.organization.name}
        </h1>
        <p className="text-muted-foreground">
          Your firm is ready. Client portfolios and transactions will appear
          here.
        </p>
        <ButtonLink
          className="self-start"
          to={PROTECTED_ROUTES.ORGANIZATION_MEMBERS}
          variant="outline"
        >
          View members
        </ButtonLink>
      </div>
    </PageTemplate>
  )
}

export const Route = createFileRoute('/_authorized/organization/')({
  head: () =>
    generatePageMetadata({
      title: 'Firm',
      description: 'Your firm home'
    }),
  component: OrganizationHomePage
})
