'use client'

import type { User } from '@shared/config'

import { useAppForm } from '@/lib/form'

import { useAccountActions } from '../hooks/useAccountActions'
import {
  AccountFormModel,
  type UpdateProfileSchema
} from '../schemas/accountForm.schema'

export const AccountForm = ({ user }: Readonly<{ user: User }>) => {
  const { updateProfile } = useAccountActions()
  const defaultValues: UpdateProfileSchema = { name: user.name, image: null }
  const form = useAppForm({
    defaultValues,
    validators: { onChange: AccountFormModel.updateProfile },
    onSubmit: async ({ value, formApi }) => {
      await updateProfile.mutateAsync(value)
      formApi.reset()
    }
  })

  return (
    <form.AppForm>
      <form.FormCard
        description="Update your profile information"
        title="Update Profile"
      >
        <form.AppField name="name">
          {(field) => (
            <field.Input label="Name" placeholder="Enter your name" />
          )}
        </form.AppField>
        <form.AppField name="image">
          {(field) => (
            <field.FileInput accept="image/*" label="Profile Picture" />
          )}
        </form.AppField>
        <form.SubmitButton>Update Profile</form.SubmitButton>
      </form.FormCard>
    </form.AppForm>
  )
}
