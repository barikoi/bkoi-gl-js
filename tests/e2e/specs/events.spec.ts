// Documented event payload contract — every event the README documents must
// fire with its promised key fields. Table-driven: REQUIRED maps event type →
// fields that must exist on the logged payload.
import { test, expect, gotoCase, waitForLog } from '../fixtures/map.js'

const REQUIRED = {
  load: [],
  move: ['type'],
  moveend: ['center', 'zoom'],
  zoomend: ['zoom'],
  click: ['lngLat', 'point'],
  'draw.create': ['features', 'geometry'],
}

test('events/contract: camera events carry their documented payloads', async ({ page }) => {
  await gotoCase(page, 'events/contract')

  // Programmatic camera move exercises move / moveend / zoomend.
  await page.evaluate(() => window.__MAP__.jumpTo({ center: [91.0, 23.5], zoom: 13 }))

  const moves = await waitForLog(page, 'move')
  expect(moves.length).toBeGreaterThan(0)
  for (const key of REQUIRED.move) {
    for (const entry of moves) expect(entry, `move payload missing "${key}"`).toHaveProperty(key)
  }

  const moveend = (await waitForLog(page, 'moveend')).at(-1)
  for (const key of REQUIRED.moveend) expect(moveend).toHaveProperty(key)
  expect(moveend.center.lng).toBeCloseTo(91.0, 3)
  expect(moveend.center.lat).toBeCloseTo(23.5, 3)
  expect(moveend.zoom).toBeCloseTo(13, 1)

  const zoomend = (await waitForLog(page, 'zoomend')).at(-1)
  for (const key of REQUIRED.zoomend) expect(zoomend).toHaveProperty(key)
  expect(zoomend.zoom).toBeCloseTo(13, 1)
})

test('events/contract: click payload has lngLat and point', async ({ page }) => {
  await gotoCase(page, 'events/contract')

  // A real canvas click at viewport center — native canvas components only
  // respond to real pointer events, not synthetic dispatch.
  const box = await page.locator('canvas').first().boundingBox()
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)

  const click = (await waitForLog(page, 'click')).at(-1)
  for (const key of REQUIRED.click) expect(click).toHaveProperty(key)
  // Canvas center == map center (DHAKA).
  expect(click.lngLat[0]).toBeCloseTo(90.3938, 2)
  expect(click.lngLat[1]).toBeCloseTo(23.8216, 2)
  expect(Number.isFinite(click.point[0])).toBe(true)
  expect(Number.isFinite(click.point[1])).toBe(true)
})

test('events/contract: draw.create payload carries GeoJSON features', async ({ page }) => {
  await gotoCase(page, 'events/contract')

  // Point tool: a single real click completes the feature — no dblclick race.
  const tool = page.locator('.mapbox-gl-draw_point')
  await tool.click()
  await expect(tool).toHaveClass(/active/)

  const box = await page.locator('canvas').first().boundingBox()
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)

  const create = (await waitForLog(page, 'draw.create')).at(-1)
  for (const key of REQUIRED['draw.create']) expect(create).toHaveProperty(key)
  expect(create.features).toBe(1)
  expect(create.geometry).toBe('Point')
})
