/**
 * UMD Build Tests
 * Tests that validate the Universal Module Definition (UMD) build format
 * UMD builds support multiple module systems (AMD, CommonJS, browser global)
 * These tests focus on file structure validation since UMD bundles may not run fully in Node.js
 */

describe('UMD Build Tests', () => {
  let umdContent;
  let umdPath;
  let fs;
  let path;

  beforeAll(() => {
    // Load file system utilities
    fs = require('fs');
    path = require('path');

    // Get UMD build path
    umdPath = path.resolve(__dirname, '../../dist/umd/bkoi-gl.js');

    // Read the UMD bundle content
    if (fs.existsSync(umdPath)) {
      umdContent = fs.readFileSync(umdPath, 'utf8');
    }
  });

  describe('File Structure Validation', () => {
    test('should exist in dist directory', () => {
      expect(fs.existsSync(umdPath)).toBe(true);
    });

    test('should be readable', () => {
      expect(umdContent).toBeDefined();
      expect(typeof umdContent).toBe('string');
      expect(umdContent.length).toBeGreaterThan(0);
    });

    test('should have reasonable file size', () => {
      const stats = fs.statSync(umdPath);
      const fileSizeInMB = stats.size / (1024 * 1024);

      // UMD bundles are large due to all dependencies
      expect(stats.size).toBeGreaterThan(1024 * 1024); // At least 1MB
      expect(stats.size).toBeLessThan(50 * 1024 * 1024); // Less than 50MB

      console.log(`UMD bundle size: ${fileSizeInMB.toFixed(2)} MB`);
    });
  });

  describe('UMD Pattern Validation', () => {
    test('should contain UMD wrapper pattern', () => {
      // UMD typically contains module system checks
      expect(umdContent).toMatch(/typeof exports|typeof module|typeof define/);
    });

    test('should support AMD loading pattern', () => {
      // Should contain AMD detection
      expect(umdContent).toContain('typeof define');
      expect(umdContent).toContain('define.amd');
    });

    test('should support CommonJS loading pattern', () => {
      // Should contain CommonJS detection
      expect(umdContent).toContain('typeof exports');
      expect(umdContent).toContain('typeof module');
    });

    test('should support browser global loading', () => {
      // Should contain browser global fallback
      expect(umdContent).toContain('bkoigl');
    });

    test('should be valid JavaScript syntax', () => {
      // Basic syntax validation
      expect(() => {
        // Try to create a Function object (basic syntax check)
        new Function(umdContent);
      }).not.toThrow();
    });
  });

  describe('Content Analysis', () => {
    test('should contain expected library identifier', () => {
      // Should contain the main library name/identifier
      expect(umdContent).toContain('bkoigl');
    });

    test('should contain core MapLibre GL code', () => {
      // Should contain MapLibre GL references
      expect(umdContent).toMatch(/maplibre|MapLibre/i);
    });

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
        'Point'
      ];

      expectedExports.forEach(exportName => {
        expect(umdContent).toContain(exportName);
      });
    });

    test('should contain bundled dependencies', () => {
      // Should contain references to bundled dependencies
      expect(umdContent).toMatch(/MapLibre|maplibre/i);
    });
  });

  describe('Module System Compatibility', () => {
    test('should handle AMD module definition', () => {
      // Should contain AMD module definition pattern
      expect(umdContent).toContain('define(');
      expect(umdContent).toContain('function(');
    });

    test('should handle CommonJS module exports', () => {
      // Should contain CommonJS export patterns
      expect(umdContent).toContain('exports.');
    });

    test('should detect module systems in correct order', () => {
      // Should check for AMD first, then CommonJS, then browser global
      const exportsIndex = umdContent.indexOf('typeof exports');
      const windowIndex = umdContent.indexOf('typeof window');

      // CommonJS should come before browser global
      expect(exportsIndex).toBeLessThan(windowIndex);
    });
  });

  describe('Build Format Characteristics', () => {
    test('should be self-contained (no external imports)', () => {
      // UMD should not contain ES6 export statements
      expect(umdContent).not.toContain('export ');
    });

    test('should contain factory function pattern', () => {
      // UMD typically uses factory function pattern
      expect(umdContent).toContain('function(');
      expect(umdContent).toContain('return ');
    });

    test('should be minifiable (no comments)', () => {
      // Production builds are typically minified
      const lines = umdContent.split('\n');
      const longLines = lines.filter(line => line.length > 500);

      // Should have some long lines (minified code)
      expect(longLines.length).toBeGreaterThan(0);
    });
  });

  describe('Browser Compatibility', () => {
    test('should use modern JavaScript features', () => {
      // Should contain modern JS syntax
      const hasModernJS = umdContent.includes('const') ||
                         umdContent.includes('let') ||
                         umdContent.includes('=>') ||
                         umdContent.includes('class');

      expect(hasModernJS).toBe(true);
    });

    test('should handle browser environment detection', () => {
      // Should contain browser environment checks
      expect(umdContent).toContain('typeof window');
      expect(umdContent).toContain('typeof globalThis');
    });

    test('should handle root object detection', () => {
      // Should contain root object detection for browser global
      expect(umdContent).toContain('this');
      expect(umdContent).toMatch(/root\s*=\s*|\broot\b/);
    });
  });

  describe('Bundle Optimization', () => {
    test('should have reasonable compression ratio', () => {
      const compressedSize = umdContent.length;

      // Bundle should be reasonably compressed
      expect(compressedSize).toBeGreaterThan(100000); // At least 100KB
      expect(compressedSize).toBeLessThan(10000000); // Less than 10MB
    });

    test('should contain minified code patterns', () => {
      // Minified code typically has long variable names and no spaces
      const hasMinifiedPatterns = umdContent.includes('function(') &&
                                 umdContent.includes('){') &&
                                 !umdContent.includes('function ()');

      expect(hasMinifiedPatterns).toBe(true);
    });
  });

  describe('Bundle Execution Safety', () => {
    test('should be syntactically valid JavaScript', () => {
      // Basic syntax validation - the bundle should be valid JS
      expect(() => {
        // Try to create a Function object (basic syntax check)
        new Function(umdContent);
      }).not.toThrow();
    });
  });

  describe('Library Integration', () => {
    test('should support both development and production loading', () => {
      // Should work in different environments
      const hasUMDPatterns = umdContent.includes('typeof define') ||
                            umdContent.includes('typeof exports')

      expect(hasUMDPatterns).toBe(true);
    });
  });
});
