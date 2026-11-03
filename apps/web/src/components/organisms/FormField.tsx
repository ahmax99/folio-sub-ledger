import { useStore } from '@tanstack/react-form'
import { useEffect, useRef } from 'react'

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

type ServerErrorMap = { fields?: Record<string, unknown> } | undefined

const toErrorItems = (errors: unknown[]): FieldErrorItem[] =>
  errors
    .flat()
    .map((error) =>
      typeof error === 'string' ? { message: error } : (error as FieldErrorItem)
    )

const useFieldErrors = () => {
  const field = useFieldContext()
  const { meta } = field.state
  const pendingServerErrors = useStore(
    field.form.store,
    (state) => (state.errorMap.onServer as ServerErrorMap)?.fields?.[field.name]
  )
  const hasServerError = meta.errorMap.onServer !== undefined

  if (!meta.isValid && (meta.isTouched || hasServerError))
    return toErrorItems(meta.errors)

  return pendingServerErrors ? toErrorItems([pendingServerErrors]) : []
}

const FormField = ({ label, children }: Readonly<FormFieldProps>) => {
  const field = useFieldContext()
  const errors = useFieldErrors()
  const isInvalid = errors.length > 0

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
        {isInvalid && <FieldError errors={errors} />}
      </FieldContent>
    </Field>
  )
}

const FormInput = ({
  label,
  ...props
}: Readonly<ControlProps<typeof Input>>) => {
  const field = useFieldContext<string>()
  const isInvalid = useFieldErrors().length > 0

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

const FormTextarea = ({
  label,
  ...props
}: Readonly<ControlProps<typeof Textarea>>) => {
  const field = useFieldContext<string>()
  const isInvalid = useFieldErrors().length > 0

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

const FormFileInput = ({
  label,
  ...props
}: Readonly<Omit<ControlProps<typeof Input>, 'type'>>) => {
  const field = useFieldContext<File | null>()
  const isInvalid = useFieldErrors().length > 0
  const inputRef = useRef<HTMLInputElement>(null)
  const hasFile = field.state.value !== null

  useEffect(() => {
    if (!hasFile && inputRef.current) inputRef.current.value = ''
  }, [hasFile])

  return (
    <FormField label={label}>
      <Input
        ref={inputRef}
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

export { FormField, FormFileInput, FormInput, FormTextarea }
