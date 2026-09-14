// Draw: toolbar renders, polygon mode activates, drawing a polygon fires
// draw.create. Mirrors react-bkoi-gl's hard-won draw pitfalls: async mode
// switch, doubleClickZoom stealing the finishing dblclick.
import { test, expect } from 'playwright/test'
import { gotoCase, waitForLog } from './helpers.js'

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

test('draw/all: polygon draw end-to-end', async ({ page }) => {
  await gotoCase(page, 'draw/all')
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

  // Feature present in the draw cold source (draw instance is private on
  // BkoiGlMap — the source is the public surface)
  const data = await page.evaluate(() => window.__MAP__.getSource('mapbox-gl-draw-cold').getData())
  expect(data.features.length).toBeGreaterThan(0)
})
