// README "Configuration" section — Map Options table, documented defaults,
// and the Custom Styles drawOptions example. The table is the contract:
// every row with an observable getter is asserted here.
import { test, expect, gotoCase } from '../fixtures/map.js'

const DHAKA = { lng: 90.3938, lat: 23.8216 }

test('config/table-options: documented option values are applied', async ({ page }) => {
  await gotoCase(page, 'config/table-options')

  const state = await page.evaluate(() => {
    const m = window.__MAP__
    const b = m.getMaxBounds()
    return {
      center: m.getCenter(),
      zoom: m.getZoom(),
      bearing: m.getBearing(),
      pitch: m.getPitch(),
      minZoom: m.getMinZoom(),
      maxZoom: m.getMaxZoom(),
      minPitch: m.getMinPitch(),
      maxPitch: m.getMaxPitch(),
      maxBounds: b ? [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()] : null,
      renderWorldCopies: m.getRenderWorldCopies(),
    }
  })

  expect(state.center.lng).toBeCloseTo(DHAKA.lng, 5)
  expect(state.center.lat).toBeCloseTo(DHAKA.lat, 5)
  expect(state.zoom).toBeCloseTo(10, 5)
  expect(state.bearing).toBeCloseTo(30, 5)
  expect(state.pitch).toBeCloseTo(45, 5)
  expect(state.minZoom).toBe(5)
  expect(state.maxZoom).toBe(18)
  expect(state.minPitch).toBe(10)
  expect(state.maxPitch).toBe(60)
  expect(state.maxBounds).toEqual([88.0, 20.5, 92.7, 26.6])
  expect(state.renderWorldCopies).toBe(true)
})

test('config/defaults: bare constructor matches the documented defaults', async ({ page }) => {
  await gotoCase(page, 'config/defaults')

  const state = await page.evaluate(() => {
    const m = window.__MAP__
    return {
      center: m.getCenter(),
      zoom: m.getZoom(),
      bearing: m.getBearing(),
      pitch: m.getPitch(),
      minZoom: m.getMinZoom(),
      maxZoom: m.getMaxZoom(),
      minPitch: m.getMinPitch(),
      maxPitch: m.getMaxPitch(),
      maxBounds: m.getMaxBounds(),
      renderWorldCopies: m.getRenderWorldCopies(),
    }
  })

  // Engine (maplibre v6) defaults passed through by the wrapper — mirrors
  // the README Map Options table's Default column. Effective zoom is
  // viewport-fitted at the low end (canvas taller than one 512px world →
  // engine raises zoom slightly), so a bounded range, not exact 0.
  expect(state.center.lng).toBeCloseTo(0, 5)
  expect(state.center.lat).toBeCloseTo(0, 5)
  expect(state.zoom).toBeGreaterThanOrEqual(0)
  expect(state.zoom).toBeLessThan(2)
  expect(state.bearing).toBeCloseTo(0, 5)
  expect(state.pitch).toBeCloseTo(0, 5)
  expect(state.minZoom).toBe(-2)
  expect(state.maxZoom).toBe(22)
  expect(state.minPitch).toBe(0)
  expect(state.maxPitch).toBe(60)
  expect(state.maxBounds).toBeNull()
  expect(state.renderWorldCopies).toBe(true)

  // Negative zoom is valid in v6: configured default -2. On a canvas larger
  // than one 512px world the viewport-constrained minimum sits ABOVE -1, so
  // setZoom(-1) clamps up to exactly that constrained floor — assert the
  // clamp, which is the real contract.
  const constrainedMin = await page.evaluate(() => window.__MAP__.getMinZoom(true))
  expect(constrainedMin).toBeGreaterThan(-2)
  await page.evaluate(() => window.__MAP__.setZoom(-1))
  const zoomAfter = await page.evaluate(() => window.__MAP__.getZoom())
  expect(zoomAfter).toBeCloseTo(Math.max(-1, constrainedMin), 5)

  // Style default: Barikoi Light via bkoiConfig.DEFAULT_STYLE
  const styleName = await page.evaluate(() => window.__MAP__.getStyle()?.name)
  expect(styleName, `style: ${styleName}`).toBeTruthy()
})

test('config/defaults: projection is set via setProjection, not an option', async ({ page }) => {
  await gotoCase(page, 'config/defaults')

  // v6 has no `projection` MapOption — the style JSON or setProjection()
  // once the style has loaded are the supported paths. gotoCase guarantees
  // a loaded style; poll (not once('style.load')) for the applied projection.
  await page.evaluate(() => {
    window.__MAP__.setProjection({ type: 'globe' })
  })
  const result = await page.evaluate(() => window.__MAP__.getProjection()?.type)
  expect(result).toBe('globe')
})

test('config/draw-custom-styles: README styles array lands as map layers', async ({ page }) => {
  await gotoCase(page, 'config/draw-custom-styles')

  // gl-draw registers its style layers once the map style is available,
  // appending `.cold`/`.hot` suffixes to the configured ids.
  await expect
    .poll(
      () =>
        page.evaluate(
          () => window.__MAP__.getStyle().layers.filter(l => l.id.startsWith('gl-draw-')).length
        ),
      { timeout: 15_000 }
    )
    .toBeGreaterThan(0)
  const ids = await page.evaluate(() =>
    window.__MAP__
      .getStyle()
      .layers.map(l => l.id)
      .filter(id => id.startsWith('gl-draw-'))
      .map(id => id.split('.')[0])
  )
  for (const base of [
    'gl-draw-polygon-fill',
    'gl-draw-polygon-stroke-active',
    'gl-draw-polygon-stroke-static',
    'gl-draw-line-active',
    'gl-draw-line-static',
    'gl-draw-point-active',
    'gl-draw-point-static',
    'gl-draw-vertex',
    'gl-draw-midpoint',
  ]) {
    expect(ids, `missing layer ${base} (got: ${ids.join(', ')})`).toContain(base)
  }
})
