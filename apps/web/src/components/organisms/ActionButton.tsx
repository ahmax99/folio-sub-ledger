'use client'

import type { Button as ButtonPrimitive } from '@base-ui/react/button'
import type { VariantProps } from 'class-variance-authority'

import { Button } from '../atoms/Button'
import type { buttonVariants } from '../atoms/Button.variants'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '../molecules/AlertDialog'
import { LoadingSwap } from '../molecules/LoadingSwap'

interface ActionButtonProps
  extends
    Omit<ButtonPrimitive.Props, 'children'>,
    VariantProps<typeof buttonVariants> {
  action: () => void
  isPending?: boolean
  requireAreYouSure?: boolean
  areYouSureDescription?: React.ReactNode
  children?: React.ReactNode
}

const ActionButton = ({
  action,
  isPending = false,
  requireAreYouSure = false,
  areYouSureDescription = 'This action cannot be undone.',
  variant,
  size,
  disabled,
  onClick,
  children,
  ...props
}: Readonly<ActionButtonProps>) => {
  if (requireAreYouSure)
    return (
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button
              disabled={disabled}
              size={size}
              variant={variant}
              {...props}
            >
              {children}
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {areYouSureDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isPending} onClick={action}>
              <LoadingSwap isLoading={isPending}>Yes</LoadingSwap>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )

  return (
    <Button
      disabled={disabled ?? isPending}
      onClick={(e) => {
        action()
        onClick?.(e)
      }}
      size={size}
      variant={variant}
      {...props}
    >
      <LoadingSwap
        className="inline-flex items-center gap-2"
        isLoading={isPending}
      >
        {children}
      </LoadingSwap>
    </Button>
  )
}

export { ActionButton }
