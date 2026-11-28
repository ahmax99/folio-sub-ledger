import { type AnyFormApi, useStore } from '@tanstack/react-form'
import { useHydrated } from '@tanstack/react-router'
import { useEffect } from 'react'

import { ResultAsync } from 'neverthrow'

import { mapToAppError } from '@/features/error/lib/mapToAppError'
import { useFormContext } from '@/lib/formContext'
import { cn } from '@/utils/mergeClass'

import { Button } from '../atoms/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../molecules/Card'
import { LoadingSwap } from '../molecules/LoadingSwap'

interface FormProps {
  action?: string
  className?: string
  children: React.ReactNode
}

interface FormCardProps {
  action?: string
  title: string
  description: string
  children: React.ReactNode
}

const Form = ({ action, className, children }: Readonly<FormProps>) => {
  const form = useFormContext()
  const isHydrated = useHydrated()

  useEffect(() => {
    const anyForm: AnyFormApi = form
    const { onServer } = anyForm.state.errorMap
    if (!onServer) return

    anyForm.setErrorMap({ onServer })
    for (const name of Object.keys(anyForm.state.fieldMeta))
      anyForm.setFieldMeta(name, (meta) => ({ ...meta, isTouched: true }))
  }, [form])

  return (
    <form
      action={action}
      className={cn('flex flex-col gap-4', className)}
      encType={action ? 'multipart/form-data' : undefined}
      method={action ? 'post' : undefined}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        ResultAsync.fromPromise(form.handleSubmit(), mapToAppError).orTee(
          ({ fields }) => fields && form.setErrorMap({ onServer: { fields } })
        )
      }}
    >
      {/* No action: a pre-hydration submit would GET the values into the URL. */}
      <fieldset className="contents" disabled={!action && !isHydrated}>
        {children}
      </fieldset>
    </form>
  )
}

const FormCard = ({
  action,
  title,
  description,
  children
}: Readonly<FormCardProps>) => (
  <Card className="w-full sm:max-w-96">
    <CardHeader className="text-2xl font-bold">
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>

    <CardContent>
      <Form action={action}>{children}</Form>
    </CardContent>
  </Card>
)

const FormSubmitButton = ({
  children
}: Readonly<{ children: React.ReactNode }>) => {
  const form = useFormContext()
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting)

  return (
    <Button className="w-full" disabled={isSubmitting} type="submit">
      <LoadingSwap isLoading={isSubmitting}>{children}</LoadingSwap>
    </Button>
  )
}

export { Form, FormCard, FormSubmitButton }
