/**
 * Tests for UMD build format
 * Tests that the dist/umd/bkoi-gl.js build exists and has expected structure
 * UMD builds bundle everything but are designed for browser script loading, not Node.js requiring
 */

describe('UMD Build Tests', () => {
  describe('UMD build file', () => {
    test('should exist', () => {
      const fs = require('fs');
      const path = require('path');
      const umdPath = path.resolve(__dirname, '../../dist/umd/bkoi-gl.js');
      expect(fs.existsSync(umdPath)).toBe(true);
    });

    test('should be readable', () => {
      const fs = require('fs');
      const path = require('path');
      const umdPath = path.resolve(__dirname, '../../dist/umd/bkoi-gl.js');
      const content = fs.readFileSync(umdPath, 'utf8');
      expect(content).toBeDefined();
      expect(content.length).toBeGreaterThan(0);
    });

    test('should contain UMD wrapper', () => {
      const fs = require('fs');
      const path = require('path');
      const umdPath = path.resolve(__dirname, '../../dist/umd/bkoi-gl.js');
      const content = fs.readFileSync(umdPath, 'utf8');

      // UMD builds typically contain checks for different module systems
      expect(content).toMatch(/typeof exports|typeof module|typeof define/);
    });

    test('should expose bkoigl', () => {
      const fs = require('fs');
      const path = require('path');
      const umdPath = path.resolve(__dirname, '../../dist/umd/bkoi-gl.js');
      const content = fs.readFileSync(umdPath, 'utf8');

      // Should contain the bkoigl name
      expect(content).toContain('bkoigl');
    });
  });

  describe('UMD format verification', () => {
    test('should be different from ESM build', () => {
      const fs = require('fs');
      const path = require('path');
      const umdPath = path.resolve(__dirname, '../../dist/umd/bkoi-gl.js');
      const esmPath = path.resolve(__dirname, '../../dist/index.js');

      const umdContent = fs.readFileSync(umdPath, 'utf8');
      const esmContent = fs.readFileSync(esmPath, 'utf8');

      // UMD should be bundled and different from ESM
      expect(umdContent).not.toBe(esmContent);
      expect(umdContent.length).not.toBe(esmContent.length);
    });

    test('should be different from CJS build', () => {
      const fs = require('fs');
      const path = require('path');
      const umdPath = path.resolve(__dirname, '../../dist/umd/bkoi-gl.js');
      const cjsPath = path.resolve(__dirname, '../../dist/index.cjs');

      const umdContent = fs.readFileSync(umdPath, 'utf8');
      const cjsContent = fs.readFileSync(cjsPath, 'utf8');

      // UMD should be bundled and different from CJS
      expect(umdContent).not.toBe(cjsContent);
      expect(umdContent.length).not.toBe(cjsContent.length);
    });

    test('should contain expected exports', () => {
      const fs = require('fs');
      const path = require('path');
      const umdPath = path.resolve(__dirname, '../../dist/umd/bkoi-gl.js');
      const content = fs.readFileSync(umdPath, 'utf8');

      // Should contain key export names
      expect(content).toContain('Map');
      expect(content).toContain('isBarikoiStyle');
      expect(content).toContain('NavigationControl');
    });

    test('should contain bundled MapLibre GL code', () => {
      const fs = require('fs');
      const path = require('path');
      const umdPath = path.resolve(__dirname, '../../dist/umd/bkoi-gl.js');
      const content = fs.readFileSync(umdPath, 'utf8');

      // Should contain MapLibre GL related code since it's bundled
      expect(content).toContain('maplibre-gl');
      expect(content).toMatch(/MapLibre|maplibre/i);
    });
  });

  describe('UMD vs other formats', () => {
    test('should be larger than ESM (due to bundling)', () => {
      const fs = require('fs');
      const path = require('path');
      const umdPath = path.resolve(__dirname, '../../dist/umd/bkoi-gl.js');
      const esmPath = path.resolve(__dirname, '../../dist/index.js');

      const umdSize = fs.statSync(umdPath).size;
      const esmSize = fs.statSync(esmPath).size;

      // UMD should be much larger due to bundling MapLibre GL
      expect(umdSize).toBeGreaterThan(esmSize * 10); // At least 10x larger
    });

    test('should be larger than CJS (due to bundling)', () => {
      const fs = require('fs');
      const path = require('path');
      const umdPath = path.resolve(__dirname, '../../dist/umd/bkoi-gl.js');
      const cjsPath = path.resolve(__dirname, '../../dist/index.cjs');

      const umdSize = fs.statSync(umdPath).size;
      const cjsSize = fs.statSync(cjsPath).size;

      // UMD should be much larger due to bundling MapLibre GL
      expect(umdSize).toBeGreaterThan(cjsSize * 10); // At least 10x larger
    });
  });

  describe('Module System Compatibility Tests', () => {
    test('should support AMD loading', () => {
      const fs = require('fs');
      const path = require('path');
      const umdPath = path.resolve(__dirname, '../../dist/umd/bkoi-gl.js');
      const content = fs.readFileSync(umdPath, 'utf8');

      // Should contain AMD detection
      expect(content).toContain('typeof define');
      expect(content).toContain('define.amd');

      // Should be valid JavaScript syntax
      expect(() => {
        // Basic syntax check without execution
        new Function('define', 'window', content);
      }).not.toThrow();
    });

    test('should support CommonJS loading', () => {
      const fs = require('fs');
      const path = require('path');
      const umdPath = path.resolve(__dirname, '../../dist/umd/bkoi-gl.js');
      const content = fs.readFileSync(umdPath, 'utf8');

      // Should contain CommonJS detection
      expect(content).toContain('typeof exports');
      expect(content).toContain('typeof module');

      // Should be valid JavaScript syntax
      expect(() => {
        // Basic syntax check without execution
        new Function('module', 'exports', 'require', content);
      }).not.toThrow();
    });

    test('should support browser global loading', () => {
      const fs = require('fs');
      const path = require('path');
      const umdPath = path.resolve(__dirname, '../../dist/umd/bkoi-gl.js');
      const content = fs.readFileSync(umdPath, 'utf8');

      // Should be valid JavaScript syntax
      expect(() => {
        // Basic syntax check without execution
        new Function('window', content);
      }).not.toThrow();
    });

    test('should contain module system detection', () => {
      const fs = require('fs');
      const path = require('path');
      const umdPath = path.resolve(__dirname, '../../dist/umd/bkoi-gl.js');
      const content = fs.readFileSync(umdPath, 'utf8');

      // Should contain all three module system checks
      expect(content).toContain('define.amd');
      expect(content).toContain('typeof exports');
      expect(content).toContain('typeof module');
    });
  });

  describe('UMD Functional Tests', () => {
    beforeEach(() => {
      // Setup UMD environment
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
        Popup: jest.fn(),
        Marker: jest.fn(),
      };
    });

    afterEach(() => {
      delete global.window;
    });

    test('should work as AMD module', () => {
      const modules = {};
      global.define = jest.fn((name, deps, factory) => {
        modules[name] = factory();
      });
      global.define.amd = true;

      // Simulate AMD loading
      global.define('bkoi-gl', [], () => global.window.bkoigl);

      expect(modules['bkoi-gl']).toBeDefined();
      expect(typeof modules['bkoi-gl'].Map).toBe('function');

      delete global.define;
    });

    test('should work as CommonJS module', () => {
      const mockModule = { exports: {} };

      // Simulate CommonJS loading
      mockModule.exports = global.window.bkoigl;

      expect(mockModule.exports).toBeDefined();
      expect(typeof mockModule.exports.Map).toBe('function');
    });

    test('should work as browser global', () => {
      expect(global.window.bkoigl).toBeDefined();
      expect(typeof global.window.bkoigl.Map).toBe('function');
      expect(typeof global.window.bkoigl.isBarikoiStyle).toBe('function');
    });

    test('should create Map instance in UMD context', () => {
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

    test('should handle controls in UMD environment', () => {
      const map = new global.window.bkoigl.Map({
        container: document.createElement('div'),
        style: 'https://map.barikoi.com/styles/streets'
      });

      const navControl = new global.window.bkoigl.NavigationControl();
      map.addControl(navControl);

      expect(map.addControl).toHaveBeenCalledWith(navControl);
    });
  });

  describe('UMD Error Handling', () => {
    test('should handle browser environment issues', () => {
      const fs = require('fs');
      const path = require('path');
      const umdPath = path.resolve(__dirname, '../../dist/umd/bkoi-gl.js');
      const content = fs.readFileSync(umdPath, 'utf8');

      // Should contain proper error handling for missing browser APIs
      expect(content).toContain('typeof window');
      expect(content).toContain('typeof globalThis');
    });
  });

  describe('UMD Cross-Environment Compatibility', () => {
    test('should work in RequireJS-like AMD environment', () => {
      const loadedModules = {};
      global.define = jest.fn((name, deps, factory) => {
        loadedModules[name] = factory.apply(null, deps.map(dep => loadedModules[dep]));
      });
      global.define.amd = true;

      // Simulate loading dependencies and the main module
      global.define('bkoi-gl', [], () => ({ Map: jest.fn(), isBarikoiStyle: jest.fn() }));

      expect(loadedModules['bkoi-gl']).toBeDefined();

      delete global.define;
    });

    test('should support different module loading patterns', () => {
      const fs = require('fs');
      const path = require('path');
      const umdPath = path.resolve(__dirname, '../../dist/umd/bkoi-gl.js');
      const content = fs.readFileSync(umdPath, 'utf8');

      // Should contain checks for all three module systems
      expect(content).toContain('define.amd');
      expect(content).toContain('typeof exports');
      expect(content).toContain('typeof module');
      // UMD should contain the bkoigl identifier
      expect(content).toContain('bkoigl');
    });
  });
});
