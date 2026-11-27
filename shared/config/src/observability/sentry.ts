// Typed structurally, not with Sentry's `Event`, so @shared/config needs no SDK and one scrubber serves the API, the BFF and the browser.
type ScrubbableEvent = {
  request?: {
    headers?: Record<string, string>
    cookies?: unknown
    data?: unknown
  }
}

export type SentryRuntimeConfig = {
  dsn?: string
  environment: string
  release?: string
  tracesSampleRate: number
}

const REDACTED = '[Filtered]'

const SENSITIVE_HEADERS = new Set(['authorization', 'cookie', 'x-id-token'])

// Ids and SDK metadata look like base58 or hex runs; scrubbing them would break trace linking and stack traces.
const SKIPPED_KEYS = new Set([
  'event_id',
  'trace_id',
  'span_id',
  'parent_span_id',
  'release',
  'environment',
  'sdk',
  'stacktrace',
  'debug_meta'
])

const BASE58 = '1-9A-HJ-NP-Za-km-z'

const PERSONAL_DATA_PATTERNS = [
  /[\w.%+-]+@[\w-]+(?:\.[\w-]+)*\.[a-z]{2,}/gi,
  /\b0x[\da-f]{40}\b/gi,
  /\b(?:bc1|tb1)[02-9ac-hj-np-z]{11,71}\b/gi,
  // Bitcoin legacy and Solana addresses; requiring a digit and a letter keeps ordinary words out.
  new RegExp(
    `\\b(?=[${BASE58}]*\\d)(?=[${BASE58}]*[A-Za-z])[${BASE58}]{26,44}\\b`,
    'g'
  )
]

const scrubString = (value: string) =>
  PERSONAL_DATA_PATTERNS.reduce(
    (scrubbed, pattern) => scrubbed.replace(pattern, REDACTED),
    value
  )

const scrubValue = (value: unknown): unknown => {
  if (typeof value === 'string') return scrubString(value)
  if (Array.isArray(value)) return value.map(scrubValue)
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        SKIPPED_KEYS.has(key) ? entry : scrubValue(entry)
      ])
    )
  return value
}

const withoutSensitiveHeaders = (headers: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(headers).filter(
      ([name]) => !SENSITIVE_HEADERS.has(name.toLowerCase())
    )
  )

/** Removes credentials, request bodies, email and wallet addresses from a Sentry event before it leaves the process. */
export const scrubEvent = <T extends ScrubbableEvent>(event: T): T => {
  const { request, ...rest } = event
  const scrubbed = scrubValue(rest) as T
  if (!request) return scrubbed

  const { headers, cookies: _cookies, data: _data, ...requestRest } = request
  return {
    ...scrubbed,
    request: {
      ...(scrubValue(requestRest) as object),
      ...(headers && {
        headers: scrubValue(withoutSensitiveHeaders(headers))
      })
    }
  }
}

/** The `Sentry.init` options every Folio runtime shares: no default PII, and every event scrubbed. */
export const sentryOptions = ({
  dsn,
  environment,
  release,
  tracesSampleRate
}: SentryRuntimeConfig) => ({
  dsn,
  environment,
  release,
  tracesSampleRate,
  sendDefaultPii: false,
  beforeSend: scrubEvent,
  beforeSendTransaction: scrubEvent
})
