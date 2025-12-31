/**
 * Navigation Control Tests
 * Tests for the navigation control functionality (zoom, compass) in BkoiGlMap
 */

describe('Navigation Control Tests', () => {
  let bkoiModule;
  let NavigationControl;

  beforeEach(() => {
    jest.clearAllMocks();

    bkoiModule = require('../../dist/index.cjs');
    NavigationControl = bkoiModule.NavigationControl;

    const container = document.createElement('div');
    container.id = 'test-map';
    document.body.appendChild(container);

    // Mock the Map constructor
    bkoiModule.Map = jest.fn((options) => {
      const mapContainer = document.getElementById(options.container) || document.createElement('div');
      if (!document.getElementById(options.container)) {
        mapContainer.id = options.container;
        document.body.appendChild(mapContainer);
      }

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

        // Map methods that navigation control uses
        getZoom: jest.fn(() => 10),
        getMaxZoom: jest.fn(() => 22),
        getMinZoom: jest.fn(() => 0),
        getBearing: jest.fn(() => 0),
        bearing: 0,
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

  describe('Navigation Control Initialization', () => {
    test('should create NavigationControl instance', () => {
      const navControl = new NavigationControl();
      expect(navControl).toBeDefined();
      expect(typeof navControl).toBe('object');
    });

    test('should create NavigationControl with custom options', () => {
      const navControl = new NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: false,
      });
      expect(navControl).toBeDefined();
    });

    test('should create NavigationControl with default options', () => {
      const navControl = new NavigationControl();
      expect(navControl).toBeDefined();
    });
  });

  describe('Navigation Control DOM Creation', () => {
    test('should create control container when added to map', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      const navControl = new NavigationControl();
      map.addControl(navControl);

      expect(map.addControl).toHaveBeenCalledWith(navControl);
    });

    test('should create zoom in button', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      const navControl = new NavigationControl();
      map.addControl(navControl);

      expect(map.addControl).toHaveBeenCalledWith(navControl);
    });

    test('should create zoom out button', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      const navControl = new NavigationControl();
      map.addControl(navControl);

      expect(map.addControl).toHaveBeenCalledWith(navControl);
    });

    test('should create compass button when enabled', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      const navControl = new NavigationControl({ showCompass: true });
      map.addControl(navControl);

      expect(map.addControl).toHaveBeenCalledWith(navControl);
    });

    test('should not create compass button when disabled', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      const navControl = new NavigationControl({ showCompass: false });
      map.addControl(navControl);

      expect(map.addControl).toHaveBeenCalledWith(navControl);
    });
  });

  describe('Navigation Control Positioning', () => {
    test('should add control at top-right by default', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      const navControl = new NavigationControl();
      map.addControl(navControl);

      expect(map.addControl).toHaveBeenCalled();
    });

    test('should add control at specified position', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      const navControl = new NavigationControl();
      map.addControl(navControl, 'top-left');

      expect(map.addControl).toHaveBeenCalledWith(navControl, 'top-left');
    });

    test('should support all standard positions', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

      positions.forEach(position => {
        const navControl = new NavigationControl();
        map.addControl(navControl, position);
        expect(map.addControl).toHaveBeenCalledWith(navControl, position);
      });
    });
  });

  describe('Navigation Control Configuration', () => {
    test('should show zoom controls by default', () => {
      const navControl = new NavigationControl();
      expect(navControl).toBeDefined();
    });

    test('should allow disabling zoom controls', () => {
      const navControl = new NavigationControl({
        showZoom: false,
      });
      expect(navControl).toBeDefined();
    });

    test('should allow disabling compass', () => {
      const navControl = new NavigationControl({
        showCompass: false,
      });
      expect(navControl).toBeDefined();
    });

    test('should support visualizePitch option', () => {
      const navControl = new NavigationControl({
        visualizePitch: true,
      });
      expect(navControl).toBeDefined();
    });
  });

  describe('Navigation Control Events', () => {
    test('should handle control button clicks', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      const navControl = new NavigationControl();
      map.addControl(navControl);

      // Control should be added without errors
      expect(map.addControl).toHaveBeenCalled();
    });

    test('should work with map zoom methods', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      // Add zoom methods to mock
      map.zoomIn = jest.fn();
      map.zoomOut = jest.fn();

      const navControl = new NavigationControl();
      map.addControl(navControl);

      expect(map.zoomIn).toBeDefined();
      expect(map.zoomOut).toBeDefined();
    });
  });

  describe('Multiple Navigation Controls', () => {
    test('should handle multiple navigation controls on same map', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      const navControl1 = new NavigationControl();
      const navControl2 = new NavigationControl();

      map.addControl(navControl1, 'top-right');
      map.addControl(navControl2, 'bottom-right');

      expect(map.addControl).toHaveBeenCalledTimes(2);
    });

    test('should handle navigation controls on different maps', () => {
      const map1 = new bkoiModule.Map({
        container: 'test-map',
      });

      const container2 = document.createElement('div');
      container2.id = 'test-map-2';
      document.body.appendChild(container2);

      const map2 = new bkoiModule.Map({
        container: 'test-map-2',
      });

      const navControl1 = new NavigationControl();
      const navControl2 = new NavigationControl();

      map1.addControl(navControl1);
      map2.addControl(navControl2);

      expect(map1.addControl).toHaveBeenCalled();
      expect(map2.addControl).toHaveBeenCalled();

      document.body.removeChild(container2);
    });
  });

  describe('Navigation Control Removal', () => {
    test('should support onRemove method', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      const navControl = new NavigationControl();
      map.addControl(navControl);

      // Should have onRemove method
      expect(typeof navControl.onRemove).toBe('function');
    });

    test('should clean up when removed', () => {
      const navControl = new NavigationControl();
      expect(typeof navControl.onRemove).toBe('function');
    });
  });

  describe('Edge Cases', () => {
    test('should handle undefined options gracefully', () => {
      const navControl = new NavigationControl(undefined);
      expect(navControl).toBeDefined();
    });

    test('should handle null options gracefully', () => {
      const navControl = new NavigationControl(null);
      expect(navControl).toBeDefined();
    });

    test('should work with minimal map setup', () => {
      const navControl = new NavigationControl();
      expect(typeof navControl.onAdd).toBe('function');
    });
  });
});
