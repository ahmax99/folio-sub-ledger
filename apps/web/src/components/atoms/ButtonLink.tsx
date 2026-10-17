'use client'

import { Link, type LinkComponentProps } from '@tanstack/react-router'

import type { VariantProps } from 'class-variance-authority'

import { cn } from '@/utils/mergeClass'

import { LoadingSwap } from '../molecules/LoadingSwap'

import { Button } from './Button'
import type { buttonVariants } from './Button.variants'

function ButtonLink({
  variant = 'default',
  size = 'default',
  className,
  disabled,
  isLoading = false,
  children,
  ...props
}: Omit<LinkComponentProps, 'children'> &
  VariantProps<typeof buttonVariants> & {
    children?: React.ReactNode
    disabled?: boolean
    isLoading?: boolean
  }) {
  return (
    <Button
      aria-disabled={disabled ?? isLoading}
      className={cn(
        (disabled ?? isLoading) && 'cursor-not-allowed opacity-50',
        className
      )}
      nativeButton={false}
      onClick={(e) => (disabled ?? isLoading) && e.preventDefault()}
      render={<Link {...props} />}
      size={size}
      variant={variant}
    >
      <LoadingSwap
        className="inline-flex items-center gap-2"
        isLoading={isLoading}
      >
        {children}
      </LoadingSwap>
    </Button>
  )
}

export { ButtonLink }
