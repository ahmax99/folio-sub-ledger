import { safeRelativePath } from './redirect'

// The BFF route that starts the OIDC flow; only a same-origin callback survives.
export const loginUrl = (callbackUrl?: string) => {
  const safeCallbackUrl = safeRelativePath(callbackUrl)

  return safeCallbackUrl
    ? `/api/auth/login?callbackUrl=${encodeURIComponent(safeCallbackUrl)}`
    : '/api/auth/login'
}
