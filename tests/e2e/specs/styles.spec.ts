// setStyle chain: Barikoi → Barikoi → custom URL. Each hop must fire
// style.load and the Barikoi attribution must survive the style swap — the
// attribution ships as customAttribution, which maplibre re-applies on every
// styledata rebuild (a plain innerHTML injection is wiped by setStyle).
import { test, expect, gotoCase } from '../fixtures/map.js'

const BARIKOI_DARK = 'https://map.barikoi.com/styles/barikoi-dark/style.json'
const DEMOTILES = 'https://demotiles.maplibre.org/style.json'

async function expectBarikoiBranding(page) {
  const inner = page.locator('.maplibregl-ctrl-attrib-inner').first()
  await expect(inner).toBeVisible()
  // Exactly ONE Barikoi link set — never duplicated alongside style-derived
  // attributions (the observer replaces content, maplibre rebuilds or not).
  await expect(inner.locator('a[href*="barikoi.com"]')).toHaveCount(1)
  await expect(page.locator('a.maplibregl-ctrl-logo[href*="barikoi.com"]').first()).toBeVisible()
}

async function hopTo(page, name, url) {
  await page.evaluate(([n, u]) => window.__SETSTYLE__(n, u), [name, url])
  // Poll for THIS hop's log entry — earlier hops' entries already exist.
  await expect
    .poll(
      () =>
        page.evaluate(
          n => window.__LOG__.filter(l => l.type === 'style.load' && l.style === n).length,
          name
        ),
      { timeout: 45_000 }
    )
    .toBeGreaterThan(0)
  await expect
    .poll(() => page.evaluate(() => window.__MAP__.isStyleLoaded()), { timeout: 45_000 })
    .toBe(true)
}

test('styles/switch: Barikoi → Barikoi → custom URL; attribution survives', async ({ page }) => {
  await gotoCase(page, 'styles/switch')
  await expectBarikoiBranding(page)

  await hopTo(page, 'barikoi-dark', BARIKOI_DARK)
  await expectBarikoiBranding(page)

  await hopTo(page, 'demotiles', DEMOTILES)
  await expectBarikoiBranding(page)

  // The final style actually renders (not just "loads").
  await expect
    .poll(() => page.evaluate(() => window.__MAP__.isMoving() === false), { timeout: 15_000 })
    .toBe(true)
  expect(await page.evaluate(() => window.__pageErrors__)).toEqual([])
})
