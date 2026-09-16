// Controls mount and interact: bundled Minimap + re-exported maplibre controls.
import { test, expect, gotoCase, waitForLog } from '../fixtures/map.js'

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

  // Logo anchors the very bottom-left; the ScaleControl (also bottom-left)
  // must stack ABOVE it — maplibre inserts bottom-corner controls above
  // existing ones, and the logo is added at construction time.
  const logoBox = await page.locator('a.maplibregl-ctrl-logo').boundingBox()
  const scaleBox = await page.locator('.maplibregl-ctrl-scale').boundingBox()
  expect(logoBox).toBeTruthy()
  expect(scaleBox).toBeTruthy()
  expect(scaleBox.y + scaleBox.height).toBeLessThanOrEqual(logoBox.y + 1)

  // Logo is painted from the shipped CSS (SVG background), sized 66x17
  // (react-bkoi-gl visual contract)
  const logoPaint = await page.locator('a.maplibregl-ctrl-logo').evaluate(el => ({
    painted: getComputedStyle(el).backgroundImage !== 'none',
    w: el.offsetWidth,
    h: el.offsetHeight,
  }))
  expect(logoPaint.painted).toBe(true)
  expect(logoPaint.w).toBe(66)
  expect(logoPaint.h).toBe(17)
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

test('controls/minimap: minimap movement syncs back to parent; collapse pauses sync', async ({
  page,
}) => {
  await gotoCase(page, 'controls/minimap')
  await waitForLog(page, 'minimap-load', { timeout: 45_000 })

  // child → parent sync: a move on the minimap follows to the parent (the
  // sync listens to the minimap's 'move' events, whatever caused them).
  await page.evaluate(() => window.__MINIMAP__.map.jumpTo({ center: [91.2, 23.6] }))
  await expect.poll(() => page.evaluate(() => window.__MAP__.getCenter().lng)).toBeCloseTo(91.2, 3)

  // Collapse via the real toggle button → minimized class, sync paused both ways.
  const container = page.locator('.maplibregl-ctrl-minimap')
  const toggle = container.locator('button').first()
  await expect(toggle).toBeVisible()
  await toggle.click()
  await expect(container).toHaveClass(/minimized/)

  const minimapLngBefore = await page.evaluate(() => window.__MINIMAP__.map.getCenter().lng)
  await page.evaluate(() => window.__MAP__.jumpTo({ center: [90.1, 23.1] }))
  // Prove the parent move actually happened, then assert the minimap did NOT
  // follow. A fixed sleep proves nothing about either; waiting on the parent's
  // own settled state makes "no sync while collapsed" a real assertion.
  await expect.poll(() => page.evaluate(() => window.__MAP__.isMoving())).toBe(false)
  await expect.poll(() => page.evaluate(() => window.__MAP__.getCenter().lng)).toBeCloseTo(90.1, 3)
  expect(await page.evaluate(() => window.__MINIMAP__.map.getCenter().lng)).toBe(minimapLngBefore)

  // Expand → sync resumes on the parent's next move.
  await toggle.click()
  await expect(container).not.toHaveClass(/minimized/)
  await page.evaluate(() => window.__MAP__.jumpTo({ center: [90.2, 23.2] }))
  await expect
    .poll(() => page.evaluate(() => window.__MINIMAP__.map.getCenter().lng))
    .toBeCloseTo(90.2, 3)
})

test('controls/attribution-off: attribution hidden, logo still renders', async ({ page }) => {
  await gotoCase(page, 'controls/attribution-off', { branding: false })

  // Attribution control absent; Barikoi logo still there, painted 66x17
  await expect(page.locator('.maplibregl-ctrl-attrib')).toHaveCount(0)
  const logo = page.locator('a.maplibregl-ctrl-logo')
  await expect(logo).toBeVisible()
  const paint = await logo.evaluate(el => ({
    painted: getComputedStyle(el).backgroundImage !== 'none',
    w: el.offsetWidth,
    h: el.offsetHeight,
  }))
  expect(paint.painted).toBe(true)
  expect(paint.w).toBe(66)
  expect(paint.h).toBe(17)
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
