'use client'

import { useNavigate, useRouter } from '@tanstack/react-router'
import { useSelector } from '@tanstack/react-store'
import { useEffect } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/molecules'
import { captureError } from '@/features/error/utils/captureError'
import { PUBLIC_ROUTES } from '@/lib/routes'

import { errorStore } from '../stores/errorStore'

export const ErrorScreenProvider = () => {
  const router = useRouter()
  const navigate = useNavigate()
  const error = useSelector(errorStore, (state) => state.error)
  const { clearError } = errorStore.actions

  useEffect(() => {
    if (error) captureError(error)
  }, [error])

  return (
    <AlertDialog open={!!error}>
      <AlertDialogContent className="flex flex-col items-center">
        <AlertDialogHeader>
          <AlertDialogTitle>Something went wrong</AlertDialogTitle>
          <AlertDialogDescription>{error?.message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              clearError()
              router.invalidate()
            }}
          >
            Try again
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              clearError()
              navigate({ to: PUBLIC_ROUTES.HOME })
            }}
          >
            Go home
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
