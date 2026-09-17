// README "Camera Methods" — every documented method driven on a live map,
// final camera state asserted after each transition.
import type { Page } from 'playwright/test'
import { test, expect, gotoCase, waitForCameraStable } from '../fixtures/map.js'

const TARGET = { lng: 90.39, lat: 23.82 }

type Cam = { center: { lng: number; lat: number }; zoom: number; bearing: number; pitch: number }

const camera = (page: Page) =>
  page.evaluate(() => {
    const m = window.__MAP__
    return {
      center: m.getCenter(),
      zoom: m.getZoom(),
      bearing: m.getBearing(),
      pitch: m.getPitch(),
    }
  }) as Promise<Cam>

async function until(page: Page, pred: (cam: Cam) => boolean, { timeout = 20_000 } = {}) {
  let cam = await camera(page)
  const t0 = Date.now()
  while (!pred(cam)) {
    if (Date.now() - t0 > timeout)
      throw new Error(`camera never satisfied pred; got ${JSON.stringify(cam)}`)
    await page.waitForTimeout(150)
    cam = await camera(page)
  }
  return cam
}

test('camera/api: jumpTo, panTo, zoom/rotation/pitch setters apply immediately', async ({
  page,
}) => {
  await gotoCase(page, 'map/basic')

  // Indication UI (ported from react-bkoi-gl): top-left live camera panel
  const panel = page.locator('[data-testid="camera-readout"]')
  await expect(panel).toBeVisible()
  await expect(panel).toContainText(/zoom \d+/)

  await page.evaluate(() =>
    window.__MAP__.jumpTo({ center: [90.39, 23.82], zoom: 14, bearing: 0, pitch: 0 })
  )
  const state = await camera(page)
  expect(state.center.lng).toBeCloseTo(TARGET.lng, 5)
  expect(state.center.lat).toBeCloseTo(TARGET.lat, 5)
  expect(state.zoom).toBeCloseTo(14, 5)

  await page.evaluate(() => window.__MAP__.panTo([90.4, 23.82], { duration: 300 }))
  await until(page, cam => Math.abs(cam.center.lng - 90.4) < 1e-5)

  await page.evaluate(() => window.__MAP__.setZoom(14))
  expect((await camera(page)).zoom).toBeCloseTo(14, 5)

  await page.evaluate(() => window.__MAP__.setBearing(45))
  expect((await camera(page)).bearing).toBeCloseTo(45, 5)

  await page.evaluate(() => window.__MAP__.setPitch(45))
  expect((await camera(page)).pitch).toBeCloseTo(45, 5)
})

test('camera/api: flyTo, easeTo, zoomTo/zoomIn/zoomOut, rotateTo, resetNorth animate to target', async ({
  page,
}) => {
  await gotoCase(page, 'map/basic')

  await page.evaluate(() =>
    window.__MAP__.flyTo({ center: [90.39, 23.82], zoom: 14, bearing: 0, pitch: 0, speed: 3 })
  )
  let state = await until(page, cam => Math.abs(cam.zoom - 14) < 1e-3)
  expect(state.center.lng).toBeCloseTo(TARGET.lng, 4)
  expect(state.center.lat).toBeCloseTo(TARGET.lat, 4)

  await page.evaluate(() =>
    window.__MAP__.easeTo({
      center: [90.39, 23.82],
      zoom: 14,
      bearing: 45,
      pitch: 30,
      duration: 500,
    })
  )
  state = await until(
    page,
    cam => Math.abs(cam.bearing - 45) < 1e-3 && Math.abs(cam.pitch - 30) < 1e-3
  )
  expect(state.zoom).toBeCloseTo(14, 3)

  await page.evaluate(() => window.__MAP__.zoomTo(15, { duration: 300 }))
  await until(page, cam => Math.abs(cam.zoom - 15) < 1e-3)

  await page.evaluate(() => window.__MAP__.zoomIn({ duration: 300 }))
  await until(page, cam => Math.abs(cam.zoom - 16) < 1e-3)

  await page.evaluate(() => window.__MAP__.zoomOut({ duration: 300 }))
  await until(page, cam => Math.abs(cam.zoom - 15) < 1e-3)

  await page.evaluate(() => window.__MAP__.rotateTo(90, { duration: 300 }))
  await until(page, cam => Math.abs(cam.bearing - 90) < 1e-3)

  await page.evaluate(() => window.__MAP__.resetNorth({ duration: 300 }))
  await until(page, cam => Math.abs(cam.bearing) < 1e-3)
})

test('camera/api: fitBounds frames the box; getCameraState getters return live values', async ({
  page,
}) => {
  await gotoCase(page, 'map/basic')

  await page.evaluate(() =>
    window.__MAP__.fitBounds(
      [
        [90.3, 23.7],
        [90.5, 23.9],
      ],
      { padding: 50, duration: 500 }
    )
  )
  const state = await until(page, cam => cam.zoom > 8 && Math.abs(cam.center.lng - 90.4) < 0.05)
  expect(state.center.lat).toBeGreaterThan(23.7)
  expect(state.center.lat).toBeLessThan(23.9)
  await waitForCameraStable(page)

  const snap = await page.evaluate(() => {
    const m = window.__MAP__
    const b = m.getBounds()
    return {
      center: m.getCenter(),
      zoom: m.getZoom(),
      bearing: m.getBearing(),
      pitch: m.getPitch(),
      bounds: [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()],
    }
  })
  expect(typeof snap.zoom).toBe('number')
  expect(typeof snap.bearing).toBe('number')
  expect(typeof snap.pitch).toBe('number')
  expect(snap.bounds.every(v => typeof v === 'number' && Number.isFinite(v))).toBe(true)
  // The fitted bounds contain the requested box (padded outward).
  expect(snap.bounds[0]).toBeLessThanOrEqual(90.3)
  expect(snap.bounds[2]).toBeGreaterThanOrEqual(90.5)
})
