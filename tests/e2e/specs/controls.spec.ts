// Controls mount and interact: bundled Minimap + re-exported maplibre controls.
import { test, expect } from 'playwright/test'
import { gotoCase, waitForLog } from './helpers.js'

test('controls/navigation: navigation + scale controls mount and work', async ({ page }) => {
  await gotoCase(page, 'controls/navigation')

  // NavigationControl buttons render
  const zoomIn = page.locator('.maplibregl-ctrl-zoom-in')
  await expect(zoomIn).toBeVisible()
  await expect(page.locator('.maplibregl-ctrl-zoom-out')).toBeVisible()
  await expect(page.locator('.maplibregl-ctrl-compass')).toBeVisible()

  // ScaleControl renders with content
  await expect(page.locator('.maplibregl-ctrl-scale')).toBeVisible()
  const scale = await page.locator('.maplibregl-ctrl-scale').textContent()
  expect(scale?.trim().length).toBeGreaterThan(0)

  // Clicking zoom-in actually moves the camera
  const before = await page.evaluate(() => window.__MAP__.getZoom())
  await zoomIn.click()
  await expect.poll(() => page.evaluate(() => window.__MAP__.getZoom())).toBeGreaterThan(before)
})

test('controls/minimap: renders and syncs with parent map', async ({ page }) => {
  await gotoCase(page, 'controls/minimap')

  // Minimap mounts its own canvas inside the control container
  const minimap = page.locator('.maplibregl-ctrl-minimap, .bkoi-minimap-container').first()
  await expect(minimap).toBeVisible()
  await expect(minimap.locator('canvas').first()).toBeVisible()

  // Wait for the minimap's own load (logged by the case) before moving the
  // parent — polling isStyleLoaded() is unreliable with remote tiles.
  await waitForLog(page, 'minimap-load', { timeout: 45_000 })

  // Move the parent map — minimap camera follows (parent → minimap sync)
  await page.evaluate(() => window.__MAP__.jumpTo({ center: [91.0, 23.5] }))
  await expect
    .poll(() => page.evaluate(() => window.__MINIMAP__?.map?.getCenter()?.lng ?? null))
    .toBeCloseTo(91.0, 3)
})

test('controls/navigation: fullscreen + geolocate controls mount and interact', async ({
  page,
}) => {
  await page.context().grantPermissions(['geolocation'])
  await page.context().setGeolocation({ longitude: 90.3938, latitude: 23.8216 })
  await gotoCase(page, 'controls/navigation')

  const fullscreen = page.locator('.maplibregl-ctrl-fullscreen')
  await expect(fullscreen).toBeVisible()

  const geolocate = page.locator('.maplibregl-ctrl-geolocate')
  await expect(geolocate).toBeVisible()

  // Clicking geolocate with granted permission must not throw.
  await geolocate.click()
  const errors = await page.evaluate(() => window.__pageErrors__)
  expect(errors).toEqual([])
})
