import { createFormHook } from '@tanstack/react-form'

import {
  Form,
  FormCard,
  FormFileInput,
  FormInput,
  FormSubmitButton,
  FormTextarea
} from '@/components/organisms'

import { fieldContext, formContext } from './formContext'

export const { useAppForm } = createFormHook({
  fieldComponents: {
    Input: FormInput,
    Textarea: FormTextarea,
    FileInput: FormFileInput
  },
  formComponents: {
    Form,
    FormCard,
    SubmitButton: FormSubmitButton
  },
  fieldContext,
  formContext
})
