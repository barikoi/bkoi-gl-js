// Draw: toolbar renders, polygon mode activates, drawing a polygon fires
// draw.create. Mirrors react-bkoi-gl's hard-won draw pitfalls: async mode
// switch, doubleClickZoom stealing the finishing dblclick.
import { test, expect, gotoCase, waitForLog } from '../fixtures/map.js'

// maplibre-gl-draw connects lazily; its cold source is the concrete
// readiness signal — same gate as the browser-mode spec.
async function drawReady(page) {
  await expect
    .poll(() => page.evaluate(() => Boolean(window.__MAP__?.getSource('mapbox-gl-draw-cold'))), {
      timeout: 20_000,
    })
    .toBeTruthy()
}

// Click a draw tool and WAIT for it to activate — a canvas click landing
// before the mode switch creates a feature in the previous mode.
async function activateTool(page, tool) {
  const btn = page.locator(tool)
  await btn.click()
  await expect(btn).toHaveClass(/active/)
}

test('draw/tools: polygon draw end-to-end via toolbar', async ({ page }) => {
  await gotoCase(page, 'draw/tools')
  await drawReady(page)

  // Toolbar renders with default tools
  await expect(page.locator('.mapbox-gl-draw_polygon')).toBeVisible()
  await expect(page.locator('.mapbox-gl-draw_point')).toBeVisible()
  await expect(page.locator('.mapbox-gl-draw_trash')).toBeVisible()

  // The finishing dblclick is also seen by doubleClickZoom — disable it.
  await page.evaluate(() => window.__MAP__.doubleClickZoom.disable())

  await activateTool(page, '.mapbox-gl-draw_polygon')

  // Draw a triangle around viewport center
  const box = await page.locator('canvas').first().boundingBox()
  const cx = box.x + box.width / 2
  const cy = box.y + box.height / 2
  for (const [x, y] of [
    [cx - 100, cy - 100],
    [cx + 100, cy - 100],
    [cx, cy + 100],
  ]) {
    await page.mouse.click(x, y)
  }
  await page.mouse.dblclick(cx, cy + 100)

  // draw.create fired with exactly one feature
  const creates = await waitForLog(page, 'draw.create')
  expect(creates.at(-1).features).toBe(1)

  // Feature present in the draw sources (draw instance is private on
  // BkoiGlMap — the sources are the public surface). After create, draw
  // auto-selects the feature: selected features render into the HOT source,
  // unselected into COLD — assert the combined store, polled past the
  // hot/cold render transition.
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const count = async id => {
          const source = window.__MAP__.getSource(id)
          return source ? (await source.getData()).features.length : 0
        }
        return (await count('mapbox-gl-draw-cold')) + (await count('mapbox-gl-draw-hot'))
      })
    )
    .toBeGreaterThan(0)
})

test('draw/tools: API-driven add / changeMode / trash with event payloads', async ({ page }) => {
  await gotoCase(page, 'draw/tools')
  await drawReady(page)

  // 1. add() — feature lands in the draw store and renders into the draw
  // sources (hot/cold routing is a draw-internal detail; the combined count
  // proves it renders). The source update only happens on a render frame,
  // so nudge one — the map is idle after load.
  const id = await page.evaluate(() => {
    const ids = window.__MAP__.draw.add({
      type: 'Feature',
      properties: { name: 'api-polygon' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [90.38, 23.81],
            [90.4, 23.81],
            [90.4, 23.83],
            [90.38, 23.81],
          ],
        ],
      },
    })
    window.__MAP__.triggerRepaint()
    window.__DRAW_ID__ = ids[0]
    return ids[0]
  })
  expect(id).toBeTruthy()
  await expect.poll(() => page.evaluate(() => window.__MAP__.draw.getAll().features.length)).toBe(1)
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const count = async sourceId => {
          const source = window.__MAP__.getSource(sourceId)
          return source ? (await source.getData()).features.length : 0
        }
        return (await count('mapbox-gl-draw-cold')) + (await count('mapbox-gl-draw-hot'))
      })
    )
    .toBe(1)

  // 2. modechange fires on the real UI path (toolbar click). The public
  // api.changeMode is deliberately silent — documented draw behavior.
  const tool = page.locator('.mapbox-gl-draw_polygon')
  await tool.click()
  const modechange = (await waitForLog(page, 'draw.modechange')).at(-1)
  expect(modechange.mode).toBe('draw_polygon')

  // 3. changeMode → simple_select with the feature selected (selectionchange
  // fires from the mode setup's non-silent setSelected).
  await page.evaluate(() =>
    window.__MAP__.draw.changeMode('simple_select', { featureIds: [window.__DRAW_ID__] })
  )
  const selection = (await waitForLog(page, 'draw.selectionchange')).at(-1)
  expect(selection.features).toBe(1)

  // 4. trash() with an active selection → draw.delete payload + store emptied
  await page.evaluate(() => window.__MAP__.draw.trash())
  const deleted = (await waitForLog(page, 'draw.delete')).at(-1)
  expect(deleted.features).toBe(1)
  await expect.poll(() => page.evaluate(() => window.__MAP__.draw.getAll().features.length)).toBe(0)
})
