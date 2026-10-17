import { createFileRoute } from '@tanstack/react-router'

import { OAuth2Callback } from '@/features/auth/client/components/OAuth2Callback'

export const Route = createFileRoute('/auth/callback')({
  component: OAuth2Callback
})
