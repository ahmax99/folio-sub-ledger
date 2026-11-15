import { getFormData } from '@tanstack/react-form-start'
import { createFileRoute } from '@tanstack/react-router'

import { PageTemplate } from '@/components/layout'
import { ContactForm } from '@/features/mailing/components/ContactForm'
import { generatePageMetadata } from '@/features/metadata/utils/generatePageMetadata'

const ContactPage = () => (
  <PageTemplate alignment="center">
    <ContactForm serverState={Route.useLoaderData()} />
  </PageTemplate>
)

export const Route = createFileRoute('/_main/contact')({
  loader: () => getFormData(),
  head: () =>
    generatePageMetadata({
      title: 'Contact',
      description: 'Get in touch with us'
    }),
  component: ContactPage
})
