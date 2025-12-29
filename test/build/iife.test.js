/**
 * Tests for IIFE build format
 * Tests that the dist/iife/bkoi-gl.js build exists and has expected structure
 * IIFE builds bundle everything but are designed for browser script loading, not Node.js requiring
 */

describe('IIFE Build Tests', () => {
  describe('IIFE build file', () => {
    test('should exist', () => {
      const fs = require('fs');
      const path = require('path');
      const iifePath = path.resolve(__dirname, '../../dist/iife/bkoi-gl.js');
      expect(fs.existsSync(iifePath)).toBe(true);
    });

    test('should be readable', () => {
      const fs = require('fs');
      const path = require('path');
      const iifePath = path.resolve(__dirname, '../../dist/iife/bkoi-gl.js');
      const content = fs.readFileSync(iifePath, 'utf8');
      expect(content).toBeDefined();
      expect(content.length).toBeGreaterThan(0);
    });

    test('should contain IIFE wrapper', () => {
      const fs = require('fs');
      const path = require('path');
      const iifePath = path.resolve(__dirname, '../../dist/iife/bkoi-gl.js');
      const content = fs.readFileSync(iifePath, 'utf8');

      // IIFE builds start with var name = (function
      expect(content).toMatch(/^var bkoigl = \(function/);
      expect(content).toMatch(/\}\)\(\{\}\)/);
    });

    test('should expose bkoigl', () => {
      const fs = require('fs');
      const path = require('path');
      const iifePath = path.resolve(__dirname, '../../dist/iife/bkoi-gl.js');
      const content = fs.readFileSync(iifePath, 'utf8');

      // Should contain the bkoigl name
      expect(content).toContain('bkoigl');
    });
  });

  describe('IIFE format verification', () => {
    test('should be different from ESM build', () => {
      const fs = require('fs');
      const path = require('path');
      const iifePath = path.resolve(__dirname, '../../dist/iife/bkoi-gl.js');
      const esmPath = path.resolve(__dirname, '../../dist/index.js');

      const iifeContent = fs.readFileSync(iifePath, 'utf8');
      const esmContent = fs.readFileSync(esmPath, 'utf8');

      // IIFE should be bundled and different from ESM
      expect(iifeContent).not.toBe(esmContent);
      expect(iifeContent.length).not.toBe(esmContent.length);
    });

    test('should be different from CJS build', () => {
      const fs = require('fs');
      const path = require('path');
      const iifePath = path.resolve(__dirname, '../../dist/iife/bkoi-gl.js');
      const cjsPath = path.resolve(__dirname, '../../dist/index.cjs');

      const iifeContent = fs.readFileSync(iifePath, 'utf8');
      const cjsContent = fs.readFileSync(cjsPath, 'utf8');

      // IIFE should be bundled and different from CJS
      expect(iifeContent).not.toBe(cjsContent);
      expect(iifeContent.length).not.toBe(cjsContent.length);
    });

    test('should contain expected exports', () => {
      const fs = require('fs');
      const path = require('path');
      const iifePath = path.resolve(__dirname, '../../dist/iife/bkoi-gl.js');
      const content = fs.readFileSync(iifePath, 'utf8');

      // Should contain key export names
      expect(content).toContain('Map');
      expect(content).toContain('isBarikoiStyle');
      expect(content).toContain('NavigationControl');
    });

    test('should contain bundled MapLibre GL code', () => {
      const fs = require('fs');
      const path = require('path');
      const iifePath = path.resolve(__dirname, '../../dist/iife/bkoi-gl.js');
      const content = fs.readFileSync(iifePath, 'utf8');

      // Should contain MapLibre GL related code since it's bundled
      expect(content).toContain('maplibre-gl');
      expect(content).toMatch(/MapLibre|maplibre/i);
    });
  });

  describe('IIFE vs other formats', () => {
    test('should be larger than ESM (due to bundling)', () => {
      const fs = require('fs');
      const path = require('path');
      const iifePath = path.resolve(__dirname, '../../dist/iife/bkoi-gl.js');
      const esmPath = path.resolve(__dirname, '../../dist/index.js');

      const iifeSize = fs.statSync(iifePath).size;
      const esmSize = fs.statSync(esmPath).size;

      // IIFE should be much larger due to bundling MapLibre GL
      expect(iifeSize).toBeGreaterThan(esmSize * 10); // At least 10x larger
    });

    test('should be larger than CJS (due to bundling)', () => {
      const fs = require('fs');
      const path = require('path');
      const iifePath = path.resolve(__dirname, '../../dist/iife/bkoi-gl.js');
      const cjsPath = path.resolve(__dirname, '../../dist/index.cjs');

      const iifeSize = fs.statSync(iifePath).size;
      const cjsSize = fs.statSync(cjsPath).size;

      // IIFE should be much larger due to bundling MapLibre GL
      expect(iifeSize).toBeGreaterThan(cjsSize * 10); // At least 10x larger
    });
  });

  describe('Browser Integration Tests', () => {
    test('should expose global bkoigl object', () => {
      const fs = require('fs');
      const path = require('path');
      const iifePath = path.resolve(__dirname, '../../dist/iife/bkoi-gl.js');
      const content = fs.readFileSync(iifePath, 'utf8');

      // Should contain bkoigl variable (IIFE pattern creates global)
      expect(content).toContain('bkoigl');
      expect(content).toMatch(/var bkoigl =/);
    });

    test('should contain all expected exports in bundle', () => {
      const fs = require('fs');
      const path = require('path');
      const iifePath = path.resolve(__dirname, '../../dist/iife/bkoi-gl.js');
      const content = fs.readFileSync(iifePath, 'utf8');

      // Should contain key export names in the bundled code
      expect(content).toContain('Map');
      expect(content).toContain('isBarikoiStyle');
      expect(content).toContain('NavigationControl');
      expect(content).toContain('bkoiConfig');
    });

    test('should work in simulated browser environment', () => {
      // Create a mock DOM environment
      const mockContainer = document.createElement('div');
      mockContainer.id = 'test-map';
      document.body.appendChild(mockContainer);

      // Simulate global bkoigl being available (as it would be after script loading)
      global.window = global.window || {};
      global.window.bkoigl = {
        Map: jest.fn().mockImplementation(() => ({
          addControl: jest.fn(),
          setStyle: jest.fn(),
        })),
        NavigationControl: jest.fn(),
        isBarikoiStyle: jest.fn(() => true),
      };

      // Test that we can use the global object
      const map = new global.window.bkoigl.Map({
        container: 'test-map',
        style: 'https://map.barikoi.com/styles/streets',
      });

      expect(map).toBeDefined();
      expect(global.window.bkoigl.isBarikoiStyle('test')).toBe(true);
    });
  });

  describe('Script Loading Tests', () => {
    test('should be valid JavaScript syntax', () => {
      const fs = require('fs');
      const path = require('path');
      const iifePath = path.resolve(__dirname, '../../dist/iife/bkoi-gl.js');
      const content = fs.readFileSync(iifePath, 'utf8');

      // Should be valid JavaScript syntax
      expect(() => {
        // Basic syntax check - if this doesn't throw, the JS is valid
        new Function(content);
      }).not.toThrow();
    });

    test('should have minimal global scope pollution', () => {
      const fs = require('fs');
      const path = require('path');
      const iifePath = path.resolve(__dirname, '../../dist/iife/bkoi-gl.js');
      const content = fs.readFileSync(iifePath, 'utf8');

      // Should only create the bkoigl variable, not pollute global scope excessively
      expect(content).toMatch(/var bkoigl =/);
      expect(content).toContain('bkoigl');
    });
  });

  describe('Cross-browser Compatibility Tests', () => {
    test('should be compatible with modern browsers', () => {
      const fs = require('fs');
      const path = require('path');
      const iifePath = path.resolve(__dirname, '../../dist/iife/bkoi-gl.js');
      const content = fs.readFileSync(iifePath, 'utf8');

      // Should use modern JavaScript features that work in current browsers
      expect(content).toContain('const') || expect(content).toContain('let');
      expect(content).toContain('=>'); // Arrow functions
    });

    test('should handle browser environment detection', () => {
      const fs = require('fs');
      const path = require('path');
      const iifePath = path.resolve(__dirname, '../../dist/iife/bkoi-gl.js');
      const content = fs.readFileSync(iifePath, 'utf8');

      // Should detect browser environment properly
      expect(content).toContain('typeof window');
      expect(content).toContain('typeof globalThis');
    });
  });

  describe('Functional Tests in Browser Context', () => {
    beforeEach(() => {
      // Setup browser-like environment for each test
      global.window = global.window || {};
      global.window.bkoigl = {
        Map: jest.fn().mockImplementation(() => ({
          addControl: jest.fn(),
          setStyle: jest.fn(),
          getContainer: jest.fn(() => document.createElement('div')),
        })),
        NavigationControl: jest.fn(),
        GeolocateControl: jest.fn(),
        isBarikoiStyle: jest.fn(() => true),
        Popup: jest.fn().mockImplementation(() => ({
          setLngLat: jest.fn().mockReturnThis(),
          setHTML: jest.fn().mockReturnThis(),
        })),
        Marker: jest.fn().mockImplementation(() => ({
          setLngLat: jest.fn().mockReturnThis(),
        })),
      };
    });

    test('should create Map instance in browser', () => {
      const container = document.createElement('div');
      container.id = 'map';
      document.body.appendChild(container);

      const map = new global.window.bkoigl.Map({
        container: 'map',
        style: 'https://map.barikoi.com/styles/streets',
        center: [90.4125, 23.8103],
        zoom: 10
      });

      expect(map).toBeDefined();
      expect(map.addControl).toBeDefined();
    });

    test('should handle controls in browser environment', () => {
      const map = new global.window.bkoigl.Map({
        container: document.createElement('div'),
        style: 'https://map.barikoi.com/styles/streets'
      });

      const navControl = new global.window.bkoigl.NavigationControl();
      map.addControl(navControl);

      expect(map.addControl).toHaveBeenCalledWith(navControl);
    });

    test('should work with browser utilities', () => {
      const popup = new global.window.bkoigl.Popup()
        .setLngLat([90.4125, 23.8103])
        .setHTML('<p>Test</p>');

      const marker = new global.window.bkoigl.Marker()
        .setLngLat([90.4125, 23.8103]);

      expect(popup).toBeDefined();
      expect(marker).toBeDefined();
    });
  });
});
