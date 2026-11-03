'use client'

import { useAppForm } from '@/lib/form'

import {
  ContactFormModel,
  type ContactFormSchema
} from '../../schemas/contactForm.schema'
import { useSendContact } from '../hooks/useSendContact'

const defaultValues: ContactFormSchema = {
  name: '',
  email: '',
  subject: '',
  message: ''
}

export const ContactForm = () => {
  const sendContact = useSendContact()
  const form = useAppForm({
    defaultValues,
    validators: { onChange: ContactFormModel.contact },
    onSubmit: async ({ value }) => {
      await sendContact.mutateAsync(value)
    }
  })

  return (
    <form.AppForm>
      <form.FormCard description="Get in touch with us" title="Contact Us">
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
