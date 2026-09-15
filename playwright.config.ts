// Playwright e2e — runs against the BUILT package (dist/); `npm run e2e`
// chains the build. Mirrors react-bkoi-gl's proven shape: sequential workers
// (one WebGL map per page), 60s ceiling for remote tiles + headless WebGL.
import { defineConfig } from 'playwright/test'

export default defineConfig({
  testDir: './tests/e2e/specs',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5176',
    viewport: null,
    launchOptions: { args: ['--start-maximized'] },
    trace: 'retain-on-failure',
  },
  webServer: {
    // Regenerate the README manifest first: `playwright test` invoked directly
    // (not via `npm run e2e`) must never serve a stale or missing manifest.
    command:
      'node scripts/extract-readme-examples.mjs && npx vite tests/e2e/app --port 5176 --strictPort',
    url: 'http://localhost:5176',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    stdout: 'pipe',
  },
})
