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
  callbackParams: z.union([
    z.object({ error: z.string().min(1) }),
    z.object({ code: z.string().min(1), state: z.string().min(1) })
  ]),
  loginSearch: z.object({
    callbackUrl: z.string().optional().catch(undefined),
    error: z.string().optional().catch(undefined)
  })
}

export type SessionData = z.infer<typeof AuthModel.session>
export type PKCEData = z.infer<typeof AuthModel.pkce>
export type CallbackParams = z.infer<typeof AuthModel.callbackParams>
export type LoginSearch = z.infer<typeof AuthModel.loginSearch>
