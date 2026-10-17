import * as Sentry from '@sentry/tanstackstart-react'

fetch('/api/config')
  .then((response) => {
    if (!response.ok) throw new Error(`/api/config ${response.status}`)
    return response.json()
  })
  .then(({ sentryDsn }: { sentryDsn: string }) => {
    if (!sentryDsn) return

    Sentry.init({
      dsn: sentryDsn,
      integrations: [Sentry.replayIntegration()],
      tracesSampleRate: import.meta.env.DEV ? 1 : 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1
    })
  })
  .catch(() => {
    // Never let telemetry setup crash the app.
  })
