// Captures README screenshots from the e2e host app (which serves the built
// dist/ via the vite alias) — JPEG so the tarball stays small.
//
// Requires the host app on :5176 (npm run e2e:serve). Output: screenshots/*.jpg
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const PORT = process.env.E2E_PORT || '5176'
const base = `http://localhost:${PORT}`

const SHOTS = [
  { case: 'map/basic', file: 'map-basic' },
  { case: 'marker-popup', file: 'marker-popup' },
  { case: 'controls/minimap', file: 'minimap' },
  { case: 'controls/navigation', file: 'controls' },
  { case: 'draw/all', file: 'draw' },
  { case: 'styles/setstyle', file: 'styles' },
]

// Render settle before every screenshot — let remote tiles stream in. Not a
// replacement for the readiness poll below; isStyleLoaded() is deliberately
// NOT used because erroring/retrying raster tiles flip style state and hang
// that poll.
const RENDER_WAIT = Number(process.env.RENDER_WAIT ?? 10_000)

mkdirSync('screenshots', { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 1000, height: 625 },
  deviceScaleFactor: 2,
})

for (const s of SHOTS) {
  process.stdout.write(`▶ ${s.case} … `)
  await page.goto(`${base}/?case=${s.case}`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => Boolean(window.__MAP__), null, { timeout: 30000 })
  await page.waitForTimeout(RENDER_WAIT)
  await page.screenshot({ path: `screenshots/${s.file}.jpg`, type: 'jpeg', quality: 78 })
  console.log(`screenshots/${s.file}.jpg`)
}

await browser.close()
