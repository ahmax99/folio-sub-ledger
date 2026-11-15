'use client'

import { useLocation, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'

import { createMongoAbility, type RawRuleOf } from '@casl/ability'
import { AbilityProvider as CaslAbilityProvider } from '@casl/react'
import { toast } from 'sonner'

import type { AppAbility } from '@/lib/casl'

export const AbilityProvider = ({
  rules,
  children
}: Readonly<{
  rules: RawRuleOf<AppAbility>[]
  children: React.ReactNode
}>) => {
  const ability = createMongoAbility<AppAbility>(rules)
  const router = useRouter()
  const { pathname, searchStr } = useLocation()
  const error = new URLSearchParams(searchStr).get('error')

  useEffect(() => {
    if (!error) return

    toast.error(error)

    const params = new URLSearchParams(searchStr)
    params.delete('error')
    const query = params.size ? `?${params}` : ''

    router.history.replace(`${pathname}${query}`)
  }, [error, pathname, router, searchStr])

  return <CaslAbilityProvider value={ability}>{children}</CaslAbilityProvider>
}
