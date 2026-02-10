/**
 * @fileoverview Utility functions for bkoi-gl-js
 * @description Common utility functions used across the library.
 */

/**
 * Generates a random UUID-like identifier.
 * Uses crypto.getRandomValues when available for better randomness,
 * falls back to Date.now() with Math.random() for older browsers.
 *
 * @returns {number} A random number identifier
 */
export function getRandomUUID(): number {
  if (
    typeof window !== 'undefined' &&
    window.crypto &&
    window.crypto.getRandomValues &&
    typeof window.crypto.getRandomValues === 'function'
  ) {
    const random_arr = new Uint16Array(2)
    return parseInt(window.crypto.getRandomValues(random_arr).join(''), 10)
  }

  const randomArray: string[] = []
  for (let x = 0; x < 3; ++x) {
    randomArray.push(Math.floor(Date.now() * Math.random()).toString(36))
  }

  return parseInt(randomArray.join(''), 10)
}
