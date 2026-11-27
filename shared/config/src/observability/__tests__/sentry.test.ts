import { describe, expect, it } from 'vitest'

import { scrubEvent, sentryOptions } from '../sentry.js'

const sampleEvent = () => ({
  event_id: '9f3a8b7c6d5e4f3a2b1c9d8e7f6a5b4c',
  release: 'v1.4.2',
  message: 'Import failed for jane.doe@example.com',
  exception: {
    values: [
      {
        type: 'Error',
        value:
          'No lots for 0x52908400098527886E0F7030069857D2E4169EE7 or bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq or 7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV',
        stacktrace: {
          frames: [{ filename: '/app/dist/index.js', function: 'importLots' }]
        }
      }
    ]
  },
  breadcrumbs: [
    { message: 'GET /api/v1/users?email=owner@firm.co.uk', category: 'http' }
  ],
  contexts: {
    trace: {
      trace_id: '4bf92f3577b34da6a3ce929d0e0e4736',
      span_id: '00f067aa0ba902b7'
    }
  },
  request: {
    url: 'https://folio.example.com/api/v1/users',
    method: 'PUT',
    headers: {
      Authorization: 'Bearer eyJhbGciOi',
      Cookie: 'auth_session=abc',
      'x-id-token': 'eyJraWQiOi',
      'Content-Type': 'application/json'
    },
    cookies: { auth_session: 'abc' },
    data: { name: 'Jane Doe', email: 'jane.doe@example.com' }
  }
})

describe('scrubEvent', () => {
  it('strips credential headers, cookies and the request body', () => {
    const { request } = scrubEvent(sampleEvent())

    expect(request).toEqual({
      url: 'https://folio.example.com/api/v1/users',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    })
  })

  it('redacts email and wallet addresses wherever they appear', () => {
    const event = scrubEvent(sampleEvent())
    const serialized = JSON.stringify(event)

    expect(serialized).not.toMatch(/@example\.com|@firm\.co\.uk/)
    expect(serialized).not.toContain(
      '0x52908400098527886E0F7030069857D2E4169EE7'
    )
    expect(serialized).not.toContain(
      'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq'
    )
    expect(serialized).not.toContain(
      '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV'
    )
    expect(event.message).toBe('Import failed for [Filtered]')
  })

  it('keeps ids, the release and stack frames intact', () => {
    const event = scrubEvent(sampleEvent())

    expect(event.event_id).toBe('9f3a8b7c6d5e4f3a2b1c9d8e7f6a5b4c')
    expect(event.release).toBe('v1.4.2')
    expect(event.contexts.trace).toEqual(sampleEvent().contexts.trace)
    expect(event.exception.values[0]?.stacktrace).toEqual(
      sampleEvent().exception.values[0]?.stacktrace
    )
  })
})

describe('sentryOptions', () => {
  it('turns off default PII and scrubs errors and transactions', () => {
    const options = sentryOptions({
      dsn: 'https://public@sentry.example.com/1',
      environment: 'dev',
      release: 'abc123',
      tracesSampleRate: 0.1
    })

    expect(options).toMatchObject({
      environment: 'dev',
      release: 'abc123',
      tracesSampleRate: 0.1,
      sendDefaultPii: false,
      beforeSend: scrubEvent,
      beforeSendTransaction: scrubEvent
    })
  })
})
