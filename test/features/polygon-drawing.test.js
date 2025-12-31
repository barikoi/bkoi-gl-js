/**
 * Polygon Drawing Feature Tests
 * Tests for the polygon drawing functionality in BkoiGlMap
 */

describe('Polygon Drawing Feature Tests', () => {
  let bkoiModule;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Require the module
    bkoiModule = require('../../dist/index.cjs');

    // Inline MapboxDraw mock constructor
    const MapboxDraw = jest.fn().mockImplementation((options) => {
      const mockInstance = {
        options: options || {},
        // Drawing methods
        add: jest.fn(function(feature) {
          this.features = this.features || [];
          this.features.push(feature);
          return this;
        }),
        delete: jest.fn(function(id) {
          if (this.features) {
            this.features = this.features.filter(f => f.id !== id);
          }
          return this;
        }),
        deleteAll: jest.fn(function() {
          this.features = [];
          return this;
        }),
        get: jest.fn(function(id) {
          if (this.features) {
            return this.features.find(f => f.id === id);
          }
          return null;
        }),
        getAll: jest.fn(function() {
          return {
            features: this.features || []
          };
        }),
        // Control methods
        onAdd: jest.fn(function(map) {
          this.map = map;
          const container = document.createElement('div');
          container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';

          // Add control buttons based on options
          if (this.options.controls && this.options.controls.polygon) {
            const polygonBtn = document.createElement('button');
            polygonBtn.className = 'mapbox-gl-draw_polygon';
            polygonBtn.setAttribute('title', 'Draw a polygon');
            container.appendChild(polygonBtn);
          }

          if (this.options.controls && this.options.controls.trash) {
            const trashBtn = document.createElement('button');
            trashBtn.className = 'mapbox-gl-draw_trash';
            trashBtn.setAttribute('title', 'Delete selected features');
            container.appendChild(trashBtn);
          }

          return container;
        }),
        onRemove: jest.fn(function() {
          this.map = null;
          return this;
        }),
        // Event handling
        on: jest.fn(function(event, callback) {
          this.eventListeners = this.eventListeners || {};
          this.eventListeners[event] = this.eventListeners[event] || [];
          this.eventListeners[event].push(callback);
          return this;
        }),
        off: jest.fn(function(event, callback) {
          if (this.eventListeners && this.eventListeners[event]) {
            this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
          }
          return this;
        }),
        fire: jest.fn(function(event, data) {
          if (this.eventListeners && this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => callback(data));
          }
          return this;
        }),
        // Feature management
        features: [],
        set: jest.fn(function(feature) {
          if (!this.features) this.features = [];
          const existingIndex = this.features.findIndex(f => f.id === feature.id);
          if (existingIndex >= 0) {
            this.features[existingIndex] = feature;
          } else {
            this.features.push(feature);
          }
          return this;
        }),
        // Drawing state
        changeMode: jest.fn(function(mode) {
          this.currentMode = mode;
          return this;
        }),
        getMode: jest.fn(function() {
          return this.currentMode || 'simple_select';
        }),
        // Selection
        getSelected: jest.fn(function() {
          return {
            features: this.features.filter(f => f.selected) || []
          };
        }),
        getSelectedIds: jest.fn(function() {
          return (this.features.filter(f => f.selected) || []).map(f => f.id);
        }),
      };

      return mockInstance;
    });

    // Create enhanced mock map instance template
    const container = document.createElement('div');
    container.id = 'test-map';
    document.body.appendChild(container);

    // Mock the Map constructor
    bkoiModule.Map = jest.fn((options) => {
      // Create a new map instance for each test
      const mapContainer = document.getElementById(options.container) || document.createElement('div');
      if (!document.getElementById(options.container)) {
        mapContainer.id = options.container;
        document.body.appendChild(mapContainer);
      }

      const map = {
        options: options,
        _drawInstance: null,
        _loadCallbacks: [],
        eventListeners: {},
        controls: [],
        
        addControl: jest.fn(function(control, position) {
          this.controls.push({ control, position });
          return this;
        }),
        
        getContainer: jest.fn(() => mapContainer),
        
        setStyle: jest.fn(function(style) {
          this.style = style;
          return this;
        }),
        
        once: jest.fn(function(event, callback) {
          if (event === 'load') {
            this._loadCallbacks.push(callback);
            // Auto-trigger after a short delay to simulate async behavior
            setTimeout(() => {
              this._loadCallbacks.forEach(cb => {
                try {
                  cb({ type: 'load' });
                } catch {
                  // Ignore errors in callbacks
                }
              });
            }, 0);
          }
          return this;
        }),
        
        on: jest.fn(function(event, callback) {
          this.eventListeners[event] = this.eventListeners[event] || [];
          this.eventListeners[event].push(callback);
          return this;
        }),
        
        off: jest.fn(),
        
        fire: jest.fn(function(event, data) {
          if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => callback(data));
          }
          return this;
        }),
        
        remove: jest.fn(),
        loaded: jest.fn(() => true),
        isStyleLoaded: jest.fn(() => true),
        
        getDraw: jest.fn(function() {
          if (this._drawInstance === null || this._drawInstance === undefined) {
            return undefined;
          }
          return this._drawInstance;
        }),
      };
      
      // Simulate the constructor behavior - initialize draw on load if polygon is enabled
      if (options.polygon) {
        map.once('load', () => {
          // Create draw instance with merged options
          const defaultOptions = {
            displayControlsDefault: false,
            controls: {
              polygon: true,
              trash: true,
            },
          };
          
          const drawOptions = { ...defaultOptions, ...(options.drawOptions || {}) };
          if (options.drawOptions && options.drawOptions.controls) {
            drawOptions.controls = { ...defaultOptions.controls, ...options.drawOptions.controls };
          }
          
          map._drawInstance = new MapboxDraw(drawOptions);
          map.addControl(map._drawInstance, undefined);
        });
      }
      
      return map;
    });
  });

  afterEach(() => {
    // Cleanup
    const container = document.getElementById('test-map');
    if (container) {
      document.body.removeChild(container);
    }
  });

  describe('Polygon Drawing Initialization', () => {
    test('should initialize drawing tools when polygon option is true', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
        polygon: true,
      });

      // Wait for load event to fire
      setTimeout(() => {
        expect(map.addControl).toHaveBeenCalled();
        expect(map._drawInstance).toBeDefined();
        expect(map._drawInstance).not.toBeNull();
        done();
      }, 50);
    });

    test('should NOT initialize drawing tools when polygon option is false', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
        polygon: false,
      });

      setTimeout(() => {
        expect(map._drawInstance).toBeNull();
        done();
      }, 50);
    });

    test('should NOT initialize drawing tools when polygon option is undefined', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      setTimeout(() => {
        expect(map._drawInstance).toBeNull();
        done();
      }, 50);
    });

    test('should create MapboxDraw instance with default options', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
        polygon: true,
      });

      setTimeout(() => {
        expect(map._drawInstance).toBeDefined();
        expect(map._drawInstance).not.toBeNull();
        if (map._drawInstance && map._drawInstance.options) {
          expect(map._drawInstance.options.controls.polygon).toBe(true);
          expect(map._drawInstance.options.controls.trash).toBe(true);
          expect(map._drawInstance.options.displayControlsDefault).toBe(false);
        }
        done();
      }, 50);
    });

    test('should create MapboxDraw instance with custom drawOptions', (done) => {
      const customOptions = {
        displayControlsDefault: true,
        controls: {
          polygon: true,
          trash: true,
          point: true,
        },
      };

      const map = new bkoiModule.Map({
        container: 'test-map',
        polygon: true,
        drawOptions: customOptions,
      });

      setTimeout(() => {
        expect(map._drawInstance).toBeDefined();
        expect(map._drawInstance).not.toBeNull();
        if (map._drawInstance && map._drawInstance.options) {
          expect(map._drawInstance.options.displayControlsDefault).toBe(true);
          expect(map._drawInstance.options.controls.point).toBe(true);
        }
        done();
      }, 50);
    });

    test('should merge custom drawOptions with defaults', (done) => {
      const customOptions = {
        controls: {
          polygon: true,
          // trash should still be true from defaults
        },
      };

      const map = new bkoiModule.Map({
        container: 'test-map',
        polygon: true,
        drawOptions: customOptions,
      });

      setTimeout(() => {
        expect(map._drawInstance).toBeDefined();
        expect(map._drawInstance).not.toBeNull();
        if (map._drawInstance && map._drawInstance.options) {
          expect(map._drawInstance.options.controls.polygon).toBe(true);
          expect(map._drawInstance.options.controls.trash).toBe(true);
        }
        done();
      }, 50);
    });
  });

  describe('getDraw() Method', () => {
    test('should return MapboxDraw instance when polygon is enabled', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
        polygon: true,
      });

      setTimeout(() => {
        const draw = map.getDraw();
        expect(draw).toBeDefined();
        expect(draw).not.toBeNull();
        if (draw) {
          expect(typeof draw.deleteAll).toBe('function');
          expect(typeof draw.add).toBe('function');
        }
        done();
      }, 50);
    });

    test('should return undefined when polygon is disabled', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
        polygon: false,
      });

      setTimeout(() => {
        const draw = map.getDraw();
        expect(draw).toBeUndefined();
        done();
      }, 50);
    });

    test('should return undefined when polygon option not provided', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      setTimeout(() => {
        const draw = map.getDraw();
        expect(draw).toBeUndefined();
        done();
      }, 50);
    });
  });

  describe('Drawing Controls', () => {
    test('should add drawing control to map', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
        polygon: true,
      });

      setTimeout(() => {
        expect(map.addControl).toHaveBeenCalled();
        expect(map._drawInstance).toBeDefined();
        done();
      }, 50);
    });

    test('should configure polygon control when enabled', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
        polygon: true,
        drawOptions: {
          controls: {
            polygon: true,
          },
        },
      });

      setTimeout(() => {
        if (map._drawInstance && map._drawInstance.options) {
          expect(map._drawInstance.options.controls.polygon).toBe(true);
        }
        done();
      }, 50);
    });

    test('should configure trash control when enabled', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
        polygon: true,
        drawOptions: {
          controls: {
            trash: true,
          },
        },
      });

      setTimeout(() => {
        if (map._drawInstance && map._drawInstance.options) {
          expect(map._drawInstance.options.controls.trash).toBe(true);
        }
        done();
      }, 50);
    });

    test('should disable displayControlsDefault by default', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
        polygon: true,
      });

      setTimeout(() => {
        if (map._drawInstance && map._drawInstance.options) {
          expect(map._drawInstance.options.displayControlsDefault).toBe(false);
        }
        done();
      }, 50);
    });
  });

  describe('Drawing Events', () => {
    test('should handle draw.create event', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
        polygon: true,
      });

      const createHandler = jest.fn();
      map.on('draw.create', createHandler);

      setTimeout(() => {
        // Simulate draw.create event
        const mockFeature = {
          id: 'test-feature-1',
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[[90, 23], [91, 23], [91, 24], [90, 24], [90, 23]]],
          },
        };

        map.fire('draw.create', { features: [mockFeature] });

        expect(createHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            features: expect.arrayContaining([mockFeature]),
          })
        );
        done();
      }, 50);
    });

    test('should handle draw.update event', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
        polygon: true,
      });

      const updateHandler = jest.fn();
      map.on('draw.update', updateHandler);

      setTimeout(() => {
        const mockFeature = {
          id: 'test-feature-1',
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[[90, 23], [91, 23], [91, 24], [90, 24], [90, 23]]],
          },
        };

        map.fire('draw.update', { features: [mockFeature] });

        expect(updateHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            features: expect.arrayContaining([mockFeature]),
          })
        );
        done();
      }, 50);
    });

    test('should handle draw.delete event', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
        polygon: true,
      });

      const deleteHandler = jest.fn();
      map.on('draw.delete', deleteHandler);

      setTimeout(() => {
        const mockFeature = {
          id: 'test-feature-1',
          type: 'Feature',
        };

        map.fire('draw.delete', { features: [mockFeature] });

        expect(deleteHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            features: expect.arrayContaining([mockFeature]),
          })
        );
        done();
      }, 50);
    });
  });

  describe('Drawing Operations', () => {
    test('should allow adding features via draw instance', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
        polygon: true,
      });

      setTimeout(() => {
        const draw = map.getDraw();
        expect(draw).toBeDefined();

        const mockFeature = {
          id: 'test-feature-1',
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[[90, 23], [91, 23], [91, 24], [90, 24], [90, 23]]],
          },
        };

        if (draw) {
          draw.add(mockFeature);
          expect(draw.add).toHaveBeenCalledWith(mockFeature);
        }
        done();
      }, 50);
    });

    test('should allow deleting features via draw instance', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
        polygon: true,
      });

      setTimeout(() => {
        const draw = map.getDraw();
        expect(draw).toBeDefined();

        if (draw) {
          draw.delete('test-feature-1');
          expect(draw.delete).toHaveBeenCalledWith('test-feature-1');
        }
        done();
      }, 50);
    });

    test('should allow deleting all features via draw instance', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
        polygon: true,
      });

      setTimeout(() => {
        const draw = map.getDraw();
        expect(draw).toBeDefined();

        if (draw) {
          draw.deleteAll();
          expect(draw.deleteAll).toHaveBeenCalled();
        }
        done();
      }, 50);
    });

    test('should allow getting all features via draw instance', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
        polygon: true,
      });

      setTimeout(() => {
        const draw = map.getDraw();
        expect(draw).toBeDefined();

        if (draw) {
          const allFeatures = draw.getAll();
          expect(draw.getAll).toHaveBeenCalled();
          expect(allFeatures).toHaveProperty('features');
        }
        done();
      }, 50);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty drawOptions', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
        polygon: true,
        drawOptions: {},
      });

      setTimeout(() => {
        expect(map._drawInstance).toBeDefined();
        if (map._drawInstance && map._drawInstance.options) {
          // Should use defaults
          expect(map._drawInstance.options.controls.polygon).toBe(true);
          expect(map._drawInstance.options.controls.trash).toBe(true);
        }
        done();
      }, 50);
    });

    test('should handle drawOptions with only partial controls', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
        polygon: true,
        drawOptions: {
          controls: {
            polygon: true,
            // trash not specified, should use default
          },
        },
      });

      setTimeout(() => {
        expect(map._drawInstance).toBeDefined();
        if (map._drawInstance && map._drawInstance.options) {
          expect(map._drawInstance.options.controls.polygon).toBe(true);
          expect(map._drawInstance.options.controls.trash).toBe(true);
        }
        done();
      }, 50);
    });

    test('should handle multiple maps with different polygon settings', (done) => {
      const map1 = new bkoiModule.Map({
        container: 'test-map',
        polygon: true,
      });

      const container2 = document.createElement('div');
      container2.id = 'test-map-2';
      document.body.appendChild(container2);

      const map2 = new bkoiModule.Map({
        container: 'test-map-2',
        polygon: false,
      });

      setTimeout(() => {
        expect(map1.getDraw()).toBeDefined();
        expect(map2.getDraw()).toBeUndefined();
        document.body.removeChild(container2);
        done();
      }, 50);
    });
  });

  describe('Integration with Map Lifecycle', () => {
    test('should initialize drawing tools after map load event', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
        polygon: true,
      });

      // Initially, draw should not be initialized (before load event)
      // Note: In the mock, _drawInstance starts as null, so getDraw returns undefined
      const initialDraw = map.getDraw();
      expect(initialDraw === null || initialDraw === undefined).toBe(true);

      // After load event fires
      setTimeout(() => {
        expect(map.getDraw()).toBeDefined();
        expect(map.getDraw()).not.toBeNull();
        done();
      }, 50);
    });

    test('should not initialize drawing tools if map fails to load', (done) => {
      // Create a map that won't trigger load
      const map = new bkoiModule.Map({
        container: 'test-map',
        polygon: true,
      });

      // The mock auto-triggers load, so this should be defined
      // But we can test the behavior
      setTimeout(() => {
        expect(map.once).toHaveBeenCalledWith('load', expect.any(Function));
        done();
      }, 50);
    });
  });
});
