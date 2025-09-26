// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // ignore entire folders from test discovery
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/AUTH-E2E/**',   // ← your folder
      '**/tests/**',        // example
      '**/tests-examples/**',        // example
      '**/transfer/**',        // example
    ],
    // (alternative) be explicit about what to include:
    // include: ['src/**/*.test.{js,ts}'],
  },
})
