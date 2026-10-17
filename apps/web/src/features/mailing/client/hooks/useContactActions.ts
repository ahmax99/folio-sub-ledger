import { useNavigate } from '@tanstack/react-router'

import { toast } from 'sonner'

import { PUBLIC_ROUTES } from '@/features/auth/lib/routes'
import { useErrorHandler } from '@/features/error/client/hooks/useErrorHandler'
import { handleClientAuthError } from '@/features/error/client/lib/handleError'

import type { ContactFormSchema } from '../../schemas/contactForm.schema'
import { sendContactEmail } from '../../server/api/sendContactEmail'

export const useContactActions = () => {
  const navigate = useNavigate()
  const handleError = useErrorHandler()

  const handleSendContact = (data: ContactFormSchema) =>
    handleClientAuthError(sendContactEmail({ data }), handleError, () => {
      toast.success('Message sent successfully')
      navigate({ to: PUBLIC_ROUTES.HOME })
    })

  return { handleSendContact }
}
