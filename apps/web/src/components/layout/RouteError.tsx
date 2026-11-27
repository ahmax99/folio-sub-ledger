'use client'

import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import { type ErrorComponentProps, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'

import { captureError } from '@/features/error/utils/captureError'

import { Button } from '../atoms/Button'
import { ButtonLink } from '../atoms/ButtonLink'

type RouteErrorProps = ErrorComponentProps & {
  title?: string
  description?: string
  // Re-run the route's loaders in place instead of reloading the document.
  retry?: boolean
}

export const RouteError = ({
  error,
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  retry = false
}: Readonly<RouteErrorProps>) => {
  const router = useRouter()
  const queryErrorResetBoundary = useQueryErrorResetBoundary()

  useEffect(() => {
    captureError(error)
  }, [error])

  useEffect(() => {
    queryErrorResetBoundary.reset()
  }, [queryErrorResetBoundary])

  return (
    <article className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-muted-foreground max-w-md">{description}</p>
      {retry ? (
        <Button onClick={() => router.invalidate()}>Retry</Button>
      ) : (
        <ButtonLink reloadDocument to=".">
          Reload page
        </ButtonLink>
      )}
    </article>
  )
}

export const NotFound = () => (
  <article className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 px-4 text-center">
    <h1 className="text-2xl font-semibold">Page not found</h1>
    <ButtonLink to="/">Go home</ButtonLink>
  </article>
)
