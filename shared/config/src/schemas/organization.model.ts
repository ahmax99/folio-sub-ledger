import { z } from 'zod'

export const OrganizationModel = {
  role: z.enum(['OWNER', 'ANALYST', 'REVIEWER']),
  organization: z.object({
    id: z.uuid(),
    name: z.string()
  }),
  setupFirmBody: z.object({
    firmName: z
      .string()
      .trim()
      .min(1, 'Firm name is required')
      .max(100, 'Firm name must be at most 100 characters')
  })
}

export type Role = z.infer<typeof OrganizationModel.role>
export type Organization = z.infer<typeof OrganizationModel.organization>
export type SetupFirmBody = z.infer<typeof OrganizationModel.setupFirmBody>
