import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import { toast } from 'sonner'

import { PUBLIC_ROUTES } from '@/features/auth/lib/routes'

import type { ContactFormSchema } from '../../schemas/contactForm.schema'
import { sendContactEmail } from '../../server/api/sendContactEmail'

const useContactActions = () => {
  const navigate = useNavigate()

  const sendContact = useMutation({
    mutationFn: (data: ContactFormSchema) => sendContactEmail({ data }),
    onSuccess: async () => {
      toast.success('Message sent successfully')
      await navigate({ to: PUBLIC_ROUTES.HOME })
    }
  })

  return { sendContact }
}

export { useContactActions }
