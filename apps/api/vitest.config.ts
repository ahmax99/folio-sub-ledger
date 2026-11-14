import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'node',
    globalSetup: ['./src/test/globalSetup.ts'],
    setupFiles: ['./src/test/setup.ts'],
    fileParallelism: false,
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: [
        'src/test/**',
        '**/__tests__/**',
        'src/index.ts',
        'src/config/secrets.ts'
      ],
      reporter: ['text', 'text-summary', 'lcov']
    },
    env: {
      AWS_REGION: 'us-east-1',
      BACKEND_PORT: '0',
      COGNITO_USERPOOL_ID: 'us-east-1_test',
      COGNITO_CLIENT_ID: 'test-client',
      FRONTEND_URL: 'http://localhost:3000',
      NODE_ENV: 'production',
      S3_BUCKET_NAME: 'test-bucket',
      SENTRY_DSN: 'https://public@sentry.example.com/1'
    }
  }
})
