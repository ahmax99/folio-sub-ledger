import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { redact } from '@tanstack/redact/vite'

import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'microphone=(), camera=(), geolocation=()'
}

export default defineConfig(({ command }) => ({
  server: { port: 3000 },
  resolve: { tsconfigPaths: true },
  ...(command === 'build' && { ssr: { noExternal: true } }),
  // Maps without a sourceMappingURL comment: deploy uploads them to Sentry and never to the public bucket.
  build: { sourcemap: 'hidden' },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart({ srcDirectory: 'src' }),
    viteReact(),
    svgr(),
    babel({ presets: [reactCompilerPreset()] }),
    redact({ features: { activity: false, fragmentRefs: false } }),
    nitro({
      preset: 'bun',
      routeRules: { '/**': { headers: SECURITY_HEADERS } }
    })
  ]
}))
