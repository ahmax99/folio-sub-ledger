// Not a secret: it exists only on the dedicated test database.
export const RUNTIME_TEST_PASSWORD = 'runtime-test-only'
export const RUNTIME_ROLE = 'folio_runtime_a'

// The test database URL, logged in as the runtime role like the deployed API.
export const runtimeDatabaseUrl = (testDatabaseUrl: string) => {
  const url = new URL(testDatabaseUrl)
  url.username = RUNTIME_ROLE
  url.password = RUNTIME_TEST_PASSWORD
  return url.toString()
}
