import { createFileRoute } from '@tanstack/react-router'

import { PageTemplate } from '@/components/layout'
import { generatePageMetadata } from '@/features/metadata/utils/generatePageMetadata'

const FirmHomePage = () => {
  const { user } = Route.useRouteContext()

  return (
    <PageTemplate>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold break-words">
          {user.organization.name}
        </h1>
        <p className="text-muted-foreground">
          Your firm is ready. Client portfolios and transactions will appear
          here.
        </p>
      </div>
    </PageTemplate>
  )
}

export const Route = createFileRoute('/_authorized/firm/')({
  head: () =>
    generatePageMetadata({
      title: 'Firm',
      description: 'Your firm home'
    }),
  component: FirmHomePage
})
