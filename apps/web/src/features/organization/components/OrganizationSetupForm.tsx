import { OrganizationModel, type SetupOrganizationBody } from '@shared/config'

import { useAppForm } from '@/lib/form'

import { useOrganizationActions } from '../hooks/useOrganizationActions'

const OrganizationSetupForm = () => {
  const { createOrganization } = useOrganizationActions()
  const defaultValues: SetupOrganizationBody = { name: '' }
  const form = useAppForm({
    defaultValues,
    validators: { onChange: OrganizationModel.setupOrganizationBody },
    onSubmit: async ({ value }) => {
      await createOrganization.mutateAsync(value)
    },
    onSubmitInvalid: () =>
      setTimeout(() => document.getElementById('name')?.focus())
  })

  return (
    <form.AppForm>
      <form.FormCard
        description="You will be the Owner of this firm and can invite your team later."
        title="Set up your firm"
      >
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <form.AppField name="name">
              {(field) => (
                <field.Input
                  autoFocus
                  disabled={isSubmitting}
                  label="Firm name"
                  placeholder="Enter your firm's name"
                />
              )}
            </form.AppField>
          )}
        </form.Subscribe>
        <form.SubmitButton>Create firm</form.SubmitButton>
      </form.FormCard>
    </form.AppForm>
  )
}

export { OrganizationSetupForm }
