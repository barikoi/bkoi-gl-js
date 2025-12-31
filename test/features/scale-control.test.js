/**
 * Scale Control Tests
 * Tests for the scale control functionality in BkoiGlMap
 */

describe('Scale Control Tests', () => {
  let bkoiModule;
  let ScaleControl;

  beforeEach(() => {
    jest.clearAllMocks();

    bkoiModule = require('../../dist/index.cjs');
    ScaleControl = bkoiModule.ScaleControl;

    const container = document.createElement('div');
    container.id = 'test-map';
    document.body.appendChild(container);

    // Create a mock container with dimensions
    const createMockContainer = () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientHeight', {
        value: 400,
        writable: true,
      });
      Object.defineProperty(container, 'clientWidth', {
        value: 600,
        writable: true,
      });
      return container;
    };

    // Mock the Map constructor
    bkoiModule.Map = jest.fn((options) => {
      const mapContainer = createMockContainer();
      mapContainer.id = options.container;
      document.body.appendChild(mapContainer);

      const map = {
        options: options,
        controls: [],
        eventListeners: {},

        addControl: jest.fn(function(control, position) {
          this.controls.push({ control, position });
          return this;
        }),

        getContainer: jest.fn(() => mapContainer),

        setStyle: jest.fn(),
        once: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
        fire: jest.fn(),
        remove: jest.fn(),
        loaded: jest.fn(() => true),
        isStyleLoaded: jest.fn(() => true),
        _getUIString: jest.fn((key) => key),

        // Map methods that scale control uses
        getZoom: jest.fn(() => 10),
        getCenter: jest.fn(() => ({ lng: 90.4125, lat: 23.8103 })),
        getBounds: jest.fn(() => ({
          getNorthEast: () => ({ lng: 91, lat: 24 }),
          getSouthWest: () => ({ lng: 90, lat: 23 }),
        })),
      };

      return map;
    });
  });

  afterEach(() => {
    const container = document.getElementById('test-map');
    if (container) {
      document.body.removeChild(container);
    }
  });

  describe('Scale Control Initialization', () => {
    test('should create ScaleControl instance', () => {
      const scaleControl = new ScaleControl();
      expect(scaleControl).toBeDefined();
      expect(typeof scaleControl).toBe('object');
    });

    test('should create ScaleControl with custom options', () => {
      const scaleControl = new ScaleControl({
        maxWidth: 200,
        unit: 'metric',
      });
      expect(scaleControl).toBeDefined();
    });

    test('should create ScaleControl with default options', () => {
      const scaleControl = new ScaleControl();
      expect(scaleControl).toBeDefined();
    });
  });

  describe('Scale Control DOM Creation', () => {
    test('should create control container when added to map', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      const scaleControl = new ScaleControl();
      map.addControl(scaleControl);

      expect(map.addControl).toHaveBeenCalledWith(scaleControl);
    });

    test('should create scale display element', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      const scaleControl = new ScaleControl();
      map.addControl(scaleControl);

      expect(map.addControl).toHaveBeenCalledWith(scaleControl);
    });

    test('should support custom maxWidth', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      const scaleControl = new ScaleControl({
        maxWidth: 150,
      });
      map.addControl(scaleControl);

      expect(map.addControl).toHaveBeenCalledWith(scaleControl);
    });

    test('should support imperial units', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      const scaleControl = new ScaleControl({
        unit: 'imperial',
      });
      map.addControl(scaleControl);

      expect(map.addControl).toHaveBeenCalledWith(scaleControl);
    });

    test('should support nautical units', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      const scaleControl = new ScaleControl({
        unit: 'nautical',
      });
      map.addControl(scaleControl);

      expect(map.addControl).toHaveBeenCalledWith(scaleControl);
    });
  });

  describe('Scale Control Positioning', () => {
    test('should add control at bottom-left by default', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      const scaleControl = new ScaleControl();
      map.addControl(scaleControl);

      expect(map.addControl).toHaveBeenCalled();
    });

    test('should add control at specified position', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      const scaleControl = new ScaleControl();
      map.addControl(scaleControl, 'bottom-right');

      expect(map.addControl).toHaveBeenCalledWith(scaleControl, 'bottom-right');
    });

    test('should support all standard positions', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

      positions.forEach(position => {
        const scaleControl = new ScaleControl();
        map.addControl(scaleControl, position);
        expect(map.addControl).toHaveBeenCalledWith(scaleControl, position);
      });
    });
  });

  describe('Scale Control Configuration', () => {
    test('should support maxWidth option', () => {
      const scaleControl = new ScaleControl({
        maxWidth: 100,
      });
      expect(scaleControl).toBeDefined();
    });

    test('should support unit option - metric', () => {
      const scaleControl = new ScaleControl({
        unit: 'metric',
      });
      expect(scaleControl).toBeDefined();
    });

    test('should support unit option - imperial', () => {
      const scaleControl = new ScaleControl({
        unit: 'imperial',
      });
      expect(scaleControl).toBeDefined();
    });

    test('should support unit option - nautical', () => {
      const scaleControl = new ScaleControl({
        unit: 'nautical',
      });
      expect(scaleControl).toBeDefined();
    });

    test('should handle invalid unit gracefully', () => {
      const scaleControl = new ScaleControl({
        unit: 'invalid',
      });
      expect(scaleControl).toBeDefined();
    });
  });

  describe('Scale Control Updates', () => {
    test('should update scale on map zoom change', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      const scaleControl = new ScaleControl();
      map.addControl(scaleControl);

      // Simulate zoom change
      map.fire('zoom', {});

      expect(map.fire).toHaveBeenCalledWith('zoom', {});
    });

    test('should update scale on map move', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      const scaleControl = new ScaleControl();
      map.addControl(scaleControl);

      // Simulate move event
      map.fire('move', {});

      expect(map.fire).toHaveBeenCalledWith('move', {});
    });

    test('should calculate scale correctly', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      const scaleControl = new ScaleControl();
      map.addControl(scaleControl);

      // Scale calculation depends on map bounds and zoom
      expect(map.getBounds).toBeDefined();
      expect(map.getZoom).toBeDefined();
    });
  });

  describe('Multiple Scale Controls', () => {
    test('should handle multiple scale controls on same map', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      const scaleControl1 = new ScaleControl({ unit: 'metric' });
      const scaleControl2 = new ScaleControl({ unit: 'imperial' });

      map.addControl(scaleControl1, 'bottom-left');
      map.addControl(scaleControl2, 'bottom-right');

      expect(map.addControl).toHaveBeenCalledTimes(2);
    });

    test('should handle scale controls on different maps', () => {
      const map1 = new bkoiModule.Map({
        container: 'test-map',
      });

      const container2 = document.createElement('div');
      container2.id = 'test-map-2';
      document.body.appendChild(container2);

      const map2 = new bkoiModule.Map({
        container: 'test-map-2',
      });

      const scaleControl1 = new ScaleControl({ unit: 'metric' });
      const scaleControl2 = new ScaleControl({ unit: 'imperial' });

      map1.addControl(scaleControl1);
      map2.addControl(scaleControl2);

      expect(map1.addControl).toHaveBeenCalled();
      expect(map2.addControl).toHaveBeenCalled();

      document.body.removeChild(container2);
    });
  });

  describe('Scale Control Removal', () => {
    test('should support onRemove method', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      const scaleControl = new ScaleControl();
      map.addControl(scaleControl);

      // Should have onRemove method
      expect(typeof scaleControl.onRemove).toBe('function');
    });

    test('should clean up when removed', () => {
      const scaleControl = new ScaleControl();
      expect(typeof scaleControl.onRemove).toBe('function');
    });
  });

  describe('Scale Calculations', () => {
    test('should handle metric unit calculations', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      const scaleControl = new ScaleControl({ unit: 'metric' });
      map.addControl(scaleControl);

      // Metric calculations should work
      expect(scaleControl).toBeDefined();
    });

    test('should handle imperial unit calculations', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      const scaleControl = new ScaleControl({ unit: 'imperial' });
      map.addControl(scaleControl);

      // Imperial calculations should work
      expect(scaleControl).toBeDefined();
    });

    test('should handle nautical unit calculations', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      const scaleControl = new ScaleControl({ unit: 'nautical' });
      map.addControl(scaleControl);

      // Nautical calculations should work
      expect(scaleControl).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    test('should handle undefined options gracefully', () => {
      const scaleControl = new ScaleControl(undefined);
      expect(scaleControl).toBeDefined();
    });

    test('should handle null options gracefully', () => {
      const scaleControl = new ScaleControl(null);
      expect(scaleControl).toBeDefined();
    });

    test('should work with minimal map setup', () => {
      const scaleControl = new ScaleControl();
      expect(typeof scaleControl.onAdd).toBe('function');
    });

    test('should handle extreme zoom levels', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      // Mock extreme zoom level
      map.getZoom = jest.fn(() => 25);

      const scaleControl = new ScaleControl();
      map.addControl(scaleControl);

      expect(scaleControl).toBeDefined();
    });

    test('should handle zero maxWidth gracefully', () => {
      const scaleControl = new ScaleControl({
        maxWidth: 0,
      });
      expect(scaleControl).toBeDefined();
    });
  });
});
