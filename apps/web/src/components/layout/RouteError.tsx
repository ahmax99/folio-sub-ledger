'use client'

import type { ErrorComponentProps } from '@tanstack/react-router'
import { useEffect } from 'react'

import { captureError } from '@/features/error-tracking/utils/captureError'

import { ButtonLink } from '../atoms/ButtonLink'

function RouteError({ error }: Readonly<ErrorComponentProps>) {
  useEffect(() => {
    captureError(error)
  }, [error])

  return (
    <article className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground max-w-md">
        An unexpected error occurred. Please try again.
      </p>
      <ButtonLink reloadDocument to=".">
        Reload page
      </ButtonLink>
    </article>
  )
}

function NotFound() {
  return (
    <article className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <ButtonLink to="/">Go home</ButtonLink>
    </article>
  )
}

export { NotFound, RouteError }
