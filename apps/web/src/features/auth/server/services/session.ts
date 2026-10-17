import '@tanstack/react-start/server-only'
import { getCookie, getCookies, setCookie } from '@tanstack/react-start/server'

import {
  type CookieJar,
  getIronSession,
  type SessionOptions
} from 'iron-session'

import { PKCE_CONFIG, SESSION_CONFIG } from '../../constants/session'
import type { PKCEData, SessionData } from '../../schemas/auth.schema'

// Reads the incoming request's cookies and queues Set-Cookie on the current response.
const requestCookieJar: CookieJar = {
  read: (name) => getCookie(name),
  write: (name, value, options) =>
    setCookie(name, value, options as Parameters<typeof setCookie>[2]),
  names: () => Object.keys(getCookies())
}

const openSession = <T extends object>(config: SessionOptions) =>
  getIronSession<T>(requestCookieJar, config)

export const getSession = async () => openSession<SessionData>(SESSION_CONFIG)

export const setSessionData = async (data: SessionData) => {
  const session = await getSession()
  Object.assign(session, data)
  await session.save()
}

export const getSessionData = async () => {
  const session = await getSession()
  return {
    refreshToken: session.refreshToken
  }
}

export const destroySession = async () => {
  const session = await getSession()
  session.destroy()
}

const getPKCESession = async () => openSession<PKCEData>(PKCE_CONFIG)

export const setPKCEData = async (data: PKCEData) => {
  const session = await getPKCESession()
  Object.assign(session, data)
  await session.save()
}

export const getPKCEData = async () => {
  const session = await getPKCESession()
  return {
    codeVerifier: session.codeVerifier,
    state: session.state,
    nonce: session.nonce,
    callbackUrl: session.callbackUrl
  }
}

export const destroyPKCESession = async () => {
  const session = await getPKCESession()
  session.destroy()
}
