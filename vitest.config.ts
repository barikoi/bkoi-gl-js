import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

const root = fileURLToPath(new URL('./', import.meta.url))

export default defineConfig({
  test: {
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary'],
      reportsDirectory: 'coverage',
      include: ['src/**/*.{js,ts}'],
      exclude: ['src/**/*.d.ts', 'src/types/**'],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
    projects: [
      {
        // Unit tests: pure modules + mocked maplibre-gl, jsdom.
        // The mock exists to drive every wrapper branch deterministically;
        // real rendering is covered by the browser project.
        test: {
          name: 'unit',
          globals: true,
          environment: 'jsdom',
          setupFiles: ['tests/unit/setup.js'],
          include: ['tests/unit/**/*.test.{js,ts}'],
          exclude: ['tests/browser/**'],
        },
        resolve: {
          alias: [
            { find: /^bkoi-gl$/, replacement: `${root}/src/index.ts` },
            { find: /^maplibre-gl$/, replacement: `${root}/tests/unit/mocks/maplibre-gl.js` },
            {
              find: /^maplibre-gl-draw$/,
              replacement: `${root}/tests/unit/mocks/maplibre-gl-draw.js`,
            },
          ],
        },
      },
      {
        // Browser tests: real maplibre-gl in headless Chromium (Playwright)
        test: {
          name: 'browser',
          include: ['tests/browser/**/*.spec.{js,ts}'],
          setupFiles: ['tests/browser/setup.ts'],
          testTimeout: 30_000,
          fileParallelism: false,
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium', headless: true }],
          },
        },
        resolve: {
          alias: [
            { find: /^bkoi-gl$/, replacement: `${root}/src/index.ts` },
            { find: /^bkoi-gl\/style.css$/, replacement: `${root}/dist/style/bkoi-gl.css` },
          ],
        },
      },
    ],
  },
})
