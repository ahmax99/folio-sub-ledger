import { getRequest } from '@tanstack/react-start/server'

import { refreshTokenGrant } from 'openid-client'

import { logger } from '@/config/logger.server'
import { AppError } from '@/features/error/lib/AppError'

import { getOIDCClient } from './cognito.server'
import { destroySession, getSession, setSessionData } from './session.server'

const log = logger.child({ module: 'token' })

interface Tokens {
  idToken?: string
  accessToken: string
}

const isInvalidGrant = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'error' in error &&
  error.error === 'invalid_grant'

const refreshTokens = async (): Promise<Tokens> => {
  const [session, config] = await Promise.all([getSession(), getOIDCClient()])

  if (!session.refreshToken) {
    log.warn('Token refresh failed: no refresh token')
    throw new AppError('UNAUTHORIZED')
  }

  const tokens = await refreshTokenGrant(config, session.refreshToken).catch(
    async (error: unknown) => {
      if (!isInvalidGrant(error)) throw error
      // Revoked, expired or rotated away: the cookie can never work again.
      log.warn('Token refresh failed: refresh token rejected')
      await destroySession()
      throw new AppError('UNAUTHORIZED')
    }
  )
  // With rotation on, Cognito invalidates the old refresh token.
  if (tokens.refresh_token && tokens.refresh_token !== session.refreshToken)
    await setSessionData({ refreshToken: tokens.refresh_token })

  return {
    idToken: tokens.id_token,
    accessToken: tokens.access_token
  }
}

// One Cognito refresh per request, shared by all its backend calls.
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
