'use client'

import { ActionButton } from '@/components/organisms'

import { useAccountActions } from '../hooks/useAccountActions'

export const DeleteAccountButton = () => {
  const { deleteAccount } = useAccountActions()

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
