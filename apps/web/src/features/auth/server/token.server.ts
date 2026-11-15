import { getRequest } from '@tanstack/react-start/server'

import { refreshTokenGrant } from 'openid-client'

import { logger } from '@/config/logger.server'
import { AppError } from '@/features/error/lib/AppError'

import { getOIDCClient } from './cognito.server'
import { getSession } from './session.server'

const log = logger.child({ module: 'token' })

interface Tokens {
  idToken?: string
  accessToken: string
}

const refreshTokens = async (): Promise<Tokens> => {
  const [session, config] = await Promise.all([getSession(), getOIDCClient()])

  if (!session.refreshToken) {
    log.warn('Token refresh failed: no refresh token')
    throw new AppError('UNAUTHORIZED')
  }

  const tokens = await refreshTokenGrant(config, session.refreshToken)

  return {
    idToken: tokens.id_token,
    accessToken: tokens.access_token
  }
}

// One Cognito refresh per incoming request: a handler that makes several
// backend calls shares the same ID token. Keyed weakly, so it ends with the request.
const tokensByRequest = new WeakMap<Request, Promise<Tokens>>()

export const getTokens = () => {
  const request = getRequest()
  const cached = tokensByRequest.get(request)
  if (cached) return cached

  const tokens = refreshTokens()
  tokensByRequest.set(request, tokens)
  // A failed refresh must not be reused by a retry in the same request.
  tokens.catch(() => tokensByRequest.delete(request))

  return tokens
}
