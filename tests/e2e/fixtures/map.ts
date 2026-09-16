// Page-object fixtures shared by all e2e specs. Poll-based waits only —
// no one-shot event registration that can race a condition already true.
//
// Ported from react-bkoi-gl's tests/e2e/fixtures/map.ts: the bottom-center HUD
// is mounted HERE (spec side), not in app code, so every spec gets identical
// UI and a headed `npx playwright test --headed` run shows the pill too.
import { test as base, expect, type Page, type TestInfo } from 'playwright/test'

// Headed runs hold each finished test on screen so a human can review whether
// rendering looks right. Headless: no-op.
const REVIEW_HOLD_MS = 10_000

// CLI `--headed` never lands in testInfo.project.use (probed in the reference
// repo: identical with and without the flag) — but fixtures run in the
// runner's Node process, so the flag is in process.argv.
const isHeadedRun = (testInfo: TestInfo) =>
  (testInfo.project.use as { headless?: boolean }).headless === false ||
  process.argv.includes('--headed')

/** Bottom-center status pill shared by every spec: "Rendering · <case>". */
async function mountHud(page: Page) {
  if (page.isClosed()) return
  await page.evaluate(() => {
    // Re-label rather than early-return: the pill persists across a test's
    // navigations, so a stale label from the previous case would be shown.
    const name =
      document.querySelector('.case-page-title')?.textContent?.trim() ||
      new URLSearchParams(location.search).get('case') ||
      ''
    let el = document.getElementById('e2e-hud')
    if (!el) {
      el = document.createElement('div')
      el.id = 'e2e-hud'
      el.innerHTML =
        '<span class="dot"></span><span class="label"></span><span class="hold"></span>'
      document.body.appendChild(el)
    }
    const label = el.querySelector('.label') as HTMLElement
    label.textContent = `Rendering · ${name}`
  })
}

/** Headed-only hold: progress bar drains, then the bar clears.
 *  Timer-driven, not requestAnimationFrame — Chromium freezes rAF for
 *  occluded/backgrounded windows, so an rAF drain never resolves and the
 *  window sits there until it is closed by hand. */
async function holdForReview(page: Page, testInfo: TestInfo) {
  if (!isHeadedRun(testInfo) || page.isClosed()) return
  if (!page.url() || page.url() === 'about:blank') return
  try {
    await mountHud(page)
    await page.evaluate(ms => {
      const el = document.getElementById('e2e-hud')
      const hold = el?.querySelector('.hold') as HTMLElement | null
      if (!hold) return
      hold.innerHTML = '<span class="bar"><i></i></span>'
      const bar = hold.querySelector('.bar i') as HTMLElement | null
      if (bar) bar.style.width = '100%'
      const t0 = performance.now()
      return new Promise<void>(resolve => {
        const id = setInterval(() => {
          const left = Math.max(0, ms - (performance.now() - t0))
          if (bar) bar.style.width = `${(left / ms) * 100}%`
          if (left <= 0) {
            clearInterval(id)
            resolve()
          }
        }, 100)
      }).then(() => {
        const h = el?.querySelector('.hold') as HTMLElement | null
        if (h) h.innerHTML = ''
      })
    }, REVIEW_HOLD_MS)
  } catch {
    // The hold is a cosmetic review aid — a destroyed context (renderer
    // reload, navigation) must never fail the test.
  }
}

// The hold is a LAZY page-fixture wrapper (not an auto fixture and not
// test.afterEach): it only instantiates the page when the test depends on it,
// runs after the test body, and applies to every spec file — module-level
// hooks in a shared module attach only to the first importing file.
export const test = base.extend({
  page: async ({ page: basePage }, use, testInfo) => {
    await use(basePage)
    await holdForReview(basePage, testInfo)
  },
})

export { expect }

const isMapSettled = () => {
  const m = window.__MAP__
  // Tiles deliberately NOT required separately — maplibre v6 folds tile
  // completeness into isStyleLoaded() (Style#loaded → TileManager#loaded →
  // every in-view tile loaded/errored; verified in react-bkoi-gl's fixtures).
  // A separate areTilesLoaded() gate would re-introduce the single-late-tile
  // flake without adding coverage. Pixel-paint verification (white canvas)
  // is the review runner's job (per-case screenshots).
  return Boolean(m && m.isStyleLoaded() && !m.isMoving() && !m.isZooming() && !m.isRotating())
}

// Navigate to a case page and wait until its map settles. Branding contract
// enforced here so every spec inherits it: Barikoi logo + attribution render.
// `branding: false` opts out for cases that deliberately hide the attribution
// (controls/attribution-off — the logo alone is still expected).
export async function gotoCase(page: Page, id: string, { branding = true } = {}) {
  await page.goto(`/?case=${id}`)
  await mountHud(page)
  await expect
    .poll(() => page.evaluate(() => Boolean(window.__MAP__)), { timeout: 45_000 })
    .toBeTruthy()
  await expect.poll(() => page.evaluate(isMapSettled), { timeout: 45_000 }).toBeTruthy()

  // Settle can be true before the case's `load` handler ran (isStyleLoaded()
  // flips earlier). Every case logs `load` at the top of that handler, then
  // adds its controls/markers synchronously — waiting on the log guarantees
  // the on-load setup is in the DOM.
  await waitForLog(page, 'load', { timeout: 45_000 })

  await expect(page.locator('a.maplibregl-ctrl-logo[href*="barikoi.com"]').first()).toBeVisible()
  if (branding) {
    await expect(page.locator('.maplibregl-ctrl-attrib').first()).toBeVisible()
  }
}

/** Wait for ≥1 log entry of `type`; returns all matching entries. */
export async function waitForLog(page: Page, type: string, { timeout = 15_000 } = {}) {
  await expect
    .poll(() => page.evaluate(t => window.__LOG__.filter(l => l.type === t).length, type), {
      timeout,
    })
    .toBeGreaterThan(0)
  return page.evaluate(t => window.__LOG__.filter(l => l.type === t), type)
}

/** Wait until the camera has been quiet for `ms` (any move restarts the timer). */
export async function waitForCameraStable(page: Page, ms = 600) {
  await page.evaluate(
    delay =>
      new Promise<void>(resolve => {
        const map = window.__MAP__
        let timer = setTimeout(done, delay)
        function done() {
          map.off('move', onMove)
          resolve()
        }
        function onMove() {
          clearTimeout(timer)
          timer = setTimeout(done, delay)
        }
        map.on('move', onMove)
      }),
    ms
  )
}
