import { useFieldContext } from '@/lib/formContext'

import { Input } from '../atoms/Input'
import { Textarea } from '../atoms/Textarea'

import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  FieldTitle
} from './Field'

type FieldErrorItem = { message?: string } | undefined

interface FormFieldProps {
  label: string
  children: React.ReactNode
}

type ControlProps<T extends React.ElementType> = Omit<
  React.ComponentProps<T>,
  'id' | 'name' | 'value' | 'onChange' | 'onBlur' | 'aria-invalid'
> & { label: string }

const useFieldInvalid = () => {
  const field = useFieldContext()
  return field.state.meta.isTouched && !field.state.meta.isValid
}

export const FormField = ({ label, children }: Readonly<FormFieldProps>) => {
  const field = useFieldContext()
  const isInvalid = useFieldInvalid()

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel
        className="flex items-center justify-between"
        htmlFor={field.name}
      >
        <FieldTitle>{label}</FieldTitle>
      </FieldLabel>
      <FieldContent>
        {children}
        {isInvalid && (
          <FieldError errors={field.state.meta.errors as FieldErrorItem[]} />
        )}
      </FieldContent>
    </Field>
  )
}

export const FormInput = ({
  label,
  ...props
}: Readonly<ControlProps<typeof Input>>) => {
  const field = useFieldContext<string>()
  const isInvalid = useFieldInvalid()

  return (
    <FormField label={label}>
      <Input
        {...props}
        aria-invalid={isInvalid}
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        value={field.state.value}
      />
    </FormField>
  )
}

export const FormTextarea = ({
  label,
  ...props
}: Readonly<ControlProps<typeof Textarea>>) => {
  const field = useFieldContext<string>()
  const isInvalid = useFieldInvalid()

  return (
    <FormField label={label}>
      <Textarea
        {...props}
        aria-invalid={isInvalid}
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        value={field.state.value}
      />
    </FormField>
  )
}

export const FormFileInput = ({
  label,
  ...props
}: Readonly<Omit<ControlProps<typeof Input>, 'type'>>) => {
  const field = useFieldContext<File | null>()
  const isInvalid = useFieldInvalid()

  return (
    <FormField label={label}>
      <Input
        {...props}
        aria-invalid={isInvalid}
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.files?.[0] ?? null)}
        type="file"
      />
    </FormField>
  )
}
