'use client'

import { useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'

export const OAuth2Callback = () => {
  const { searchStr } = useLocation()

  useEffect(() => {
    globalThis.location.href = `/api/auth/callback${searchStr}`
  }, [searchStr])

  return null
}
