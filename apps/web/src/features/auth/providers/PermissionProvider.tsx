'use client'

import { createMongoAbility, type RawRuleOf } from '@casl/ability'
import { AbilityProvider as CaslAbilityProvider } from '@casl/react'

import type { AppAbility } from '@/lib/casl'

export const AbilityProvider = ({
  rules,
  children
}: Readonly<{
  rules: RawRuleOf<AppAbility>[]
  children: React.ReactNode
}>) => (
  <CaslAbilityProvider value={createMongoAbility<AppAbility>(rules)}>
    {children}
  </CaslAbilityProvider>
)
