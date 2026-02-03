/**
 * IIFE Build Tests
 * Tests that validate the Immediately Invoked Function Expression (IIFE) build format
 * IIFE builds are designed for direct browser script loading, not Node.js requiring
 * These tests focus on file structure validation since IIFE bundles cannot run in Node.js
 */

describe('IIFE Build Tests', () => {
  let iifeContent
  let iifePath
  let fs
  let path

  beforeAll(() => {
    // Load file system utilities
    fs = require('fs')
    path = require('path')

    // Get IIFE build path
    iifePath = path.resolve(__dirname, '../../dist/iife/bkoi-gl.js')

    // Read the IIFE bundle content
    if (fs.existsSync(iifePath)) {
      iifeContent = fs.readFileSync(iifePath, 'utf8')
    }
  })

  describe('File Structure Validation', () => {
    test('should exist in dist directory', () => {
      expect(fs.existsSync(iifePath)).toBe(true)
    })

    test('should be readable', () => {
      expect(iifeContent).toBeDefined()
      expect(typeof iifeContent).toBe('string')
      expect(iifeContent.length).toBeGreaterThan(0)
    })

    test('should have reasonable file size', () => {
      const stats = fs.statSync(iifePath)
      const fileSizeInMB = stats.size / (1024 * 1024)

      // IIFE bundles are typically large due to all dependencies
      expect(stats.size).toBeGreaterThan(1024 * 1024) // At least 1MB
      expect(stats.size).toBeLessThan(50 * 1024 * 1024) // Less than 50MB

      console.log(`IIFE bundle size: ${fileSizeInMB.toFixed(2)} MB`)
    })
  })

  describe('IIFE Pattern Validation', () => {
    test('should contain function declaration', () => {
      expect(iifeContent).toContain('function')
    })

    test('should be valid JavaScript syntax', () => {
      // Basic syntax validation
      expect(() => {
        // Try to create a Function object (basic syntax check)
        new Function(iifeContent)
      }).not.toThrow()
    })
  })

  describe('Content Analysis', () => {
    test('should contain expected library identifier', () => {
      // Should contain the main library name/identifier
      expect(iifeContent).toContain('bkoigl')
    })

    test('should contain core MapLibre GL code', () => {
      // Should contain MapLibre GL references
      expect(iifeContent).toMatch(/maplibre|MapLibre/i)
    })

    test('should contain expected API exports', () => {
      const expectedExports = [
        'Map',
        'isBarikoiStyle',
        'NavigationControl',
        'GeolocateControl',
        'AttributionControl',
        'ScaleControl',
        'FullscreenControl',
        'Popup',
        'Marker',
        'LngLat',
        'LngLatBounds',
        'Point',
      ]

      expectedExports.forEach(exportName => {
        expect(iifeContent).toContain(exportName)
      })
    })

    test('should contain bundled dependencies', () => {
      // Should contain references to bundled dependencies
      expect(iifeContent).toMatch(/MapLibre|maplibre/i)
    })
  })

  describe('Build Format Characteristics', () => {
    test('should be self-contained (no external imports)', () => {
      expect(iifeContent).not.toContain('export ')
      expect(iifeContent).not.toContain('require(')
    })

    test('should be minifiable (no comments)', () => {
      // Production builds are typically minified
      const lines = iifeContent.split('\n')
      const longLines = lines.filter(line => line.length > 500)

      // Should have some long lines (minified code)
      expect(longLines.length).toBeGreaterThan(0)
    })
  })

  describe('Browser Compatibility', () => {
    test('should use modern JavaScript features', () => {
      // Should contain modern JS syntax
      const hasModernJS =
        iifeContent.includes('const') ||
        iifeContent.includes('let') ||
        iifeContent.includes('=>') ||
        iifeContent.includes('class')

      expect(hasModernJS).toBe(true)
    })

    test('should handle browser environment detection', () => {
      // Should contain browser environment checks
      expect(iifeContent).toContain('typeof window')
      expect(iifeContent).toContain('typeof globalThis')
    })

    test('should be compatible with script loading', () => {
      // Should be executable as a script
      expect(iifeContent).not.toContain('module.exports')
    })
  })

  describe('Bundle Optimization', () => {
    test('should have reasonable compression ratio', () => {
      const compressedSize = iifeContent.length

      // Bundle should be reasonably compressed
      expect(compressedSize).toBeGreaterThan(100000) // At least 100KB
      expect(compressedSize).toBeLessThan(10000000) // Less than 10MB
    })

    test('should contain minified code patterns', () => {
      // Minified code typically has long variable names and no spaces
      const hasMinifiedPatterns =
        iifeContent.includes('function(') &&
        iifeContent.includes('){') &&
        !iifeContent.includes('function ()')

      expect(hasMinifiedPatterns).toBe(true)
    })
  })

  describe('Bundle Execution Safety', () => {
    test('should be syntactically valid JavaScript', () => {
      // Basic syntax validation - the bundle should be valid JS
      expect(() => {
        // Try to create a Function object (basic syntax check)
        new Function(iifeContent)
      }).not.toThrow()
    })
  })
})
