// Map lifecycle, style, camera events — README map section.
import { test, expect } from 'playwright/test'
import { gotoCase, waitForLog, waitForCameraStable } from './helpers.js'

const DHAKA = { lng: 90.3938, lat: 23.8216 }

test('map/basic: init, style load, camera events with payload', async ({ page }) => {
  await gotoCase(page, 'map/basic')

  // Canvas rendered with non-zero size
  const canvas = page.locator('canvas')
  await expect(canvas.first()).toBeVisible()
  const box = await canvas.first().boundingBox()
  expect(box.width).toBeGreaterThan(0)
  expect(box.height).toBeGreaterThan(0)

  // Initial camera applied
  const state = await page.evaluate(() => ({
    lng: window.__MAP__.getCenter().lng,
    lat: window.__MAP__.getCenter().lat,
    zoom: window.__MAP__.getZoom(),
  }))
  expect(state.lng).toBeCloseTo(DHAKA.lng, 5)
  expect(state.lat).toBeCloseTo(DHAKA.lat, 5)
  expect(state.zoom).toBeCloseTo(12, 5)

  // load fired exactly once
  const loads = await page.evaluate(() => window.__LOG__.filter(l => l.type === 'load').length)
  expect(loads).toBe(1)

  // Programmatic camera move → move/moveend/zoomend logged, payload has numbers
  await page.evaluate(() => window.__MAP__.setZoom(14))
  const moveends = await waitForLog(page, 'moveend')
  expect(moveends.at(-1).zoom).toBeCloseTo(14, 5)
  expect(typeof moveends.at(-1).center.lng).toBe('number')
  const zoomends = await waitForLog(page, 'zoomend')
  expect(zoomends.at(-1).zoom).toBeCloseTo(14, 5)

  // Style is the Barikoi light style (accessToken appended by the wrapper)
  const styleName = await page.evaluate(() => window.__MAP__.getStyle()?.name)
  expect(styleName, `style: ${styleName}`).toBeTruthy()
})

test('map/basic: drag fires move events until camera stable', async ({ page }) => {
  await gotoCase(page, 'map/basic')
  await waitForCameraStable(page)

  await page.mouse.move(400, 300)
  await page.mouse.down()
  await page.mouse.move(500, 400, { steps: 8 })
  await page.mouse.up()

  const moves = await waitForLog(page, 'move')
  expect(moves.length).toBeGreaterThan(0)
})
