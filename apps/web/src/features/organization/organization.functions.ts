import { createServerFn } from '@tanstack/react-start'

import { OrganizationModel } from '@shared/config'

import { handleApiError } from '@/features/error/lib/handleApiError'
import { catchAsyncError } from '@/features/error/utils/catchError'

import * as organizationApi from './server/organization.server'

export const setupOrganization = createServerFn({ method: 'POST' })
  .validator(OrganizationModel.setupOrganizationBody)
  .handler(async ({ data }) =>
    handleApiError(catchAsyncError(organizationApi.setupOrganization(data)))
  )
