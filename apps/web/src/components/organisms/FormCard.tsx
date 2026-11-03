import { useStore } from '@tanstack/react-form'

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
  className?: string
  children: React.ReactNode
}

interface FormCardProps {
  title: string
  description: string
  children: React.ReactNode
}

export const Form = ({ className, children }: Readonly<FormProps>) => {
  const form = useFormContext()

  return (
    <form
      className={cn('space-y-4', className)}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit().catch(() => undefined)
      }}
    >
      {children}
    </form>
  )
}

export const FormCard = ({
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
      <Form>{children}</Form>
    </CardContent>
  </Card>
)

export const FormSubmitButton = ({
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
