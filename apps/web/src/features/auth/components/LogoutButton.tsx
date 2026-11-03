import { LogOut } from 'lucide-react'

import { ButtonLink } from '@/components/atoms'

export const LogoutButton = () => (
  <ButtonLink
    aria-label="Sign Out"
    className="shrink-0"
    reloadDocument
    size="sm"
    to="/api/auth/logout"
    variant="outline"
  >
    <span className="hidden sm:inline">Sign Out</span>
    <LogOut className="h-4 w-4" />
  </ButtonLink>
)
