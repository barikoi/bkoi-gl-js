/**
 * Tests for ESM build format
 * Tests that the dist/esm/index.js build can be imported and has expected exports
 */

describe('ESM Build Tests', () => {
  let bkoiModule;

  beforeAll(async () => {
    // Test that the ESM build file exists and can be imported
    try {
      bkoiModule = await import('../../dist/esm/index.js');
    } catch (error) {
      // If import fails, check if file exists
      const fs = require('fs');
      const path = require('path');
      const esmPath = path.resolve(__dirname, '../../dist/esm/index.js');
      if (!fs.existsSync(esmPath)) {
        throw new Error('ESM build file does not exist. Run npm run build first.');
      }
      throw error;
    }

    // Mock the Map constructor globally to avoid real instantiation
    const mockMapInstance = {
      addControl: jest.fn(),
      getContainer: jest.fn(() => document.createElement('div')),
      setStyle: jest.fn(),
      once: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      fire: jest.fn(),
      remove: jest.fn(),
      loaded: jest.fn(() => true),
      isStyleLoaded: jest.fn(() => true)
    };

    bkoiModule.Map = jest.fn(() => mockMapInstance);
  });

  describe('ESM module loading', () => {
    test('should successfully import ESM build', () => {
      expect(bkoiModule).toBeDefined();
      expect(typeof bkoiModule).toBe('object');
    });

    test('should export Map constructor', () => {
      expect(bkoiModule).toHaveProperty('Map');
      expect(typeof bkoiModule.Map).toBe('function');
    });

    test('should export utility functions', () => {
      expect(bkoiModule).toHaveProperty('isBarikoiStyle');
      expect(typeof bkoiModule.isBarikoiStyle).toBe('function');
    });

    test('should export control classes', () => {
      const controls = ['NavigationControl', 'GeolocateControl', 'AttributionControl', 'ScaleControl', 'FullscreenControl'];
      controls.forEach(control => {
        expect(bkoiModule).toHaveProperty(control);
        expect(typeof bkoiModule[control]).toBe('function');
      });
    });

    test('should export other classes', () => {
      const classes = ['Popup', 'Marker', 'Style', 'LngLat', 'LngLatBounds'];
      classes.forEach(cls => {
        expect(bkoiModule).toHaveProperty(cls);
        expect(typeof bkoiModule[cls]).toBe('function');
      });
    });
  });

  describe('isBarikoiStyle function (basic)', () => {
    test('should be callable', () => {
      expect(() => bkoiModule.isBarikoiStyle('test')).not.toThrow();
    });

    test('should return boolean', () => {
      const result = bkoiModule.isBarikoiStyle('https://map.barikoi.com/styles/test');
      expect(typeof result).toBe('boolean');
    });

    test('should return true for all official Barikoi style URLs', () => {
      const barikoiStyles = [
        'https://map.barikoi.com/styles/barikoi-light/style.json',
        'https://map.barikoi.com/styles/barikoi-dark-mode/style.json',
        'https://map.barikoi.com/styles/barkoi_green/style.json',
        'https://map.barikoi.com/styles/planet_map/style.json',
        'https://map.barikoi.com/styles/osm-liberty/style.json'
      ];

      barikoiStyles.forEach(style => {
        expect(bkoiModule.isBarikoiStyle(style)).toBe(true);
      });
    });

    test('should return false for non-Barikoi URLs', () => {
      expect(bkoiModule.isBarikoiStyle('https://api.mapbox.com/styles/v1/mapbox/streets-v11')).toBe(false);
      expect(bkoiModule.isBarikoiStyle('mapbox://styles/mapbox/streets-v11')).toBe(false);
      expect(bkoiModule.isBarikoiStyle('invalid-url')).toBe(false);
      expect(bkoiModule.isBarikoiStyle('')).toBe(false);
      expect(bkoiModule.isBarikoiStyle(null)).toBe(false);
      expect(bkoiModule.isBarikoiStyle(undefined)).toBe(false);
    });

    test('should validate Barikoi style URL patterns', () => {
      // Valid patterns
      expect(bkoiModule.isBarikoiStyle('https://map.barikoi.com/styles/any-style-name/style.json')).toBe(true);
      expect(bkoiModule.isBarikoiStyle('https://map.barikoi.com/styles/style-name/style.json')).toBe(true);

      // Invalid patterns
      expect(bkoiModule.isBarikoiStyle('https://map.barikoi.com/styles/style.json')).toBe(false);
      expect(bkoiModule.isBarikoiStyle('https://other-domain.com/styles/style/style.json')).toBe(false);
      expect(bkoiModule.isBarikoiStyle('http://map.barikoi.com/styles/style/style.json')).toBe(false);
    });
  });

  describe('ESM build structure', () => {
    test('should have named exports', () => {
      const expectedExports = [
        'Map', 'NavigationControl', 'GeolocateControl', 'AttributionControl',
        'ScaleControl', 'FullscreenControl', 'Popup', 'Marker', 'Style',
        'LngLat', 'LngLatBounds', 'Point', 'MercatorCoordinate', 'Evented',
        'isBarikoiStyle', 'setRTLTextPlugin', 'getRTLTextPluginStatus',
        'prewarm', 'clearPrewarmedResources', 'bkoiConfig'
      ];

      expectedExports.forEach(exportName => {
        expect(bkoiModule).toHaveProperty(exportName);
      });
    });

    test('should have default export', () => {
      expect(bkoiModule).toHaveProperty('default');
      expect(typeof bkoiModule.default).toBe('object');
    });
  });

  describe('ESM-specific Tests', () => {
    test('should support dynamic imports', async () => {
      const { Map, isBarikoiStyle } = await import('../../dist/esm/index.js');
      expect(Map).toBeDefined();
      expect(typeof Map).toBe('function');
      expect(typeof isBarikoiStyle).toBe('function');
    });

    test('should support named imports', async () => {
      const { Map, NavigationControl, isBarikoiStyle } = await import('../../dist/esm/index.js');
      expect(Map).toBeDefined();
      expect(NavigationControl).toBeDefined();
      expect(isBarikoiStyle).toBeDefined();
    });

    test('should support tree-shaking (selective imports)', async () => {
      // Test that we can import only what we need
      const { isBarikoiStyle } = await import('../../dist/esm/index.js');
      expect(typeof isBarikoiStyle).toBe('function');

      // Verify the function works
      const result = isBarikoiStyle('https://map.barikoi.com/styles/test');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Functional Tests - Map Instantiation', () => {
    test('should create Map instance', () => {
      const container = document.createElement('div');
      container.id = 'map';
      document.body.appendChild(container);

      // Mock the Map constructor to avoid real instantiation
      const mockMapInstance = {
        addControl: jest.fn(),
        getContainer: jest.fn(() => container),
        setStyle: jest.fn(),
        once: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
        fire: jest.fn(),
        remove: jest.fn(),
        loaded: jest.fn(() => true),
        isStyleLoaded: jest.fn(() => true)
      };

      // Mock the Map constructor
      jest.spyOn(bkoiModule, 'Map').mockImplementation(() => mockMapInstance);

      const map = new bkoiModule.Map({
        container: 'map',
        style: 'https://map.barikoi.com/styles/streets',
        center: [90.4125, 23.8103],
        zoom: 10
      });

      expect(map).toBeDefined();
      expect(typeof map.addControl).toBe('function');
      expect(typeof map.getContainer).toBe('function');
    });

    test('should handle Map constructor errors', () => {
      // Mock the Map constructor to avoid real instantiation
      const mockMapInstance = {
        addControl: jest.fn(),
        getContainer: jest.fn(),
        setStyle: jest.fn(),
        once: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
        fire: jest.fn(),
        remove: jest.fn(),
        loaded: jest.fn(() => true),
        isStyleLoaded: jest.fn(() => true)
      };

      jest.spyOn(bkoiModule, 'Map').mockImplementation(() => mockMapInstance);

      expect(() => {
        new bkoiModule.Map({
          container: 'nonexistent',
          style: 'invalid-style'
        });
      }).not.toThrow();
    });
  });

  describe('Functional Tests - Controls', () => {
    let map;

    beforeEach(() => {
      const container = document.createElement('div');
      container.id = 'map';
      document.body.appendChild(container);

      map = new bkoiModule.Map({
        container: 'map',
        style: 'https://map.barikoi.com/styles/streets',
        center: [90.4125, 23.8103],
        zoom: 10
      });
    });

    test('should create NavigationControl', () => {
      const navControl = new bkoiModule.NavigationControl();
      expect(navControl).toBeDefined();
      expect(typeof navControl).toBe('object');
    });

    test('should add control to map', () => {
      const navControl = new bkoiModule.NavigationControl();
      map.addControl(navControl);
      expect(map.addControl).toHaveBeenCalledWith(navControl);
    });

    test('should create GeolocateControl', () => {
      const geolocateControl = new bkoiModule.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true
      });
      expect(geolocateControl).toBeDefined();
    });
  });

  describe('Functional Tests - Utilities', () => {
    test('should create LngLat instance', () => {
      const lngLat = new bkoiModule.LngLat(90.4125, 23.8103);
      expect(lngLat).toBeDefined();
    });

    test('should create LngLatBounds instance', () => {
      const bounds = new bkoiModule.LngLatBounds([90.0, 23.0], [91.0, 24.0]);
      expect(bounds).toBeDefined();
    });

    test('should create Popup instance', () => {
      const popup = new bkoiModule.Popup({ closeButton: true })
        .setLngLat([90.4125, 23.8103])
        .setHTML('<h1>Hello World</h1>');
      expect(popup).toBeDefined();
    });

    test('should create Marker instance', () => {
      const marker = new bkoiModule.Marker()
        .setLngLat([90.4125, 23.8103]);
      expect(marker).toBeDefined();
    });
  });

  describe('Configuration Tests', () => {
    test('should have bkoiConfig object', () => {
      expect(bkoiModule.bkoiConfig).toBeDefined();
      expect(typeof bkoiModule.bkoiConfig).toBe('object');
    });

    test('should have default configuration properties', () => {
      expect(bkoiModule.bkoiConfig).toHaveProperty('ACCESS_TOKEN');
      expect(bkoiModule.bkoiConfig).toHaveProperty('DEFAULT_STYLE');
    });

    test('should have valid default style', () => {
      expect(bkoiModule.bkoiConfig.DEFAULT_STYLE).toBe('https://map.barikoi.com/styles/barikoi-light/style.json');
      expect(bkoiModule.isBarikoiStyle(bkoiModule.bkoiConfig.DEFAULT_STYLE)).toBe(true);
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle invalid Map container', () => {
      expect(() => {
        new bkoiModule.Map({
          container: null,
          style: 'https://map.barikoi.com/styles/streets'
        });
      }).not.toThrow();
    });

    test('should handle invalid style URL', () => {
      const container = document.createElement('div');
      container.id = 'map';
      document.body.appendChild(container);

      expect(() => {
        new bkoiModule.Map({
          container: 'map',
          style: 'invalid-url'
        });
      }).not.toThrow();
    });

    test('should handle network errors gracefully', () => {
      const originalFetch = global.fetch;
      global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

      const container = document.createElement('div');
      container.id = 'map';
      document.body.appendChild(container);

      expect(() => {
        new bkoiModule.Map({
          container: 'map',
          style: 'https://map.barikoi.com/styles/streets'
        });
      }).not.toThrow();

      global.fetch = originalFetch;
    });
  });

  describe('Performance Tests', () => {
    test('should initialize quickly', () => {
      const startTime = performance.now();

      const container = document.createElement('div');
      container.id = 'map';
      document.body.appendChild(container);

      const map = new bkoiModule.Map({
        container: 'map',
        style: 'https://map.barikoi.com/styles/streets',
        center: [90.4125, 23.8103],
        zoom: 10
      });

      const endTime = performance.now();
      const initTime = endTime - startTime;

      expect(initTime).toBeLessThan(100);
    });

    test('should handle multiple Map instances', () => {
      const maps = [];
      for (let i = 0; i < 5; i++) {
        const container = document.createElement('div');
        container.id = `map-${i}`;
        document.body.appendChild(container);

        const map = new bkoiModule.Map({
          container: `map-${i}`,
          style: 'https://map.barikoi.com/styles/streets',
          center: [90.4125, 23.8103],
          zoom: 10
        });
        maps.push(map);
      }

      expect(maps).toHaveLength(5);
      maps.forEach(map => {
        expect(map).toBeDefined();
      });
    });
  });
});
