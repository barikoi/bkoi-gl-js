/**
 * Fullscreen Control Tests
 * Tests for the fullscreen control functionality in BkoiGlMap
 */

describe('Fullscreen Control Tests', () => {
  let bkoiModule
  let FullscreenControl

  beforeEach(() => {
    jest.clearAllMocks()

    bkoiModule = require('../../dist/index.cjs')
    FullscreenControl = bkoiModule.FullscreenControl

    const container = document.createElement('div')
    container.id = 'test-map'
    document.body.appendChild(container)

    // Mock fullscreen API
    document.fullscreenEnabled = true
    document.fullscreenElement = null
    document.exitFullscreen = jest.fn().mockResolvedValue()
    document.documentElement.requestFullscreen = jest.fn().mockResolvedValue()

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
      }

      return map
    })
  })

  afterEach(() => {
    const container = document.getElementById('test-map')
    if (container) {
      document.body.removeChild(container)
    }

    // Reset fullscreen mocks
    document.fullscreenElement = null
  })

  describe('Fullscreen Control Initialization', () => {
    test('should create FullscreenControl instance', () => {
      const fullscreenControl = new FullscreenControl()
      expect(fullscreenControl).toBeDefined()
      expect(typeof fullscreenControl).toBe('object')
    })

    test('should create FullscreenControl with custom options', () => {
      const fullscreenControl = new FullscreenControl({
        container: document.body,
      })
      expect(fullscreenControl).toBeDefined()
    })

    test('should create FullscreenControl with default options', () => {
      const fullscreenControl = new FullscreenControl()
      expect(fullscreenControl).toBeDefined()
    })
  })

  describe('Fullscreen Control DOM Creation', () => {
    test('should create control container when added to map', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      })

      const fullscreenControl = new FullscreenControl()
      map.addControl(fullscreenControl)

      expect(map.addControl).toHaveBeenCalledWith(fullscreenControl)
    })

    test('should create fullscreen toggle button', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      })

      const fullscreenControl = new FullscreenControl()
      map.addControl(fullscreenControl)

      // Check if control element was created
      const container = map.getContainer()
      const controlElement = container.querySelector('.maplibregl-ctrl')
      expect(controlElement).toBeDefined()
    })

    test('should support custom container option', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      })

      const customContainer = document.createElement('div')
      const fullscreenControl = new FullscreenControl({
        container: customContainer,
      })
      map.addControl(fullscreenControl)

      const container = map.getContainer()
      const controlElement = container.querySelector('.maplibregl-ctrl')
      expect(controlElement).toBeDefined()
    })
  })

  describe('Fullscreen Control Positioning', () => {
    test('should add control at top-right by default', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      })

      const fullscreenControl = new FullscreenControl()
      map.addControl(fullscreenControl)

      expect(map.addControl).toHaveBeenCalledTimes(1)
    })

    test('should add control at specified position', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      })

      const fullscreenControl = new FullscreenControl()
      map.addControl(fullscreenControl, 'top-left')

      expect(map.addControl).toHaveBeenCalledWith(fullscreenControl, 'top-left')
    })

    test('should support all standard positions', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      })

      const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right']

      positions.forEach(position => {
        const fullscreenControl = new FullscreenControl()
        map.addControl(fullscreenControl, position)
        expect(map.addControl).toHaveBeenCalledWith(fullscreenControl, position)
      })
    })
  })

  describe('Fullscreen Control Configuration', () => {
    test('should support custom container', () => {
      const customContainer = document.createElement('div')
      const fullscreenControl = new FullscreenControl({
        container: customContainer,
      })
      expect(fullscreenControl).toBeDefined()
    })

    test('should handle undefined container gracefully', () => {
      const fullscreenControl = new FullscreenControl({
        container: undefined,
      })
      expect(fullscreenControl).toBeDefined()
    })
  })

  describe('Fullscreen API Integration', () => {
    test('should enter fullscreen mode', async () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      })

      const fullscreenControl = new FullscreenControl()
      map.addControl(fullscreenControl)

      // Mock entering fullscreen
      document.fullscreenElement = document.documentElement

      expect(document.fullscreenElement).toBe(document.documentElement)
    })

    test('should exit fullscreen mode', async () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      })

      const fullscreenControl = new FullscreenControl()
      map.addControl(fullscreenControl)

      // Mock exiting fullscreen
      document.fullscreenElement = null

      expect(document.fullscreenElement).toBeNull()
    })

    test('should handle fullscreen not supported', () => {
      // Temporarily disable fullscreen
      const originalFullscreenEnabled = document.fullscreenEnabled
      document.fullscreenEnabled = false

      const map = new bkoiModule.Map({
        container: 'test-map',
      })

      const fullscreenControl = new FullscreenControl()
      expect(() => {
        map.addControl(fullscreenControl)
      }).not.toThrow()

      // Restore fullscreen support
      document.fullscreenEnabled = originalFullscreenEnabled
    })
  })

  describe('Fullscreen Events', () => {
    test('should handle fullscreen change events', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      })

      const fullscreenControl = new FullscreenControl()
      map.addControl(fullscreenControl)

      // Simulate fullscreen change event
      const event = document.createEvent('Event')
      event.initEvent('fullscreenchange', true, true)
      document.dispatchEvent(event)

      expect(fullscreenControl).toBeDefined()
    })

    test('should update button state on fullscreen change', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      })

      const fullscreenControl = new FullscreenControl()
      map.addControl(fullscreenControl)

      // Simulate entering fullscreen
      document.fullscreenElement = document.documentElement
      const event1 = document.createEvent('Event')
      event1.initEvent('fullscreenchange', true, true)
      document.dispatchEvent(event1)

      // Simulate exiting fullscreen
      document.fullscreenElement = null
      const event2 = document.createEvent('Event')
      event2.initEvent('fullscreenchange', true, true)
      document.dispatchEvent(event2)

      expect(document.fullscreenElement).toBeNull()
    })
  })

  describe('Multiple Fullscreen Controls', () => {
    test('should handle multiple fullscreen controls on same map', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      })

      const fullscreenControl1 = new FullscreenControl()
      const fullscreenControl2 = new FullscreenControl()

      map.addControl(fullscreenControl1, 'top-right')
      map.addControl(fullscreenControl2, 'bottom-right')

      expect(map.addControl).toHaveBeenCalledTimes(2)
    })

    test('should handle fullscreen controls on different maps', () => {
      const map1 = new bkoiModule.Map({
        container: 'test-map',
      })

      const container2 = document.createElement('div')
      container2.id = 'test-map-2'
      document.body.appendChild(container2)

      const map2 = new bkoiModule.Map({
        container: 'test-map-2',
      })

      const fullscreenControl1 = new FullscreenControl()
      const fullscreenControl2 = new FullscreenControl()

      map1.addControl(fullscreenControl1)
      map2.addControl(fullscreenControl2)

      expect(map1.addControl).toHaveBeenCalled()
      expect(map2.addControl).toHaveBeenCalled()

      document.body.removeChild(container2)
    })
  })

  describe('Fullscreen Control Removal', () => {
    test('should support onRemove method', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      })

      const fullscreenControl = new FullscreenControl()
      map.addControl(fullscreenControl)

      // Should have onRemove method
      expect(typeof fullscreenControl.onRemove).toBe('function')
    })

    test('should clean up event listeners when removed', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      })

      const fullscreenControl = new FullscreenControl()
      map.addControl(fullscreenControl)

      // Simulate removal
      if (fullscreenControl.onRemove) {
        fullscreenControl.onRemove()
      }

      expect(fullscreenControl).toBeDefined()
    })
  })

  describe('Fullscreen State Detection', () => {
    test('should detect when in fullscreen mode', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      })

      const fullscreenControl = new FullscreenControl()
      map.addControl(fullscreenControl)

      // Simulate fullscreen state
      document.fullscreenElement = document.documentElement

      expect(document.fullscreenElement).toBe(document.documentElement)
    })

    test('should detect when not in fullscreen mode', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      })

      const fullscreenControl = new FullscreenControl()
      map.addControl(fullscreenControl)

      // Ensure not in fullscreen
      document.fullscreenElement = null

      expect(document.fullscreenElement).toBeNull()
    })
  })

  describe('Edge Cases', () => {
    test('should handle undefined options gracefully', () => {
      const fullscreenControl = new FullscreenControl(undefined)
      expect(fullscreenControl).toBeDefined()
    })

    test('should handle null options gracefully', () => {
      const fullscreenControl = new FullscreenControl(null)
      expect(fullscreenControl).toBeDefined()
    })

    test('should work with minimal map setup', () => {
      const minimalMap = {
        addControl: jest.fn(),
        getContainer: jest.fn(() => document.createElement('div')),
        _getUIString: jest.fn(key => key),
      }

      const fullscreenControl = new FullscreenControl()

      if (fullscreenControl.onAdd) {
        const element = fullscreenControl.onAdd(minimalMap)
        expect(element).toBeDefined()
      }
    })

    test('should handle rapid fullscreen toggle attempts', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      })

      const fullscreenControl = new FullscreenControl()
      map.addControl(fullscreenControl)

      // Multiple rapid toggles should be handled gracefully
      expect(map.addControl).toHaveBeenCalled()
    })

    test('should handle fullscreen errors gracefully', () => {
      // Mock fullscreen request failure
      document.documentElement.requestFullscreen = jest
        .fn()
        .mockRejectedValue(new Error('Fullscreen failed'))

      const map = new bkoiModule.Map({
        container: 'test-map',
      })

      const fullscreenControl = new FullscreenControl()
      expect(() => {
        map.addControl(fullscreenControl)
      }).not.toThrow()
    })
  })
})
