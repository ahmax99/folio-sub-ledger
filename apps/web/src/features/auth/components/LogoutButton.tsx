import { LogOut } from 'lucide-react'

import { ButtonLink } from '@/components/atoms'

// A full document navigation: the logout route clears HttpOnly cookies and redirects off-site to Cognito.
export const LogoutButton = () => (
  <ButtonLink reloadDocument size="sm" to="/api/auth/logout" variant="outline">
    Sign Out
    <LogOut className="h-4 w-4" />
  </ButtonLink>
)
