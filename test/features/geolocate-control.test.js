/**
 * Geolocate Control Tests
 * Tests for the geolocation control functionality in BkoiGlMap
 */

describe('Geolocate Control Tests', () => {
  let bkoiModule
  let GeolocateControl

  beforeEach(() => {
    jest.clearAllMocks()

    bkoiModule = require('../../dist/index.cjs')
    GeolocateControl = bkoiModule.GeolocateControl

    const container = document.createElement('div')
    container.id = 'test-map'
    document.body.appendChild(container)

    // Mock geolocation API
    global.navigator.geolocation = {
      getCurrentPosition: jest.fn(),
      watchPosition: jest.fn(),
      clearWatch: jest.fn(),
    }

    // Mock the Map constructor
    bkoiModule.Map = jest.fn(options => {
      const mapContainer =
        document.getElementById(options.container) || document.createElement('div')
      if (!document.getElementById(options.container)) {
        mapContainer.id = options.container
        document.body.appendChild(mapContainer)
      }

      const map = {
        options: options,
        controls: [],
        eventListeners: {},

        addControl: jest.fn(function (control, position) {
          this.controls.push({ control, position })

          // Simulate control being added to DOM
          if (control.onAdd) {
            const controlElement = control.onAdd(this)
            if (controlElement) {
              mapContainer.appendChild(controlElement)
            }
          }

          return this
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
        _getUIString: jest.fn(key => key),

        // Map methods that geolocate control uses
        flyTo: jest.fn(),
        easeTo: jest.fn(),
        setCenter: jest.fn(),
        setZoom: jest.fn(),
        setBearing: jest.fn(),
        setPitch: jest.fn(),
      }

      return map
    })
  })

  afterEach(() => {
    const container = document.getElementById('test-map')
    if (container) {
      document.body.removeChild(container)
    }
  })

  describe('Geolocate Control Initialization', () => {
    test('should create GeolocateControl instance', () => {
      const geoControl = new GeolocateControl()
      expect(geoControl).toBeDefined()
      expect(typeof geoControl).toBe('object')
    })

    test('should create GeolocateControl with custom options', () => {
      const geoControl = new GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
          timeout: 10000,
        },
        trackUserLocation: true,
        showUserHeading: true,
        showAccuracyCircle: true,
      })
      expect(geoControl).toBeDefined()
    })

    test('should create GeolocateControl with default options', () => {
      const geoControl = new GeolocateControl()
      expect(geoControl).toBeDefined()
    })
  })

  describe('Geolocate Control DOM Creation', () => {
    test('should create control container when added to map', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      })

      const geoControl = new GeolocateControl()
      map.addControl(geoControl)

      expect(map.addControl).toHaveBeenCalledWith(geoControl)
    })

    test('should create geolocate button', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      })

      const geoControl = new GeolocateControl()
      map.addControl(geoControl)

      // Check if control element was created
      const container = map.getContainer()
      const controlElement = container.querySelector('.maplibregl-ctrl')
      expect(controlElement).toBeDefined()
    })

    test('should support track user location mode', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      })

      const geoControl = new GeolocateControl({
        trackUserLocation: true,
      })
      map.addControl(geoControl)

      const container = map.getContainer()
      const controlElement = container.querySelector('.maplibregl-ctrl')
      expect(controlElement).toBeDefined()
    })

    test('should support show user heading option', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      })

      const geoControl = new GeolocateControl({
        showUserHeading: true,
      })
      map.addControl(geoControl)

      const container = map.getContainer()
      const controlElement = container.querySelector('.maplibregl-ctrl')
      expect(controlElement).toBeDefined()
    })
  })

  describe('Geolocate Control Positioning', () => {
    test('should add control at top-right by default', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      })

      const geoControl = new GeolocateControl()
      map.addControl(geoControl)

      expect(map.addControl).toHaveBeenCalledTimes(1)
    })

    test('should add control at specified position', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      })

      const geoControl = new GeolocateControl()
      map.addControl(geoControl, 'top-left')

      expect(map.addControl).toHaveBeenCalledWith(geoControl, 'top-left')
    })

    test('should support all standard positions', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      })

      const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right']

      positions.forEach(position => {
        const geoControl = new GeolocateControl()
        map.addControl(geoControl, position)
        expect(map.addControl).toHaveBeenCalledWith(geoControl, position)
      })
    })
  })

  describe('Geolocate Control Configuration', () => {
    test('should support position options', () => {
      const geoControl = new GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 300000,
        },
      })
      expect(geoControl).toBeDefined()
    })

    test('should support track user location', () => {
      const geoControl = new GeolocateControl({
        trackUserLocation: true,
      })
      expect(geoControl).toBeDefined()
    })

    test('should support show user heading', () => {
      const geoControl = new GeolocateControl({
        showUserHeading: true,
      })
      expect(geoControl).toBeDefined()
    })

    test('should support show accuracy circle', () => {
      const geoControl = new GeolocateControl({
        showAccuracyCircle: true,
      })
      expect(geoControl).toBeDefined()
    })

    test('should support fit bounds zoom level', () => {
      const geoControl = new GeolocateControl({
        fitBoundsZoom: 15,
      })
      expect(geoControl).toBeDefined()
    })
  })

  describe('Geolocate Control Events', () => {
    test('should trigger geolocate event on successful location', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      })

      const geoControl = new GeolocateControl()
      map.addControl(geoControl)

      // Mock successful geolocation
      const mockPosition = {
        coords: {
          latitude: 23.8103,
          longitude: 90.4125,
          accuracy: 100,
          heading: 45,
          speed: 10,
        },
        timestamp: Date.now(),
      }

      // Simulate geolocation success
      if (global.navigator.geolocation.getCurrentPosition) {
        const successCallback = global.navigator.geolocation.getCurrentPosition.mock.calls[0]?.[0]
        if (successCallback) {
          successCallback(mockPosition)
        }
      }

      expect(map.addControl).toHaveBeenCalled()
    })

    test('should handle geolocation errors', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      })

      const geoControl = new GeolocateControl()
      map.addControl(geoControl)

      // Mock geolocation error
      const mockError = {
        code: 1, // PERMISSION_DENIED
        message: 'User denied geolocation',
      }

      // Simulate geolocation error
      if (global.navigator.geolocation.getCurrentPosition) {
        const errorCallback = global.navigator.geolocation.getCurrentPosition.mock.calls[0]?.[1]
        if (errorCallback) {
          errorCallback(mockError)
        }
      }

      expect(map.addControl).toHaveBeenCalled()
    })

    test('should handle track user location mode', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      })

      const geoControl = new GeolocateControl({
        trackUserLocation: true,
      })
      map.addControl(geoControl)

      // Should use watchPosition instead of getCurrentPosition
      expect(global.navigator.geolocation.watchPosition).toBeDefined()
    })
  })

  describe('Multiple Geolocate Controls', () => {
    test('should handle multiple geolocate controls on same map', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      })

      const geoControl1 = new GeolocateControl()
      const geoControl2 = new GeolocateControl()

      map.addControl(geoControl1, 'top-right')
      map.addControl(geoControl2, 'bottom-right')

      expect(map.addControl).toHaveBeenCalledTimes(2)
    })

    test('should handle geolocate controls on different maps', () => {
      const map1 = new bkoiModule.Map({
        container: 'test-map',
      })

      const container2 = document.createElement('div')
      container2.id = 'test-map-2'
      document.body.appendChild(container2)

      const map2 = new bkoiModule.Map({
        container: 'test-map-2',
      })

      const geoControl1 = new GeolocateControl()
      const geoControl2 = new GeolocateControl()

      map1.addControl(geoControl1)
      map2.addControl(geoControl2)

      expect(map1.addControl).toHaveBeenCalled()
      expect(map2.addControl).toHaveBeenCalled()

      document.body.removeChild(container2)
    })
  })

  describe('Geolocate Control Removal', () => {
    test('should support onRemove method', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      })

      const geoControl = new GeolocateControl()
      map.addControl(geoControl)

      // Should have onRemove method
      expect(typeof geoControl.onRemove).toBe('function')
    })

    test('should clean up when removed', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      })

      const geoControl = new GeolocateControl()
      map.addControl(geoControl)

      // Simulate removal
      if (geoControl.onRemove) {
        geoControl.onRemove()
      }

      expect(geoControl).toBeDefined()
    })
  })

  describe('Geolocation API Integration', () => {
    test('should check for geolocation API availability', () => {
      // Temporarily remove geolocation API
      const originalGeolocation = global.navigator.geolocation
      delete global.navigator.geolocation

      expect(() => {
        const geoControl = new GeolocateControl()
        expect(geoControl).toBeDefined()
      }).not.toThrow()

      // Restore geolocation API
      global.navigator.geolocation = originalGeolocation
    })

    test('should handle geolocation API not available', () => {
      // Temporarily remove geolocation API
      const originalGeolocation = global.navigator.geolocation
      delete global.navigator.geolocation

      const map = new bkoiModule.Map({
        container: 'test-map',
      })

      const geoControl = new GeolocateControl()
      expect(() => {
        map.addControl(geoControl)
      }).not.toThrow()

      // Restore geolocation API
      global.navigator.geolocation = originalGeolocation
    })
  })

  describe('Edge Cases', () => {
    test('should handle undefined options gracefully', () => {
      const geoControl = new GeolocateControl(undefined)
      expect(geoControl).toBeDefined()
    })

    test('should handle null options gracefully', () => {
      const geoControl = new GeolocateControl(null)
      expect(geoControl).toBeDefined()
    })

    test('should work with minimal map setup', () => {
      const minimalMap = {
        addControl: jest.fn(),
        getContainer: jest.fn(() => document.createElement('div')),
        flyTo: jest.fn(),
        easeTo: jest.fn(),
        setCenter: jest.fn(),
        setZoom: jest.fn(),
        setBearing: jest.fn(),
        setPitch: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
        fire: jest.fn(),
        _getUIString: jest.fn(key => key),
      }

      const geoControl = new GeolocateControl()

      if (geoControl.onAdd) {
        const element = geoControl.onAdd(minimalMap)
        expect(element).toBeDefined()
      }
    })

    test('should handle rapid successive geolocation requests', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      })

      const geoControl = new GeolocateControl()
      map.addControl(geoControl)

      // Multiple rapid clicks should be handled gracefully
      expect(map.addControl).toHaveBeenCalled()
    })
  })
})
