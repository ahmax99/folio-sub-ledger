export const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'Sign-in was cancelled.',
  invalid_state: 'Your sign-in session expired. Please try again.',
  missing_verifier:
    'Your sign-in session was lost. Check that cookies are enabled, then try again.',
  missing_nonce:
    'Your sign-in session was lost. Check that cookies are enabled, then try again.',
  invalid_token: 'We could not verify your sign-in.',
  invalid_callback: 'The sign-in response was not valid.'
}

export const DEFAULT_LOGIN_ERROR_MESSAGE =
  'Something went wrong while signing you in.'
