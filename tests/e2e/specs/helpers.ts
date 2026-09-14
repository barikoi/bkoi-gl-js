// Shared e2e helpers. Poll-based waits only — no one-shot event
// registration that can race a condition already true.
import { expect } from 'playwright/test'

const isMapSettled = () => {
  const m = window.__MAP__
  // Tiles deliberately NOT required (a single late tile blocks the gate);
  // downstream assertions retry on their own timeout.
  return Boolean(m && m.isStyleLoaded() && !m.isMoving() && !m.isZooming() && !m.isRotating())
}

// Navigate to a case page and wait until its map settles. Branding contract
// enforced here so every spec inherits it: Barikoi logo + attribution render.
export async function gotoCase(page, id) {
  await page.goto(`/?case=${id}`)
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
  await expect(page.locator('.maplibregl-ctrl-attrib').first()).toBeVisible()
}

/** Wait for ≥1 log entry of `type`; returns all matching entries. */
export async function waitForLog(page, type, { timeout = 15_000 } = {}) {
  await expect
    .poll(() => page.evaluate(t => window.__LOG__.filter(l => l.type === t).length, type), {
      timeout,
    })
    .toBeGreaterThan(0)
  return page.evaluate(t => window.__LOG__.filter(l => l.type === t), type)
}

/** Wait until the camera has been quiet for `ms` (any move restarts the timer). */
export async function waitForCameraStable(page, ms = 600) {
  await page.evaluate(
    delay =>
      new Promise(resolve => {
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
