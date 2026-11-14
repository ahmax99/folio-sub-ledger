import { createElement } from 'react'

import { describe, expect, it, vi } from 'vitest'

import { sendEmail } from '../sendEmail'

const send = vi.hoisted(() => vi.fn())

vi.mock('resend', () => ({
  Resend: class {
    emails = { send }
  }
}))
vi.mock('@/features/error-tracking/utils/captureError', () => ({
  captureError: vi.fn()
}))

const email = {
  user: { email: 'a@example.com', name: 'A' },
  subject: 'Hello',
  react: createElement('p', null, 'Hi')
}

describe('sendEmail', () => {
  it('sends from the configured address to the user', async () => {
    send.mockResolvedValue({ data: { id: 'e1' }, error: null })

    const result = await sendEmail(email)

    expect(result._unsafeUnwrap()).toEqual({ id: 'e1' })
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'nextjs-boilerplate <noreply@example.com>',
        to: ['a@example.com'],
        subject: 'Hello'
      })
    )
  })

  it('returns an internal error when Resend rejects the email', async () => {
    send.mockResolvedValue({ data: null, error: { message: 'Bad sender' } })

    const result = await sendEmail(email)

    expect(result._unsafeUnwrapErr()).toMatchObject({
      code: 'INTERNAL_ERROR',
      message: 'Bad sender'
    })
  })
})
