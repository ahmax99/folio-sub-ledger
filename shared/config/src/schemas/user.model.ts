import { z } from 'zod'

import { OrganizationModel } from './organization.model.js'

// An allowlist: the members page needs these four fields and nothing internal.
const memberListItem = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  role: OrganizationModel.role
})

export const UserModel = {
  memberListItem,
  memberList: z.array(memberListItem),
  user: z.object({
    id: z.uuid(),
    orgId: z.uuid(),
    organization: OrganizationModel.organization,
    cognitoSub: z.string(),
    email: z.email(),
    name: z.string(),
    imagePath: z.string().optional(),
    role: OrganizationModel.role,
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
export type MemberListItem = z.infer<typeof UserModel.memberListItem>
export type MemberList = z.infer<typeof UserModel.memberList>
export type UserIdParams = z.infer<typeof UserModel.userIdParams>
export type UpdateUserBody = z.infer<typeof UserModel.updateUserBody>
export type UploadImageQuery = z.infer<typeof UserModel.uploadImageQuery>
