import { ResultAsync } from 'neverthrow'

import { env } from '@/config/env'

import type { ContactFormSchema } from '../schemas/contactForm.schema'

import { ContactConfirmationEmail } from './emails/ContactConfirmationEmail.server'
import { ContactNotificationEmail } from './emails/ContactNotificationEmail.server'
import { sendEmail } from './sendEmail.server'

export const deliverContactEmails = (data: ContactFormSchema) =>
  ResultAsync.combine([
    sendEmail({
      user: { email: data.email, name: data.name },
      subject: `Thank you for contacting us, ${data.name}!`,
      react: ContactConfirmationEmail(data)
    }),
    sendEmail({
      user: { email: env.CONTACT_TO_EMAIL, name: 'Site Owner' },
      subject: `Contact: ${data.subject}`,
      react: ContactNotificationEmail(data)
    })
  ])
