'use client'

import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import { type ErrorComponentProps, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'

import { captureError } from '@/features/error/utils/captureError'
import { cn } from '@/utils/mergeClass'

import { Button } from '../atoms/Button'
import { ButtonLink } from '../atoms/ButtonLink'

type RouteErrorFill = 'viewport' | 'parent'

// Inside a PageTemplate, a viewport-height error pushes the page past the screen.
const FILL_CLASSES: Record<RouteErrorFill, string> = {
  viewport: 'min-h-[calc(100vh-4rem)] justify-center px-4',
  parent: 'pt-6'
}

type RouteErrorProps = ErrorComponentProps & {
  title?: string
  description?: string
  // Re-run the route's loaders in place instead of reloading the document.
  retry?: boolean
  // 'parent' when rendered inside a PageTemplate, which sets the page's width and padding.
  fill?: RouteErrorFill
}

export const RouteError = ({
  error,
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  retry = false,
  fill = 'viewport'
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
    <article
      className={cn(
        'flex flex-col items-center gap-4 text-center',
        FILL_CLASSES[fill]
      )}
      data-slot="route-error"
    >
      <h1 className="text-3xl font-semibold">{title}</h1>
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
    <h1 className="text-3xl font-semibold">Page not found</h1>
    <ButtonLink to="/">Go home</ButtonLink>
  </article>
)
