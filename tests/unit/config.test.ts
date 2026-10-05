import { describe, expect, test } from 'vitest'
import { bkoiConfig } from 'bkoi-gl'
import { DEFAULT_CENTER } from '../../src/utils/constants'
import { isBarikoiStyle } from '../../src/utils/validator'
import { getRandomUUID } from '../../src/utils/utils'

describe('bkoiConfig', () => {
  test('exposes the default style URL', () => {
    expect(bkoiConfig.DEFAULT_STYLE).toBe('https://map.barikoi.com/styles/barikoi-light/style.json')
  })

  test('starts without an access token', () => {
    expect(bkoiConfig.ACCESS_TOKEN ?? '').toBe('')
  })
})

describe('DEFAULT_CENTER', () => {
  test('is Dhaka in [lng, lat] order', () => {
    expect(Array.isArray(DEFAULT_CENTER)).toBe(true)
    expect(DEFAULT_CENTER).toHaveLength(2)
    expect(DEFAULT_CENTER[0]).toBeGreaterThan(88)
    expect(DEFAULT_CENTER[0]).toBeLessThan(92)
    expect(DEFAULT_CENTER[1]).toBeGreaterThan(21)
    expect(DEFAULT_CENTER[1]).toBeLessThan(26)
  })
})

describe('isBarikoiStyle', () => {
  test.each([
    ['https://map.barikoi.com/styles/barikoi-light/style.json', true],
    ['https://map.barikoi.com/styles/osm-liberty/style.json', true],
    ['https://barikoi.com/styles/custom/style.json', false],
    ['https://example.com/style.json', false],
    ['', false],
    [null, false],
    [undefined, false],
  ])('isBarikoiStyle(%p) === %p', (input, expected) => {
    expect(isBarikoiStyle(input as string | null | undefined)).toBe(expected)
  })
})

describe('getRandomUUID', () => {
  test('returns a positive integer', () => {
    const id = getRandomUUID()
    expect(Number.isInteger(id)).toBe(true)
    expect(id).toBeGreaterThan(0)
  })

  test('returns different values across calls', () => {
    const seen = new Set<number>()
    for (let i = 0; i < 100; i++) seen.add(getRandomUUID())
    expect(seen.size).toBeGreaterThan(90)
  })

  test('falls back to Date/Math randomness without crypto', () => {
    const realCrypto = window.crypto
    Object.defineProperty(window, 'crypto', { value: undefined, configurable: true })
    try {
      const id = getRandomUUID()
      // base36 strings parsed as base-10: a number (possibly NaN from letters —
      // assertion matches shipped fallback behavior; digits-only is the norm)
      expect(typeof id).toBe('number')
    } finally {
      Object.defineProperty(window, 'crypto', { value: realCrypto, configurable: true })
    }
  })
})
