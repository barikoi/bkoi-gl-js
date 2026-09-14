// Formats: UMD script-tag page renders — dist/umd/bkoi-gl.js + the CSS file
// loaded with plain tags, exactly as a non-module consumer would.
import { test, expect } from 'playwright/test'

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
