import { createRemoteJWKSet, jwtVerify } from 'jose'
import { ResultAsync } from 'neverthrow'

import {
  COGNITO_AUDIENCE,
  COGNITO_ISSUER,
  COGNITO_JWKS_URI
} from '@/constants/index.js'
import { AppError } from '@/error/lib/AppError.js'

const JWKS = createRemoteJWKSet(new URL(COGNITO_JWKS_URI))

export const verifyToken = (token: string) =>
  ResultAsync.fromPromise(
    jwtVerify(token, JWKS, {
      issuer: COGNITO_ISSUER,
      audience: COGNITO_AUDIENCE
    }),
    () => new AppError('UNAUTHORIZED', 'Invalid or expired token')
  ).map(({ payload }) => payload)
