import {
  createServerValidate,
  ServerValidateError
} from '@tanstack/react-form-start'
import { createServerFn } from '@tanstack/react-start'

import { env } from '@/config/env'
import { PUBLIC_ROUTES } from '@/features/auth/lib/routes'
import { AppError } from '@/features/error/lib/AppError'
import { handleApiError } from '@/features/error/server/lib/handleApiError'
import { redirectResponse } from '@/lib/redirectResponse'

import {
  contactFormOptions,
  ContactFormModel,
  type ContactFormSchema
} from '../../schemas/contactForm.schema'
import { ContactConfirmationEmail } from '../components/ContactConfirmationEmail'
import { ContactNotificationEmail } from '../components/ContactNotificationEmail'
import { sendEmail } from '../utils/sendEmail'

const deliverContactEmails = (data: ContactFormSchema) =>
  Promise.all([
    handleApiError(
      sendEmail({
        user: { email: data.email, name: data.name },
        subject: `Thank you for contacting us, ${data.name}!`,
        react: ContactConfirmationEmail(data)
      })
    ),
    handleApiError(
      sendEmail({
        user: { email: env.CONTACT_TO_EMAIL, name: 'Site Owner' },
        subject: `Contact: ${data.subject}`,
        react: ContactNotificationEmail(data)
      })
    )
  ])

const validateContactForm = createServerValidate({
  ...contactFormOptions,
  onServerValidate: ContactFormModel.contact
})

// react-doctor-disable-next-line react-doctor/server-auth-actions -- public contact form; Zod-validated input, no privileged mutation (see .react-doctor/false-positives.md)
export const sendContactEmail = createServerFn({ method: 'POST' })
  .validator(ContactFormModel.contact)
  .handler(async ({ data }) => {
    await deliverContactEmails(data)
  })

// react-doctor-disable-next-line react-doctor/server-auth-actions -- public contact form; Zod-validated input, no privileged mutation (see .react-doctor/false-positives.md)
export const submitContactForm = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    if (!(data instanceof FormData))
      throw new AppError('BAD_REQUEST', 'Expected form data')

    return data
  })
  .handler(async ({ data }) => {
    try {
      const values = await validateContactForm(data)
      await deliverContactEmails(ContactFormModel.contact.parse(values))
    } catch (error) {
      if (error instanceof ServerValidateError) return error.response
      throw error
    }

    return redirectResponse(PUBLIC_ROUTES.HOME)
  })
