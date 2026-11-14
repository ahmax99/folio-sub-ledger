import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    setupFiles: ['./src/test/setup.ts'],
    env: {
      AWS_REGION: 'ap-northeast-1',
      BACKEND_INTERNAL_URL: 'http://backend.test/api/v1',
      BASE_URL: 'http://app.test',
      COGNITO_CLIENT_ID: 'test-client',
      COGNITO_DOMAIN: 'test-domain',
      COGNITO_USERPOOL_ID: 'ap-northeast-1_test',
      CONTACT_TO_EMAIL: 'owner@example.com',
      FROM_EMAIL: 'noreply@example.com',
      NODE_ENV: 'production',
      RESEND_API_KEY: 'test-resend-key',
      SENTRY_DSN: '',
      SESSION_SECRET: 'test-session-secret-at-least-32-characters'
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: ['src/**/*.test.ts']
        }
      },
      {
        extends: true,
        test: {
          name: 'dom',
          environment: 'jsdom',
          include: ['src/**/*.test.tsx'],
          env: { NODE_ENV: 'development' },
          setupFiles: ['./src/test/setup.dom.ts']
        }
      }
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: [
        'src/test/**',
        '**/*.test.{ts,tsx}',
        'src/routeTree.gen.ts',
        'src/routes/**',
        'src/client.tsx',
        'src/server.ts',
        'src/start.ts',
        'src/router.tsx',
        'src/instrument.*.ts'
      ],
      reporter: ['text', 'text-summary', 'lcov']
    }
  }
})
