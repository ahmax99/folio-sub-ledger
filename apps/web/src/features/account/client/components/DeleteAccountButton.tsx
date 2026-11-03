'use client'

import { ActionButton } from '@/components/organisms'

import { useDeleteAccount } from '../hooks/useAccountMutations'

export const DeleteAccountButton = () => {
  const deleteAccount = useDeleteAccount()

  return (
    <ActionButton
      action={() => deleteAccount.mutate()}
      isPending={deleteAccount.isPending}
      requireAreYouSure
      variant="destructive"
    >
      Delete Account Permanently
    </ActionButton>
  )
}
