import { initialFormState } from '@tanstack/react-form-start'
import type { ComponentProps } from 'react'

import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@/test/render'

import { sendContactEmail } from '../../server/api/sendContactEmail'

import { ContactForm } from './ContactForm'

vi.mock('../../server/api/sendContactEmail', () => ({
  sendContactEmail: vi.fn(),
  submitContactForm: { url: '/_serverFn/contact' }
}))

const message = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  subject: 'Hello',
  message: 'I would like a demo.'
}

const invalidEmailState = {
  ...initialFormState,
  errorMap: {
    onServer: { fields: { email: 'Please enter a valid email address' } }
  }
} as unknown as ComponentProps<typeof ContactForm>['serverState']

describe('ContactForm', () => {
  it('sends the message and goes home', async () => {
    vi.mocked(sendContactEmail).mockResolvedValue(undefined)
    const { user, router } = await renderWithProviders(
      <ContactForm serverState={initialFormState} />,
      { path: '/contact' }
    )

    await user.type(screen.getByLabelText('Name'), message.name)
    await user.type(screen.getByLabelText('Email'), message.email)
    await user.type(screen.getByLabelText('Subject'), message.subject)
    await user.type(screen.getByLabelText('Message'), message.message)
    await user.click(screen.getByRole('button', { name: /send message/i }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(sendContactEmail).toHaveBeenCalledWith({ data: message })
  })

  it('posts to the server function so it works without JavaScript', async () => {
    const { container } = await renderWithProviders(
      <ContactForm serverState={initialFormState} />
    )

    const form = container.querySelector('form')
    expect(form?.getAttribute('action')).toBe('/_serverFn/contact')
    expect(form?.getAttribute('method')).toBe('post')
  })

  it('shows field errors from a no-JavaScript submission', async () => {
    await renderWithProviders(<ContactForm serverState={invalidEmailState} />)

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Please enter a valid email address'
    )
    expect(screen.getByLabelText('Email').getAttribute('aria-invalid')).toBe(
      'true'
    )
  })
})
