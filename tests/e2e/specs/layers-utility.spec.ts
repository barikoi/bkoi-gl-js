// README "Custom Layers & Sources" and "Utility Methods" — source/layer
// lifecycle, visibility, querying, map state, resize, interaction handlers.
import { test, expect, gotoCase, waitForLog, waitForCameraStable } from '../fixtures/map.js'

test('layers/sources: GeoJSON source + circle/line/fill layers render and query', async ({
  page,
}) => {
  await gotoCase(page, 'layers/sources')
  await waitForLog(page, 'layers-added')

  // getSource/getLayer presence — the README "Querying Layers" contract
  const present = await page.evaluate(() => ({
    source: Boolean(window.__MAP__.getSource('my-source')),
    circle: Boolean(window.__MAP__.getLayer('my-circle-layer')),
    line: Boolean(window.__MAP__.getLayer('my-line-layer')),
    fill: Boolean(window.__MAP__.getLayer('my-fill-layer')),
  }))
  expect(present).toEqual({ source: true, circle: true, line: true, fill: true })

  // queryRenderedFeatures at the point feature's pixel → our circle layer
  await page.evaluate(() => window.__MAP__.setZoom(14))
  await waitForCameraStable(page)
  const hit = await page.evaluate(() => {
    const map = window.__MAP__
    const point = map.project([90.3938, 23.8216])
    return map
      .queryRenderedFeatures([point.x, point.y])
      .map(f => f.layer.id)
      .filter(id => id.startsWith('my-'))
  })
  expect(hit).toContain('my-circle-layer')

  // Visibility toggling round-trips through getLayoutProperty
  const visibility = await page.evaluate(() => {
    const map = window.__MAP__
    map.setLayoutProperty('my-circle-layer', 'visibility', 'none')
    const hidden = map.getLayoutProperty('my-circle-layer', 'visibility')
    map.setLayoutProperty('my-circle-layer', 'visibility', 'visible')
    const shown = map.getLayoutProperty('my-circle-layer', 'visibility')
    return { hidden, shown }
  })
  expect(visibility).toEqual({ hidden: 'none', shown: 'visible' })

  // Remove layers then source — the README removal order contract: v6
  // silently ignores removeSource while any layer still references the
  // source, so ALL layers must go first.
  const removed = await page.evaluate(
    () =>
      new Promise(resolve => {
        const map = window.__MAP__
        for (const id of ['my-circle-layer', 'my-line-layer', 'my-fill-layer']) {
          if (map.getLayer(id)) map.removeLayer(id)
        }
        map.removeSource('my-source')
        map.triggerRepaint()
        map.once('idle', () => {
          const style = map.getStyle()
          resolve({
            sourceInStyle: Boolean(style.sources['my-source']),
            layerInStyle: (style.layers || []).some(l => l.id === 'my-fill-layer'),
          })
        })
      })
  )
  expect(removed.sourceInStyle).toBe(false)
  expect(removed.layerInStyle).toBe(false)
})

test('utility/state: bounds, maxBounds, projection, world copies, resize', async ({ page }) => {
  await gotoCase(page, 'map/basic')

  const state = await page.evaluate(() => {
    const map = window.__MAP__
    const b = map.getBounds()
    return { west: b.getWest(), south: b.getSouth(), east: b.getEast(), north: b.getNorth() }
  })
  expect(state.west).toBeLessThan(90.3938)
  expect(state.east).toBeGreaterThan(90.3938)

  const maxBounds = await page.evaluate(() => {
    const map = window.__MAP__
    map.setMaxBounds([
      [90.0, 23.5],
      [91.0, 24.5],
    ])
    const b = map.getMaxBounds()
    return b ? [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()] : null
  })
  expect(maxBounds).toEqual([90.0, 23.5, 91.0, 24.5])

  // getProjection() is undefined until a projection is explicitly applied —
  // pair the README's getter example with setProjection (the v6 path)
  const projection = await page.evaluate(() => {
    const map = window.__MAP__
    map.setProjection({ type: 'mercator' })
    return map.getProjection()?.type
  })
  expect(projection).toBe('mercator')

  const worldCopies = await page.evaluate(() => {
    const map = window.__MAP__
    map.setRenderWorldCopies(false)
    const off = map.getRenderWorldCopies()
    map.setRenderWorldCopies(true)
    return { off, on: map.getRenderWorldCopies() }
  })
  expect(worldCopies).toEqual({ off: false, on: true })

  await expect
    .poll(() =>
      page.evaluate(() => (window.__MAP__.resize(), window.__MAP__.getCanvas().width > 0))
    )
    .toBeTruthy()
})

test('utility/handlers: every documented handler exists, disable/enable works', async ({
  page,
}) => {
  await gotoCase(page, 'map/basic')

  // All 8 handlers from the README table exist and toggle without throwing
  const handlers = await page.evaluate(() => {
    const map = window.__MAP__
    const names = [
      'scrollZoom',
      'dragPan',
      'dragRotate',
      'keyboard',
      'doubleClickZoom',
      'touchZoomRotate',
      'touchPitch',
      'boxZoom',
    ]
    const out = {}
    for (const n of names) {
      const h = map[n]
      out[n] = Boolean(h && typeof h.enable === 'function' && typeof h.disable === 'function')
      if (out[n]) {
        h.disable()
        h.enable()
      }
    }
    return out
  })
  expect(handlers).toEqual({
    scrollZoom: true,
    dragPan: true,
    dragRotate: true,
    keyboard: true,
    doubleClickZoom: true,
    touchZoomRotate: true,
    touchPitch: true,
    boxZoom: true,
  })

  // Functional: with scrollZoom disabled, the wheel does not zoom
  const zoomBefore = await page.evaluate(() => window.__MAP__.getZoom())
  await page.evaluate(() => window.__MAP__.scrollZoom.disable())
  await page.mouse.move(400, 300)
  await page.mouse.wheel(0, -600)
  await page.waitForTimeout(700)
  const zoomAfterDisabled = await page.evaluate(() => window.__MAP__.getZoom())
  expect(zoomAfterDisabled).toBeCloseTo(zoomBefore, 5)

  // Re-enabled, the wheel zooms
  await page.evaluate(() => window.__MAP__.scrollZoom.enable())
  await page.mouse.wheel(0, -600)
  await page.waitForTimeout(700)
  const zoomAfterEnabled = await page.evaluate(() => window.__MAP__.getZoom())
  expect(zoomAfterEnabled).toBeGreaterThan(zoomBefore)
})
