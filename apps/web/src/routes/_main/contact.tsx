import { createFileRoute } from '@tanstack/react-router'

import { PageTemplate } from '@/components/layout'
import { ContactForm } from '@/features/mailing/client/components/ContactForm'
import { generatePageMetadata } from '@/features/metadata/utils/generatePageMetadata'

const ContactPage = () => (
  <PageTemplate alignment="center">
    <ContactForm />
  </PageTemplate>
)

export const Route = createFileRoute('/_main/contact')({
  head: () =>
    generatePageMetadata({
      title: 'Contact',
      description: 'Get in touch with us'
    }),
  component: ContactPage
})
