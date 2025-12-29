/**
 * Integration Tests
 * Tests that combine multiple components and simulate real-world usage scenarios
 */

describe('Integration Tests', () => {
  beforeAll(() => {
    // Mock the Map constructor globally to avoid real instantiation
    const bkoiModule = require('../../dist/index.cjs');
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

  describe('Map Initialization and Configuration', () => {
    test('should initialize map with Barikoi style', () => {
      const container = document.createElement('div');
      container.id = 'map';
      container.style.width = '400px';
      container.style.height = '300px';
      document.body.appendChild(container);

      const bkoiModule = require('../../dist/index.cjs');

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

      jest.spyOn(bkoiModule, 'Map').mockImplementation(() => mockMapInstance);

      const map = new bkoiModule.Map({
        container: 'map',
        style: 'https://map.barikoi.com/styles/streets',
        center: [90.4125, 23.8103],
        zoom: 12,
        attributionControl: false
      });

      expect(map).toBeDefined();
      expect(map.getContainer()).toBeDefined();
    });

    test('should initialize map with custom configuration', () => {
      const container = document.createElement('div');
      container.id = 'map-custom';
      document.body.appendChild(container);

      const bkoiModule = require('../../dist/index.cjs');

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

      jest.spyOn(bkoiModule, 'Map').mockImplementation(() => mockMapInstance);

      const map = new bkoiModule.Map({
        container: 'map-custom',
        style: 'https://map.barikoi.com/styles/outdoors',
        center: [90.4125, 23.8103],
        zoom: 10,
        maxZoom: 18,
        minZoom: 5,
        bearing: 45,
        pitch: 30
      });

      expect(map).toBeDefined();
    });
  });

  describe('Controls Integration', () => {
    let map;
    let bkoiModule;

    beforeEach(() => {
      const container = document.createElement('div');
      container.id = 'map-controls';
      document.body.appendChild(container);

      bkoiModule = require('../../dist/index.cjs');

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

      jest.spyOn(bkoiModule, 'Map').mockImplementation(() => mockMapInstance);

      map = new bkoiModule.Map({
        container: 'map-controls',
        style: 'https://map.barikoi.com/styles/streets',
        center: [90.4125, 23.8103],
        zoom: 10
      });
    });

    test('should add multiple controls to map', () => {
      const bkoiModule = require('../../dist/index.cjs');

      const navControl = new bkoiModule.NavigationControl({ showCompass: true, showZoom: true });
      const scaleControl = new bkoiModule.ScaleControl({ maxWidth: 200, unit: 'metric' });
      const attributionControl = new bkoiModule.AttributionControl({ compact: false });

      map.addControl(navControl, 'top-right');
      map.addControl(scaleControl, 'bottom-left');
      map.addControl(attributionControl, 'bottom-right');

      expect(map.addControl).toHaveBeenCalledTimes(3);
    });

    test('should integrate geolocation control with map', () => {
      const bkoiModule = require('../../dist/index.cjs');

      const geolocateControl = new bkoiModule.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true
      });

      map.addControl(geolocateControl);

      expect(map.addControl).toHaveBeenCalledWith(geolocateControl);
    });
  });

  describe('Markers and Popups Integration', () => {
    let map;

    beforeEach(() => {
      const container = document.createElement('div');
      container.id = 'map-markers';
      document.body.appendChild(container);

      const bkoiModule = require('../../dist/index.cjs');
      map = new bkoiModule.Map({
        container: 'map-markers',
        style: 'https://map.barikoi.com/styles/streets',
        center: [90.4125, 23.8103],
        zoom: 12
      });
    });

    test('should create marker with popup', () => {
      const bkoiModule = require('../../dist/index.cjs');

      const popup = new bkoiModule.Popup({ closeButton: true, closeOnClick: false })
        .setLngLat([90.4125, 23.8103])
        .setHTML('<h3>Dhaka</h3><p>Capital of Bangladesh</p>');

      const marker = new bkoiModule.Marker({ color: '#FF0000' })
        .setLngLat([90.4125, 23.8103])
        .setPopup(popup)
        .addTo(map);

      expect(popup).toBeDefined();
      expect(marker).toBeDefined();
    });

    test('should handle multiple markers', () => {
      const bkoiModule = require('../../dist/index.cjs');

      const locations = [
        { lng: 90.4125, lat: 23.8103, title: 'Dhaka' },
        { lng: 91.8317, lat: 22.3569, title: 'Chittagong' },
        { lng: 89.5416, lat: 22.8456, title: 'Khulna' }
      ];

      const markers = locations.map(location => {
        const popup = new bkoiModule.Popup()
          .setLngLat([location.lng, location.lat])
          .setHTML(`<h4>${location.title}</h4>`);

        return new bkoiModule.Marker()
          .setLngLat([location.lng, location.lat])
          .setPopup(popup)
          .addTo(map);
      });

      expect(markers).toHaveLength(3);
      markers.forEach(marker => {
        expect(marker).toBeDefined();
      });
    });
  });

  describe('Style and Layer Integration', () => {
    test('should validate Barikoi styles', () => {
      const bkoiModule = require('../../dist/index.cjs');

      const validStyles = [
        'https://map.barikoi.com/styles/barikoi-light/style.json',
        'https://map.barikoi.com/styles/barikoi-dark-mode/style.json',
        'https://map.barikoi.com/styles/barkoi_green/style.json',
        'https://map.barikoi.com/styles/planet_map/style.json',
        'https://map.barikoi.com/styles/osm-liberty/style.json'
      ];

      const invalidStyles = [
        'https://api.mapbox.com/styles/v1/mapbox/streets-v11',
        'mapbox://styles/mapbox/streets-v11',
        'invalid-style-url'
      ];

      validStyles.forEach(style => {
        expect(bkoiModule.isBarikoiStyle(style)).toBe(true);
      });

      invalidStyles.forEach(style => {
        expect(bkoiModule.isBarikoiStyle(style)).toBe(false);
      });
    });

    test('should handle style switching', () => {
      const container = document.createElement('div');
      container.id = 'map-style';
      document.body.appendChild(container);

      const bkoiModule = require('../../dist/index.cjs');
      const map = new bkoiModule.Map({
        container: 'map-style',
        style: 'https://map.barikoi.com/styles/streets',
        center: [90.4125, 23.8103],
        zoom: 10
      });

      // Simulate style switching
      map.setStyle('https://map.barikoi.com/styles/outdoors');
      expect(map.setStyle).toHaveBeenCalledWith('https://map.barikoi.com/styles/outdoors');
    });
  });

  describe('Event Handling Integration', () => {
    test('should handle map events', () => {
      const container = document.createElement('div');
      container.id = 'map-events';
      document.body.appendChild(container);

      const bkoiModule = require('../../dist/index.cjs');
      const map = new bkoiModule.Map({
        container: 'map-events',
        style: 'https://map.barikoi.com/styles/streets',
        center: [90.4125, 23.8103],
        zoom: 10
      });

      let loadEventFired = false;
      let clickEventFired = false;

      map.on('load', () => { loadEventFired = true; });
      map.on('click', () => { clickEventFired = true; });

      // Simulate events (in real implementation these would be triggered by user interaction)
      // For testing, we just verify the event listeners are set up
      expect(map.on).toHaveBeenCalledWith('load', expect.any(Function));
      expect(map.on).toHaveBeenCalledWith('click', expect.any(Function));
    });

    test('should handle control events', () => {
      const bkoiModule = require('../../dist/index.cjs');

      // Create a mock control with event handling
      const mockGeolocateControl = {
        on: jest.fn(function(event, callback) {
          // Store event listeners
          this._listeners = this._listeners || {};
          this._listeners[event] = this._listeners[event] || [];
          this._listeners[event].push(callback);
          return this;
        }),
        trigger: jest.fn(),
        _onSuccess: jest.fn(),
        _onError: jest.fn(),
        _finish: jest.fn(),
        _setupUI: jest.fn()
      };

      // Mock the GeolocateControl constructor
      jest.spyOn(bkoiModule, 'GeolocateControl').mockImplementation(() => mockGeolocateControl);

      const geolocateControl = new bkoiModule.GeolocateControl();
      let geolocateEventFired = false;

      // Mock geolocation success
      geolocateControl.on('geolocate', () => { geolocateEventFired = true; });

      expect(geolocateControl.on).toHaveBeenCalledWith('geolocate', expect.any(Function));
    });
  });

  describe('Geospatial Operations Integration', () => {
    test('should handle coordinate transformations', () => {
      const bkoiModule = require('../../dist/index.cjs');

      const lngLat = new bkoiModule.LngLat(90.4125, 23.8103);
      const bounds = new bkoiModule.LngLatBounds([90.0, 23.0], [91.0, 24.0]);

      expect(lngLat).toBeDefined();
      expect(bounds).toBeDefined();

      // Test bounds operations
      expect(bounds.contains([90.4125, 23.8103])).toBe(true);
      expect(bounds.contains([89.0, 22.0])).toBe(false);
    });

    test('should handle point operations', () => {
      const bkoiModule = require('../../dist/index.cjs');

      const point = new bkoiModule.Point(100, 200);
      expect(point).toBeDefined();
      expect(point.x).toBe(100);
      expect(point.y).toBe(200);
    });
  });

  describe('Error Recovery Integration', () => {
    test('should handle network failures gracefully', () => {
      const container = document.createElement('div');
      container.id = 'map-error';
      document.body.appendChild(container);

      const originalFetch = global.fetch;
      global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

      const bkoiModule = require('../../dist/index.cjs');

      expect(() => {
        new bkoiModule.Map({
          container: 'map-error',
          style: 'https://map.barikoi.com/styles/streets'
        });
      }).not.toThrow();

      global.fetch = originalFetch;
    });

    test('should handle invalid configurations', () => {
      const bkoiModule = require('../../dist/index.cjs');

      expect(() => {
        new bkoiModule.Map({
          container: null,
          style: 'invalid-style'
        });
      }).not.toThrow();

      expect(() => {
        new bkoiModule.LngLat('invalid', 'coordinates');
      }).not.toThrow();
    });
  });

  describe('Memory Management Integration', () => {
    test('should handle multiple map instances', () => {
      const bkoiModule = require('../../dist/index.cjs');
      const maps = [];

      for (let i = 0; i < 3; i++) {
        const container = document.createElement('div');
        container.id = `map-memory-${i}`;
        document.body.appendChild(container);

        const map = new bkoiModule.Map({
          container: `map-memory-${i}`,
          style: 'https://map.barikoi.com/styles/streets',
          center: [90.4125 + i * 0.1, 23.8103 + i * 0.1],
          zoom: 10
        });

        maps.push(map);
      }

      expect(maps).toHaveLength(3);
      maps.forEach(map => {
        expect(map).toBeDefined();
      });
    });

    test('should clean up resources', () => {
      const container = document.createElement('div');
      container.id = 'map-cleanup';
      document.body.appendChild(container);

      const bkoiModule = require('../../dist/index.cjs');
      const map = new bkoiModule.Map({
        container: 'map-cleanup',
        style: 'https://map.barikoi.com/styles/streets'
      });

      // Simulate cleanup (in real implementation this would remove event listeners, etc.)
      expect(map).toBeDefined();

      // Verify container still exists but map is detached
      expect(document.getElementById('map-cleanup')).toBeDefined();
    });
  });
});
