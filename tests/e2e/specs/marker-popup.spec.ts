// Markers & Popups — README "Markers & Popups" section.
import { test, expect, gotoCase } from '../fixtures/map.js'

test('marker-popup: marker renders and popup opens', async ({ page }) => {
  await gotoCase(page, 'markers/popup')

  await expect(page.locator('.maplibregl-marker').first()).toBeVisible()
  await expect(page.locator('.maplibregl-popup').first()).toBeVisible()
  await expect(page.locator('.maplibregl-popup-content')).toContainText('Location')
})
