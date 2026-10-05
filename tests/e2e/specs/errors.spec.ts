// Error paths: failures surface as map 'error' events or a descriptive
// constructor throw — never as uncaught page exceptions. These cases have no
// settled map, so they bypass gotoCase and wait on logs directly.
import { test, expect, waitForLog } from '../fixtures/map.js'

test('errors/bad-key: invalid key surfaces as a map error event', async ({ page }) => {
  await page.goto('/?case=errors/bad-key')

  const errors = await waitForLog(page, 'map-error', { timeout: 45_000 })
  expect(errors.at(-1).message).toBeTruthy()

  // The failure must be an event, not an uncaught exception.
  expect(await page.evaluate(() => window.__pageErrors__)).toEqual([])
})

test('errors/bad-style: nonexistent style URL surfaces as a map error event', async ({ page }) => {
  await page.goto('/?case=errors/bad-style')

  const errors = await waitForLog(page, 'map-error', { timeout: 45_000 })
  expect(errors.at(-1).message).toBeTruthy()

  expect(await page.evaluate(() => window.__pageErrors__)).toEqual([])
})

test('errors/bad-container: missing container id throws a descriptive Error', async ({ page }) => {
  await page.goto('/?case=errors/bad-container')

  const [err] = await waitForLog(page, 'constructor-error')
  expect(err.thrown).toBe(true)
  expect(err.name).toBe('Error')
  // Descriptive: the message names the missing container.
  expect(String(err.message).toLowerCase()).toContain('container')
  expect(await page.evaluate(() => window.__pageErrors__)).toEqual([])
})
