import { OrganizationModel, type SetupFirmBody } from '@shared/config'

import { useAppForm } from '@/lib/form'

import { useOrganizationActions } from '../hooks/useOrganizationActions'

const FirmSetupForm = () => {
  const { createFirm } = useOrganizationActions()
  const defaultValues: SetupFirmBody = { firmName: '' }
  const form = useAppForm({
    defaultValues,
    validators: { onChange: OrganizationModel.setupFirmBody },
    onSubmit: async ({ value }) => {
      await createFirm.mutateAsync(value)
    },
    onSubmitInvalid: () =>
      setTimeout(() => document.getElementById('firmName')?.focus())
  })

  return (
    <form.AppForm>
      <form.FormCard
        description="You will be the Owner of this firm and can invite your team later."
        title="Set up your firm"
      >
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <form.AppField name="firmName">
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

export { FirmSetupForm }
