import { formOptions } from '@tanstack/react-form'

import { z } from 'zod'

export const ContactFormModel = {
  contact: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.email('Please enter a valid email address'),
    subject: z.string().min(3, 'Subject must be at least 3 characters'),
    message: z
      .string()
      .min(10, 'Message must be at least 10 characters')
      .max(1000, 'Message must be at most 1000 characters')
  })
}

export type ContactFormSchema = z.infer<typeof ContactFormModel.contact>

const defaultValues: ContactFormSchema = {
  name: '',
  email: '',
  subject: '',
  message: ''
}

export const contactFormOptions = formOptions({
  defaultValues,
  validators: { onChange: ContactFormModel.contact }
})
