import { z } from 'zod'

export const AuthModel = {
  session: z.object({
    refreshToken: z.string().optional()
  }),
  pkce: z.object({
    codeVerifier: z.string().optional(),
    state: z.string().optional(),
    nonce: z.string().optional(),
    callbackUrl: z.string().optional()
  }),
  callbackParams: z.object({
    code: z.string().optional(),
    state: z.string().optional(),
    error: z.string().optional()
  }),
  loginSearch: z.object({
    callbackUrl: z.string().optional().catch(undefined),
    error: z.string().optional().catch(undefined)
  })
}

export type SessionData = z.infer<typeof AuthModel.session>
export type PKCEData = z.infer<typeof AuthModel.pkce>
export type CallbackParams = z.infer<typeof AuthModel.callbackParams>
export type LoginSearch = z.infer<typeof AuthModel.loginSearch>
