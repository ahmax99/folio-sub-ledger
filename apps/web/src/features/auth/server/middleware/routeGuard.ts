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

export const routeGuardMiddleware = createMiddleware({
  type: 'request'
}).server(({ pathname, next, handlerType }) => {
  if (handlerType !== 'router') return next()

  const isAuthenticated = !!getCookie('auth_session')

  if (!isAuthenticated && isProtectedPath(pathname))
    return redirectResponse(
      `${PUBLIC_AUTH_ROUTES.LOGIN}?callbackUrl=${encodeURIComponent(pathname)}`
    )

  if (isAuthenticated && pathname === PUBLIC_AUTH_ROUTES.LOGIN)
    return redirectResponse(PUBLIC_ROUTES.HOME)

  return next()
})
