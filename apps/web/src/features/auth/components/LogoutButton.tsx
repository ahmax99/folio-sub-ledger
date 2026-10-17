import { LogOut } from 'lucide-react'

import { ButtonLink } from '@/components/atoms'

export const LogoutButton = () => (
  <ButtonLink reloadDocument size="sm" to="/api/auth/logout" variant="outline">
    Sign Out
    <LogOut className="h-4 w-4" />
  </ButtonLink>
)
