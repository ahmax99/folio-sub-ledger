import {
  createServerValidate,
  ServerValidateError
} from '@tanstack/react-form-start'
import { createServerFn } from '@tanstack/react-start'

import { ResultAsync } from 'neverthrow'

import { PUBLIC_ROUTES } from '@/features/auth/lib/routes'
import { AppError } from '@/features/error/lib/AppError'
import { handleApiError } from '@/features/error/lib/handleApiError'
import { redirectResponse } from '@/lib/redirectResponse'

import {
  contactFormOptions,
  ContactFormModel
} from './schemas/contactForm.schema'
import { deliverContactEmails } from './server/contactEmail.server'

const validateContactForm = createServerValidate({
  ...contactFormOptions,
  onServerValidate: ContactFormModel.contact
})

const toFormResponse = (error: unknown) => {
  if (error instanceof ServerValidateError) return error.response
  throw error
}

// react-doctor-disable-next-line react-doctor/server-auth-actions -- public contact form; Zod-validated input, no privileged mutation (see .react-doctor/false-positives.md)
export const sendContactEmail = createServerFn({ method: 'POST' })
  .validator(ContactFormModel.contact)
  .handler(async ({ data }) => {
    await handleApiError(deliverContactEmails(data))
  })

// react-doctor-disable-next-line react-doctor/server-auth-actions -- public contact form; Zod-validated input, no privileged mutation (see .react-doctor/false-positives.md)
export const submitContactForm = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    if (!(data instanceof FormData))
      throw new AppError('BAD_REQUEST', 'Expected form data')

    return data
  })
  .handler(({ data }) =>
    ResultAsync.fromPromise(validateContactForm(data), (error) => error)
      .andThen(deliverContactEmails)
      .match(() => redirectResponse(PUBLIC_ROUTES.HOME), toFormResponse)
  )
