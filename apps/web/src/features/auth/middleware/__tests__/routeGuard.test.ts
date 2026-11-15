import { getCookie } from '@tanstack/react-start/server'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { routeGuardMiddleware } from '../routeGuard'

vi.mock('@tanstack/react-start/server', () => ({ getCookie: vi.fn() }))

type GuardArgs = {
  pathname: string
  handlerType: 'router' | 'server'
  next: () => unknown
}

const runGuard = (pathname: string, handlerType: GuardArgs['handlerType']) => {
  const next = vi.fn(() => 'next')
  const server = (
    routeGuardMiddleware as unknown as {
      options: { server: (args: GuardArgs) => unknown }
    }
  ).options.server

  return { result: server({ pathname, handlerType, next }), next }
}

describe('routeGuardMiddleware', () => {
  beforeEach(() => {
    vi.mocked(getCookie).mockReset()
  })

  it('redirects a signed-out visitor from a protected path to login', () => {
    const { result, next } = runGuard('/account', 'router')

    expect(result).toBeInstanceOf(Response)
    expect((result as Response).status).toBe(307)
    expect((result as Response).headers.get('Location')).toBe(
      '/auth/login?callbackUrl=%2Faccount'
    )
    expect(next).not.toHaveBeenCalled()
  })

  it.each(['/setup', '/firm'])(
    'redirects a signed-out visitor from %s to login',
    (path) => {
      const { result, next } = runGuard(path, 'router')

      expect(result).toBeInstanceOf(Response)
      expect((result as Response).headers.get('Location')).toBe(
        `/auth/login?callbackUrl=${encodeURIComponent(path)}`
      )
      expect(next).not.toHaveBeenCalled()
    }
  )

  it('lets a visitor with a session onto a protected path', () => {
    vi.mocked(getCookie).mockReturnValue('cookie')
    const { result, next } = runGuard('/account', 'router')

    expect(result).toBe('next')
    expect(next).toHaveBeenCalledOnce()
  })

  it('lets a signed-out visitor onto a public path', () => {
    const { result, next } = runGuard('/contact', 'router')

    expect(result).toBe('next')
    expect(next).toHaveBeenCalledOnce()
  })

  it('sends a signed-in visitor away from the login page', () => {
    vi.mocked(getCookie).mockReturnValue('cookie')
    const { result } = runGuard('/auth/login', 'router')

    expect((result as Response).status).toBe(307)
    expect((result as Response).headers.get('Location')).toBe('/')
  })

  it('does not guard server functions and server routes', () => {
    const { result, next } = runGuard('/account', 'server')

    expect(result).toBe('next')
    expect(next).toHaveBeenCalledOnce()
  })
})
