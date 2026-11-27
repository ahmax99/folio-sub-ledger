import { env } from '@/config/env.js'

export const SIGNED_URL_EXPIRATION = 3600 // 1 hour
export const IMAGE_CACHE_MAX_AGE = 31_536_000 // 1 year
// A credential rotation reaches warm Lambdas within this long.
export const DATABASE_PASSWORD_TTL_MS = 5 * 60_000 // 5 minutes

export const COGNITO_ISSUER = `https://cognito-idp.${env.AWS_REGION}.amazonaws.com/${env.COGNITO_USERPOOL_ID}`
export const COGNITO_JWKS_URI = `${COGNITO_ISSUER}/.well-known/jwks.json`
export const COGNITO_AUDIENCE = env.COGNITO_CLIENT_ID
