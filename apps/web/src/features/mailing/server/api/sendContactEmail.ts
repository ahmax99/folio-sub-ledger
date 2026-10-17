import { createServerFn } from '@tanstack/react-start'

import { env } from '@/config/env'
import { handleApiError } from '@/features/error/server/lib/handleApiError'

import { ContactFormModel } from '../../schemas/contactForm.schema'
import { ContactConfirmationEmail } from '../components/ContactConfirmationEmail'
import { ContactNotificationEmail } from '../components/ContactNotificationEmail'
import { sendEmail } from '../utils/sendEmail'

// react-doctor-disable-next-line react-doctor/server-auth-actions -- public contact form; Zod-validated input, no privileged mutation (see .react-doctor/false-positives.md)
export const sendContactEmail = createServerFn({ method: 'POST' })
  .validator(ContactFormModel.contact)
  .handler(async ({ data }) => {
    await Promise.all([
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
  })
