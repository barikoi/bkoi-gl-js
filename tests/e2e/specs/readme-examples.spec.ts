// README validation — every fenced README block, executed against the built
// dist. Generated cases come from scripts/extract-readme-examples.mjs.
import { test, expect } from 'playwright/test'
import { gotoCase } from './helpers.js'

test('readme/examples: every fenced README block executes against dist', async ({ page }) => {
  test.setTimeout(180_000)
  await gotoCase(page, 'readme/examples')

  await expect
    .poll(() => page.evaluate(() => window.__README_RESULTS__ || null), { timeout: 150_000 })
    .toBeTruthy()

  const results = await page.evaluate(() => window.__README_RESULTS__)
  const failed = results.filter(r => !r.ok)
  const summary = results
    .map(
      r => `${r.id} ${r.mode}${r.ok ? '' : ` FAIL: ${r.error}`}${r.reason ? ` (${r.reason})` : ''}`
    )
    .join('\n')
  expect(failed, `README examples failing:\n${summary}`).toEqual([])
  // Guard against silent regressions to "nothing ran"
  expect(results.filter(r => r.mode !== 'skip').length).toBeGreaterThan(30)
  // eslint-disable-next-line no-console -- one-line CI summary
  console.log(`readme/examples: ${results.filter(r => r.ok).length}/${results.length} ok`)
})
