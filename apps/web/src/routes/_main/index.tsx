import { createFileRoute } from '@tanstack/react-router'

import { FeatureSection, HeroSection } from '@/components/common'
import { PageTemplate } from '@/components/layout'
import { generatePageMetadata } from '@/features/metadata/utils/generatePageMetadata'

const HomePage = () => (
  <PageTemplate maxWidth="wide">
    <HeroSection />
    <FeatureSection />
  </PageTemplate>
)

export const Route = createFileRoute('/_main/')({
  head: () =>
    generatePageMetadata({
      title: 'Home',
      description:
        'A production-grade full-stack boilerplate — TanStack Start BFF, Elysia API, Cognito auth, and Neon Postgres.'
    }),
  component: HomePage
})
