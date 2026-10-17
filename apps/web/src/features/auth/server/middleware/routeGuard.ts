import { createMiddleware } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'

import { redirectResponse } from '@/lib/redirectResponse'

import {
  PROTECTED_ROUTES,
  PUBLIC_AUTH_ROUTES,
  PUBLIC_ROUTES
} from '../../lib/routes'

const protectedPaths = Object.values(PROTECTED_ROUTES)

const isProtectedPath = (pathname: string) =>
  protectedPaths.some((path) => pathname.startsWith(path))

// Presence-only edge guard for full page loads; client-side navigations are gated by the _authorized layout's beforeLoad.
export const routeGuardMiddleware = createMiddleware({
  type: 'request'
}).server(({ pathname, next, handlerType }) => {
  if (handlerType !== 'router') return next()

  // in-flight PKCE state lives in the separate auth_pkce cookie, so presence here always means a real session. Don't merge the two cookies back together.
  const isAuthenticated = !!getCookie('auth_session')

  if (!isAuthenticated && isProtectedPath(pathname))
    return redirectResponse(
      `${PUBLIC_AUTH_ROUTES.LOGIN}?callbackUrl=${encodeURIComponent(pathname)}`
    )

  if (isAuthenticated && pathname === PUBLIC_AUTH_ROUTES.LOGIN)
    return redirectResponse(PUBLIC_ROUTES.HOME)

  return next()
})
