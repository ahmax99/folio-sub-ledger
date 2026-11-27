import * as Sentry from '@sentry/tanstackstart-react'
import { type SentryRuntimeConfig, sentryOptions } from '@shared/config'

fetch('/api/config')
  .then((response) => {
    if (!response.ok) throw new Error(`/api/config ${response.status}`)
    return response.json()
  })
  .then(({ sentry }: { sentry: SentryRuntimeConfig }) => {
    if (!sentry.dsn) return

    Sentry.init({
      ...sentryOptions(sentry),
      integrations: [Sentry.replayIntegration()],
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1
    })
  })
  .catch(() => {
    // Never let telemetry setup crash the app.
  })
