'use client'

import {
  type getFormData,
  mergeForm,
  useTransform
} from '@tanstack/react-form-start'

import { useAppForm } from '@/lib/form'

import { useContactActions } from '../hooks/useContactActions'
import { submitContactForm } from '../mailing.functions'
import { contactFormOptions } from '../schemas/contactForm.schema'

interface ContactFormProps {
  serverState: Awaited<ReturnType<typeof getFormData>>
}

export const ContactForm = ({ serverState }: Readonly<ContactFormProps>) => {
  const { sendContact } = useContactActions()
  const form = useAppForm({
    ...contactFormOptions,
    transform: useTransform(
      (baseForm) => mergeForm(baseForm, serverState),
      [serverState]
    ),
    onSubmit: async ({ value }) => {
      await sendContact.mutateAsync(value)
    }
  })

  return (
    <form.AppForm>
      <form.FormCard
        action={submitContactForm.url}
        description="Get in touch with us"
        title="Contact Us"
      >
        <form.AppField name="name">
          {(field) => <field.Input label="Name" placeholder="Your full name" />}
        </form.AppField>
        <form.AppField name="email">
          {(field) => (
            <field.Input
              label="Email"
              placeholder="Your email address"
              type="email"
            />
          )}
        </form.AppField>
        <form.AppField name="subject">
          {(field) => (
            <field.Input label="Subject" placeholder="What is this about?" />
          )}
        </form.AppField>
        <form.AppField name="message">
          {(field) => (
            <field.Textarea
              label="Message"
              placeholder="Your message"
              rows={5}
            />
          )}
        </form.AppField>
        <form.SubmitButton>Send Message</form.SubmitButton>
      </form.FormCard>
    </form.AppForm>
  )
}
