import { createFileRoute } from '@tanstack/react-router'

import { PageTemplate } from '@/components/layout'
import {
  ContactForm,
  type FieldConfig
} from '@/features/mailing/client/components/ContactForm'
import { generatePageMetadata } from '@/features/metadata/utils/generatePageMetadata'

const ContactPage = () => {
  const contactFormConfig = {
    title: 'Contact Us',
    description: 'Get in touch with us',
    submitLabel: 'Send Message',
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: ''
    },
    fields: [
      {
        name: 'name' as FieldConfig['name'],
        label: 'Name',
        description: 'Your full name'
      },
      {
        name: 'email' as FieldConfig['name'],
        label: 'Email',
        description: 'Your email address'
      },
      {
        name: 'subject' as FieldConfig['name'],
        label: 'Subject',
        description: 'What is this about?'
      },
      {
        name: 'message' as FieldConfig['name'],
        label: 'Message',
        description: 'Your message'
      }
    ]
  }

  return (
    <PageTemplate alignment="center">
      <ContactForm config={contactFormConfig} />
    </PageTemplate>
  )
}

export const Route = createFileRoute('/_main/contact')({
  head: () =>
    generatePageMetadata({
      title: 'Contact',
      description: 'Get in touch with us'
    }),
  component: ContactPage
})
