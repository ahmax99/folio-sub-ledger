'use client'

import { useEffect } from 'react'

import { safeRelativePath } from '@/features/auth/utils/redirect'

export const OAuth2Start = ({
  callbackUrl
}: Readonly<{ callbackUrl?: string }>) => {
  useEffect(() => {
    const safeCallbackUrl = safeRelativePath(callbackUrl)
    const loginUrl = safeCallbackUrl
      ? `/api/auth/login?callbackUrl=${encodeURIComponent(safeCallbackUrl)}`
      : '/api/auth/login'

    globalThis.location.href = loginUrl
  }, [callbackUrl])

  return null
}
