import { createFormHookContexts } from '@tanstack/react-form'

// Lives apart from form.ts so field components can read it without a cycle.
export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()
