import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import { PROTECTED_ROUTES } from '@/features/auth/lib/routes'

import { setupFirm } from '../api'

export const useOrganizationActions = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const createFirm = useMutation({
    mutationFn: setupFirm,
    onSuccess: async () => {
      await queryClient.invalidateQueries()
      await navigate({ to: PROTECTED_ROUTES.FIRM_HOME, replace: true })
    }
  })

  return { createFirm }
}
