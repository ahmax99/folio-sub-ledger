import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import type { SetupOrganizationBody } from '@shared/config'

import { PROTECTED_ROUTES } from '@/lib/routes'

import { setupOrganization } from '../organization.functions'

export const useOrganizationActions = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const createOrganization = useMutation({
    mutationFn: (data: SetupOrganizationBody) => setupOrganization({ data }),
    onSuccess: async () => {
      await queryClient.invalidateQueries()
      await navigate({ to: PROTECTED_ROUTES.ORGANIZATION_HOME, replace: true })
    }
  })

  return { createOrganization }
}
