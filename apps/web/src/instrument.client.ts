import * as Sentry from '@sentry/tanstackstart-react'

// The DSN comes from a runtime endpoint, not the bundle, so one built image can be promoted across environments.
fetch('/api/config')
  .then((response) => response.json())
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
