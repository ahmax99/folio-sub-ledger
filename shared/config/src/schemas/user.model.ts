import { z } from 'zod'

import { OrganizationModel } from './organization.model.js'

export const UserModel = {
  user: z.object({
    id: z.uuid(),
    orgId: z.uuid(),
    organization: OrganizationModel.organization,
    cognitoSub: z.string(),
    email: z.email(),
    name: z.string(),
    imagePath: z.string().optional(),
    role: OrganizationModel.role,
    groups: z.array(z.string()),
    createdAt: z.date(),
    updatedAt: z.date()
  }),
  userIdParams: z.object({
    id: z.uuid()
  }),
  updateUserBody: z.object({
    name: z.string().optional(),
    imagePath: z.string().optional()
  }),
  uploadImageQuery: z.object({
    filename: z.preprocess(
      (val) => (Array.isArray(val) ? val.join('') : val),
      z.string().min(1).max(255)
    ),
    contentType: z.preprocess(
      (val) => (Array.isArray(val) ? val[0] : val),
      z.string().regex(/^image\//)
    )
  })
}

export type User = z.infer<typeof UserModel.user>
export type UserIdParams = z.infer<typeof UserModel.userIdParams>
export type UpdateUserBody = z.infer<typeof UserModel.updateUserBody>
export type UploadImageQuery = z.infer<typeof UserModel.uploadImageQuery>
