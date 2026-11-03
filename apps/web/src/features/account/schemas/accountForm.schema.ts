import { z } from 'zod'

export const AccountFormModel = {
  updateProfile: z.object({
    name: z.string().min(1, 'Name is required'),
    image: z.instanceof(File).nullable()
  })
}

export type UpdateProfileSchema = z.infer<typeof AccountFormModel.updateProfile>
