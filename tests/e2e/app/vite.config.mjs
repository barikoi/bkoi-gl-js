import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath } from 'node:url'

// Serves the e2e host app. `bkoi-gl` resolves to the BUILT package in dist/ —
// e2e verifies the publish artifact, not the sources (those are covered by the
// unit/browser suites). Run `npm run build` first; `npm run e2e` chains it.
export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') }
  const apiKey = env.BARIKOI_API_KEY || env.BARIKOI_ACCESS_TOKEN || env.API_KEY
  if (!apiKey) {
    throw new Error(
      'Missing API key: set BARIKOI_API_KEY (or BARIKOI_ACCESS_TOKEN) in .env — see env.example'
    )
  }
  return {
    // Serve dist/ at the site root so umd.html can script-tag /umd/bkoi-gl.js
    // with its sibling worker files resolving naturally.
    publicDir: fileURLToPath(new URL('../../../dist', import.meta.url)),
    define: {
      'import.meta.env.BARIKOI_API_KEY': JSON.stringify(apiKey),
      'import.meta.env.BARIKOI_ACCESS_TOKEN': JSON.stringify(apiKey),
      'import.meta.env.API_KEY': JSON.stringify(apiKey),
    },
    resolve: {
      alias: [
        {
          find: /^bkoi-gl\/style\.css$/,
          replacement: new URL('../../../dist/style/bkoi-gl.css', import.meta.url).pathname,
        },
        {
          find: /^bkoi-gl$/,
          replacement: new URL('../../../dist/index.js', import.meta.url).pathname,
        },
      ],
    },
  }
})
