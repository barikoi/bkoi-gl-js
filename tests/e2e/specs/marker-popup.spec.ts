// Markers & Popups — README "Markers & Popups" section.
import { test, expect } from 'playwright/test'
import { gotoCase } from './helpers.js'

test('marker-popup: marker renders and popup opens', async ({ page }) => {
  await gotoCase(page, 'marker-popup')

  await expect(page.locator('.maplibregl-marker').first()).toBeVisible()
  await expect(page.locator('.maplibregl-popup').first()).toBeVisible()
  await expect(page.locator('.maplibregl-popup-content')).toContainText('Location')
})
