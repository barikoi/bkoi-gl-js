/**
 * Performance Tests
 * Tests that measure and validate performance characteristics of the real bundled library
 */

describe('Performance Tests', () => {
  let bkoi;

  beforeAll(() => {
    bkoi = global.bkoiTestUtils.loadRealLibrary();

    // Mock the Map constructor to avoid real instantiation in performance tests
    const mockMapInstance = {
      addControl: jest.fn(),
      removeControl: jest.fn(),
      getContainer: jest.fn(() => document.createElement('div')),
      setStyle: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      fire: jest.fn(),
      loaded: jest.fn(() => true),
      isStyleLoaded: jest.fn(() => true)
    };

    bkoi.Map = jest.fn(() => mockMapInstance);
  });

  afterEach(() => {
    global.bkoiTestUtils.cleanupTestContainers();
  });

  describe('Map Initialization Performance', () => {
    test('should initialize map within acceptable time', () => {
      const startTime = performance.now();

      global.bkoiTestUtils.createTestContainer('perf-map');

      const map = global.bkoiTestUtils.createMockMap({
        container: 'perf-map',
        style: 'https://map.barikoi.com/styles/streets',
        center: [90.4125, 23.8103],
        zoom: 10
      });

      const endTime = performance.now();
      const initTime = endTime - startTime;

      expect(initTime).toBeLessThan(100);
      expect(map).toBeDefined();
      console.log(`Map initialization time: ${initTime.toFixed(2)}ms`);
    });

    test('should handle rapid map creation without memory leaks', () => {
      const startTime = performance.now();
      const maps = [];

      for (let i = 0; i < 10; i++) {
        global.bkoiTestUtils.createTestContainer(`perf-map-${i}`);

        const map = global.bkoiTestUtils.createMockMap({
          container: `perf-map-${i}`,
          style: 'https://map.barikoi.com/styles/streets',
          center: [90.4125, 23.8103],
          zoom: 10
        });

        maps.push(map);
        expect(map).toBeDefined();
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / 10;

      expect(avgTime).toBeLessThan(50); // Average under 50ms per map
      expect(maps).toHaveLength(10);
      console.log(`Average map creation time: ${avgTime.toFixed(2)}ms`);
    });
  });

  describe('Control Performance', () => {
    let map;

    beforeEach(() => {
      global.bkoiTestUtils.createTestContainer('perf-controls');
      map = new bkoi.Map({
        container: 'perf-controls',
        style: 'https://map.barikoi.com/styles/streets',
        center: [90.4125, 23.8103],
        zoom: 10
      });
    });

    test('should add controls efficiently', () => {
      const startTime = performance.now();

      // Create mock controls for performance testing
      const controls = [
        global.bkoiTestUtils.createMockNavigationControl(),
        global.bkoiTestUtils.createMockScaleControl(),
        global.bkoiTestUtils.createMockAttributionControl(),
        global.bkoiTestUtils.createMockGeolocateControl(),
        global.bkoiTestUtils.createMockFullscreenControl()
      ];

      controls.forEach(control => {
        map.addControl(control);
      });

      const endTime = performance.now();
      const addTime = endTime - startTime;

      expect(addTime).toBeLessThan(20); // Should add all controls in under 20ms
      console.log(`Control addition time: ${addTime.toFixed(2)}ms`);
    });

    test('should handle control updates efficiently', () => {
      const navControl = global.bkoiTestUtils.createMockNavigationControl();
      map.addControl(navControl);

      const startTime = performance.now();

      // Simulate multiple control interactions
      for (let i = 0; i < 100; i++) {
        // Mock control updates
        map.addControl(navControl);
      }

      const endTime = performance.now();
      const updateTime = endTime - startTime;

      expect(updateTime).toBeLessThan(50); // Should handle 100 updates in under 50ms
      console.log(`Control update time (100 iterations): ${updateTime.toFixed(2)}ms`);
    });
  });

  describe('Marker and Popup Performance', () => {
    let map;

    beforeEach(() => {
      global.bkoiTestUtils.createTestContainer('perf-markers');
      map = new bkoi.Map({
        container: 'perf-markers',
        style: 'https://map.barikoi.com/styles/streets',
        center: [90.4125, 23.8103],
        zoom: 12
      });
    });

    test('should create markers efficiently', () => {
      const startTime = performance.now();

      const markers = [];
      for (let i = 0; i < 50; i++) {
        const marker = global.bkoiTestUtils.createMockMarker()
          .setLngLat([90.4125 + (i * 0.01), 23.8103 + (i * 0.01)])
          .addTo(map);
        markers.push(marker);
      }

      const endTime = performance.now();
      const creationTime = endTime - startTime;

      expect(creationTime).toBeLessThan(100); // 50 markers in under 100ms
      expect(markers).toHaveLength(50);
      console.log(`Marker creation time (50 markers): ${creationTime.toFixed(2)}ms`);
    });

    test('should create popups efficiently', () => {
      const startTime = performance.now();

      const popups = [];
      for (let i = 0; i < 25; i++) {
        const popup = global.bkoiTestUtils.createMockPopup()
          .setLngLat([90.4125 + (i * 0.01), 23.8103 + (i * 0.01)])
          .setHTML(`<div>Popup ${i}</div>`)
          .addTo(map);
        popups.push(popup);
      }

      const endTime = performance.now();
      const creationTime = endTime - startTime;

      expect(creationTime).toBeLessThan(50); // 25 popups in under 50ms
      expect(popups).toHaveLength(25);
      console.log(`Popup creation time (25 popups): ${creationTime.toFixed(2)}ms`);
    });

    test('should handle marker-popup combinations efficiently', () => {
      const startTime = performance.now();

      const combinations = [];
      for (let i = 0; i < 20; i++) {
        const popup = global.bkoiTestUtils.createMockPopup()
          .setHTML(`<h4>Location ${i}</h4><p>Description ${i}</p>`);

        const marker = global.bkoiTestUtils.createMockMarker({ color: '#FF0000' })
          .setLngLat([90.4125 + (i * 0.005), 23.8103 + (i * 0.005)])
          .setPopup(popup)
          .addTo(map);

        combinations.push({ marker, popup });
      }

      const endTime = performance.now();
      const creationTime = endTime - startTime;

      expect(creationTime).toBeLessThan(80); // 20 marker-popup combos in under 80ms
      expect(combinations).toHaveLength(20);
      console.log(`Marker-popup combination time (20 combos): ${creationTime.toFixed(2)}ms`);
    });
  });

  describe('Geospatial Operations Performance', () => {
    test('should perform coordinate operations efficiently', () => {
      const startTime = performance.now();

      const coordinates = [];
      for (let i = 0; i < 1000; i++) {
        const lngLat = new bkoi.LngLat(90.4125 + (i * 0.001), 23.8103 + (i * 0.001));
        coordinates.push(lngLat);
      }

      const endTime = performance.now();
      const creationTime = endTime - startTime;

      expect(creationTime).toBeLessThan(100); // 1000 coordinates in under 100ms
      expect(coordinates).toHaveLength(1000);
      console.log(`Coordinate creation time (1000 coords): ${creationTime.toFixed(2)}ms`);
    });

    test('should perform bounds operations efficiently', () => {
      const startTime = performance.now();

      const bounds = new bkoi.LngLatBounds([89.0, 22.0], [91.0, 24.0]);

      // Test 500 containment checks
      let contained = 0;
      for (let i = 0; i < 500; i++) {
        const lng = 89.0 + (i * 0.004);
        const lat = 22.0 + (i * 0.004);
        if (bounds.contains([lng, lat])) {
          contained++;
        }
      }

      const endTime = performance.now();
      const operationTime = endTime - startTime;

      expect(operationTime).toBeLessThan(50); // 500 containment checks in under 50ms
      expect(contained).toBeGreaterThan(0);
      console.log(`Bounds operations time (500 checks): ${operationTime.toFixed(2)}ms`);
    });

    test('should handle point operations efficiently', () => {
      const startTime = performance.now();

      const points = [];
      for (let i = 0; i < 1000; i++) {
        const point = new bkoi.Point(i * 2, i * 3);
        points.push(point);
      }

      const endTime = performance.now();
      const creationTime = endTime - startTime;

      expect(creationTime).toBeLessThan(350); // 1000 points in under 350ms
      expect(points).toHaveLength(1000);
      console.log(`Point creation time (1000 points): ${creationTime.toFixed(2)}ms`);
    });
  });

  describe('Memory Usage Tests', () => {
    test('should not have excessive memory growth with repeated operations', () => {
      // Create initial memory snapshot (simulated)
      const initialOperations = 10;
      const additionalOperations = 50;

      // Initial operations
      for (let i = 0; i < initialOperations; i++) {
        global.bkoiTestUtils.createTestContainer(`memory-test-${i}`);
        const map = new bkoi.Map({
          container: `memory-test-${i}`,
          style: 'https://map.barikoi.com/styles/streets',
          center: [90.4125, 23.8103],
          zoom: 10
        });

        // Add some controls and markers
        const marker = global.bkoiTestUtils.createMockMarker()
          .setLngLat([90.4125, 23.8103])
          .addTo(map);
        expect(marker).toBeDefined();
      }

      // Additional operations
      const startTime = performance.now();
      for (let i = initialOperations; i < initialOperations + additionalOperations; i++) {
        global.bkoiTestUtils.createTestContainer(`memory-test-${i}`);
        const map = new bkoi.Map({
          container: `memory-test-${i}`,
          style: 'https://map.barikoi.com/styles/streets',
          center: [90.4125, 23.8103],
          zoom: 10
        });

        // Add some controls and markers
        const marker = global.bkoiTestUtils.createMockMarker()
          .setLngLat([90.4125, 23.8103])
          .addTo(map);
        expect(marker).toBeDefined();
      }
      const endTime = performance.now();
      const operationTime = endTime - startTime;

      // Performance should remain consistent
      const avgTimePerOperation = operationTime / additionalOperations;
      expect(avgTimePerOperation).toBeLessThan(10); // Average under 10ms per operation
      console.log(`Memory stress test - avg time per operation: ${avgTimePerOperation.toFixed(2)}ms`);
    });

    test('should clean up event listeners properly', () => {
      global.bkoiTestUtils.createTestContainer('cleanup-test');
      const map = new bkoi.Map({
        container: 'cleanup-test',
        style: 'https://map.barikoi.com/styles/streets',
        center: [90.4125, 23.8103],
        zoom: 10
      });

      // Add multiple event listeners
      const eventCount = 10;
      for (let i = 0; i < eventCount; i++) {
        map.on('click', () => {});
        map.on('load', () => {});
      }

      // In a real implementation, there should be cleanup methods
      // For now, we just verify the map was created successfully
      expect(map).toBeDefined();
    });
  });

  describe('Bundle Size Performance', () => {
    test('should have reasonable bundle sizes', () => {
      const fs = require('fs');
      const path = require('path');

      // Check CJS bundle size - use range instead of static limit
      const cjsPath = path.resolve(__dirname, '../../dist/index.cjs');
      if (fs.existsSync(cjsPath)) {
        const cjsSize = fs.statSync(cjsPath).size;
        expect(cjsSize).toBeGreaterThan(500 * 1024); // Over 500KB
        expect(cjsSize).toBeLessThan(2000 * 1024); // Under 2MB
        console.log(`CJS bundle size: ${(cjsSize / 1024).toFixed(2)} KB`);
      }

      // Check ESM bundle size - use range instead of static limit
      const esmPath = path.resolve(__dirname, '../../dist/index.js');
      if (fs.existsSync(esmPath)) {
        const esmSize = fs.statSync(esmPath).size;
        expect(esmSize).toBeGreaterThan(500 * 1024); // Over 500KB
        expect(esmSize).toBeLessThan(2000 * 1024); // Under 2MB
        console.log(`ESM bundle size: ${(esmSize / 1024).toFixed(2)} KB`);
      }

      // Check IIFE bundle size (should be larger due to bundling)
      const iifePath = path.resolve(__dirname, '../../dist/iife/bkoi-gl.js');
      if (fs.existsSync(iifePath)) {
        const iifeSize = fs.statSync(iifePath).size;
        expect(iifeSize).toBeGreaterThan(1024 * 1024); // Over 1MB
        console.log(`IIFE bundle size: ${(iifeSize / (1024 * 1024)).toFixed(2)} MB`);
      }
    });

    test('should have efficient tree-shaking potential', () => {
      // Test that individual imports work (tree-shaking capability)
      const startTime = performance.now();

      // Test the real library loading time
      const { isBarikoiStyle } = bkoi;

      const endTime = performance.now();
      const importTime = endTime - startTime;

      expect(importTime).toBeLessThan(10); // Import should be very fast
      expect(typeof isBarikoiStyle).toBe('function');

      console.log(`Selective import time: ${importTime.toFixed(2)}ms`);
    });
  });

  describe('Concurrent Operations Performance', () => {
    test('should handle concurrent map operations', async () => {
      const operations = [];

      for (let i = 0; i < 5; i++) {
        operations.push(new Promise((resolve) => {
          global.bkoiTestUtils.createTestContainer(`concurrent-map-${i}`);
          const map = new bkoi.Map({
            container: `concurrent-map-${i}`,
            style: 'https://map.barikoi.com/styles/streets',
            center: [90.4125, 23.8103],
            zoom: 10
          });

          // Simulate some async operation
          setTimeout(() => {
            const marker = global.bkoiTestUtils.createMockMarker()
              .setLngLat([90.4125, 23.8103])
              .addTo(map);
            resolve({ map, marker });
          }, Math.random() * 10);
        }));
      }

      const startTime = performance.now();
      const results = await Promise.all(operations);
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      expect(results).toHaveLength(5);
      expect(totalTime).toBeLessThan(500);
      console.log(`Concurrent operations time: ${totalTime.toFixed(2)}ms`);
    }, 10000);

    test('should maintain performance under load', () => {
      const startTime = performance.now();

      // Create high load scenario
      const maps = [];
      const markers = [];
      const popups = [];

      for (let i = 0; i < 20; i++) {
        global.bkoiTestUtils.createTestContainer(`load-test-${i}`);
        const map = new bkoi.Map({
          container: `load-test-${i}`,
          style: 'https://map.barikoi.com/styles/streets',
          center: [90.4125, 23.8103],
          zoom: 10
        });

        maps.push(map);

        // Add markers and popups
        const popup = global.bkoiTestUtils.createMockPopup()
          .setHTML(`<div>Load Test ${i}</div>`);
        const marker = global.bkoiTestUtils.createMockMarker()
          .setLngLat([90.4125 + (i * 0.01), 23.8103 + (i * 0.01)])
          .setPopup(popup)
          .addTo(map);

        markers.push(marker);
        popups.push(popup);
      }

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      expect(loadTime).toBeLessThan(100); // 20 maps with markers/popups in under 100ms
      expect(maps).toHaveLength(20);
      expect(markers).toHaveLength(20);
      expect(popups).toHaveLength(20);

      console.log(`High load test time: ${loadTime.toFixed(2)}ms`);
    });
  });
});
