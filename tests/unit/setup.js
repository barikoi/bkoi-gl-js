// Unit-test setup (jsdom).
// jsdom lacks CSS.supports — polyfill with a plain-value heuristic used by
// Minimap containerStyle validation tests ('600px' valid, 'not-a-size' not).
if (typeof globalThis.CSS === 'undefined' || typeof globalThis.CSS.supports !== 'function') {
  globalThis.CSS = {
    ...globalThis.CSS,
    supports(prop, value) {
      if (typeof value !== 'string') return false
      return /^(#([0-9a-f]{3,8})|rgba?\([^)]*\)|hsla?\([^)]*\)|-?\d*\.?\d+(px|em|rem|%|vh|vw|s|ms|deg)?|auto|none|hidden|visible|solid|dotted|dashed)$/.test(
        value.trim()
      )
    },
  }
}
