import { z } from 'zod'

export const ACCOUNT_TABS = ['profile', 'danger-zone'] as const

export const accountSearchSchema = z.object({
  tab: z.enum(ACCOUNT_TABS).optional().catch(undefined)
})

export type AccountTab = (typeof ACCOUNT_TABS)[number]
