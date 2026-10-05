// Formats: UMD script-tag page renders — dist/umd/bkoi-gl.js + the CSS file
// loaded with plain tags, exactly as a non-module consumer would.
import { test, expect } from '../fixtures/map.js'

test('formats/umd: script-tag global renders a working map', async ({ page }) => {
  await page.goto('/umd.html')

  // Global exposed
  const hasGlobal = await page.evaluate(() => Boolean(window.bkoigl?.Map))
  expect(hasGlobal).toBe(true)

  // Map mounts, style loads, canvas renders
  await expect
    .poll(() => page.evaluate(() => Boolean(window.__MAP__)), { timeout: 45_000 })
    .toBeTruthy()
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const m = window.__MAP__
          return Boolean(m && m.isStyleLoaded() && !m.isMoving())
        }),
      { timeout: 45_000 }
    )
    .toBeTruthy()

  const canvas = page.locator('canvas').first()
  await expect(canvas).toBeVisible()
  const box = await canvas.boundingBox()
  expect(box.width).toBeGreaterThan(0)

  // Branding renders (logo visual comes from the shipped CSS — a style
  // resolution failure would remove the anchor's paint)
  await expect(page.locator('a.maplibregl-ctrl-logo[href*="barikoi.com"]').first()).toBeVisible()
  await expect(page.locator('.maplibregl-ctrl-attrib').first()).toBeVisible()

  // No page errors
  const errors = await page.evaluate(() => window.__pageErrors__)
  expect(errors).toEqual([])
})

test('formats/umd: global exposes the documented API; worker asset fetches 200', async ({
  page,
}) => {
  // Capture every Worker construction before any app code runs.
  await page.addInitScript(() => {
    window.__WORKER_URLS__ = []
    const NativeWorker = window.Worker
    window.Worker = class extends NativeWorker {
      constructor(url, opts) {
        window.__WORKER_URLS__.push(String(url))
        super(url, opts)
      }
    }
  })
  await page.goto('/umd.html')

  // UMD global shape — the documented exports exist on window.bkoigl.
  const missing = await page.evaluate(() => {
    const names = [
      'Map',
      'Minimap',
      'NavigationControl',
      'ScaleControl',
      'FullscreenControl',
      'GeolocateControl',
      'Marker',
      'Popup',
      'AttributionControl',
    ]
    return names.filter(n => !(n in window.bkoigl))
  })
  expect(missing, `missing UMD exports: ${missing.join(', ')}`).toEqual([])

  // The registered worker URL actually fetches — a broken worker asset is
  // exactly what silently kills tile parsing.
  await expect
    .poll(() => page.evaluate(() => window.__MAP__ && window.__WORKER_URLS__.length > 0), {
      timeout: 45_000,
    })
    .toBeTruthy()
  const statuses = await page.evaluate(async () => {
    const urls = [...new Set(window.__WORKER_URLS__)]
    const out = []
    for (const u of urls) out.push([u.slice(0, 40), (await fetch(u)).status])
    return out
  })
  expect(statuses.length).toBeGreaterThan(0)
  for (const [url, status] of statuses) expect(`worker ${url} -> ${status}`).toContain('-> 200')
})
