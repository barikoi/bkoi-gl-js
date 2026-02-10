/**
 * Minimap Control Tests
 * Tests for the minimap control functionality in BkoiGlMap
 */

// Setup performance mock before any imports
if (!global.performance) {
  global.performance = {}
}
if (typeof global.performance.mark !== 'function') {
  global.performance.mark = jest.fn()
}
if (typeof global.performance.measure !== 'function') {
  global.performance.measure = jest.fn()
}
if (typeof global.performance.now !== 'function') {
  global.performance.now = () => Date.now()
}
global.performance.getEntriesByName = global.performance.getEntriesByName || jest.fn(() => [])
global.performance.getEntriesByType = global.performance.getEntriesByType || jest.fn(() => [])

// Mock window.devicePixelRatio
Object.defineProperty(window, 'devicePixelRatio', {
  writable: true,
  value: 1,
})

// Track mock map instances
const mockMapInstances = []

/**
 * Creates a mock Map instance for testing
 */
const createMockMap = (options = {}) => {
  const mapContainer = document.createElement('div')
  if (options.container) {
    mapContainer.id = options.container
  } else {
    mapContainer.id = `mock-map-${Date.now()}-${Math.random().toString(36).slice(2)}`
  }
  document.body.appendChild(mapContainer)

  const mockMap = {
    _container: mapContainer,
    _id: mapContainer.id,
    options: {
      container: mapContainer.id,
      center: [90.39017821904588, 23.719800220780733],
      zoom: 10,
      bearing: 0,
      pitch: 0,
      ...options,
    },
    controls: [],
    eventListeners: {},
    sources: {},
    layers: [],

    // Map methods
    getContainer: jest.fn(() => mapContainer),
    getCenter: jest.fn(() => ({
      toArray: () => [90.39017821904588, 23.719800220780733],
    })),
    getZoom: jest.fn(() => options.zoom ?? 10),
    getBearing: jest.fn(() => options.bearing ?? 0),
    getPitch: jest.fn(() => options.pitch ?? 0),
    getCanvas: jest.fn(() => ({ width: 800, height: 600 })),

    // Mutation methods
    setStyle: jest.fn(),
    jumpTo: jest.fn(),
    resize: jest.fn(),
    remove: jest.fn(),

    // Event methods
    on: jest.fn(function (event, callback) {
      if (!this.eventListeners[event]) {
        this.eventListeners[event] = []
      }
      this.eventListeners[event].push(callback)
      return this
    }),
    off: jest.fn(function (event, callback) {
      if (this.eventListeners[event]) {
        this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback)
      }
      return this
    }),
    once: jest.fn(function (event, callback) {
      // For 'load' and 'style.load' events, call callback immediately
      if (event === 'load' || event === 'style.load') {
        setTimeout(() => callback?.(), 0)
      }
      return this
    }),
    fire: jest.fn(function (event, data) {
      if (this.eventListeners[event]) {
        this.eventListeners[event].forEach(cb => cb(data))
      }
      return this
    }),

    // Source and layer methods
    addSource: jest.fn(function (id, source) {
      // Wrap source with setData method to mimic GeoJSONSource behavior
      this.sources[id] = {
        ...source,
        setData: jest.fn(),
      }
      return this
    }),
    getSource: jest.fn(function (id) {
      return this.sources[id]
    }),
    addLayer: jest.fn(function (layer, beforeId) {
      this.layers.push({ ...layer, beforeId })
      return this
    }),
    removeLayer: jest.fn(function (id) {
      this.layers = this.layers.filter(l => l.id !== id)
      return this
    }),
    moveLayer: jest.fn(),
    setLayerZoomRange: jest.fn(),
    setFilter: jest.fn(),
    setPaintProperty: jest.fn(),
    setLayoutProperty: jest.fn(),
    setGlyphs: jest.fn(),

    // Interaction handlers
    dragPan: { disable: jest.fn(), enable: jest.fn() },
    scrollZoom: { disable: jest.fn(), enable: jest.fn() },
    boxZoom: { disable: jest.fn(), enable: jest.fn() },
    dragRotate: { disable: jest.fn(), enable: jest.fn() },
    keyboard: { disable: jest.fn(), enable: jest.fn() },
    doubleClickZoom: { disable: jest.fn(), enable: jest.fn() },
    touchZoomRotate: { disable: jest.fn(), enable: jest.fn() },

    // Utility methods
    loaded: jest.fn(() => true),
    isStyleLoaded: jest.fn(() => true),
    unproject: jest.fn(point => ({
      toArray: () => {
        if (point[0] === 0 && point[1] === 0) return [90.0, 24.0]
        if (point[0] === 800 && point[1] === 0) return [91.0, 24.0]
        if (point[0] === 0 && point[1] === 600) return [90.0, 23.0]
        return [91.0, 23.0]
      },
    })),
  }

  mockMapInstances.push(mockMap)
  return mockMap
}

// Mock the BkoiGlMap class before importing Minimap
jest.mock('../../src/index', () => {
  const MockMap = jest.fn(createMockMap)
  return {
    Map: MockMap,
  }
})

// Import Minimap after mocking
import { Minimap } from '../../src/controls/Minimap'

describe('Minimap Control Tests', () => {
  let createParentMap
  let testContainer

  beforeEach(() => {
    jest.clearAllMocks()
    mockMapInstances.length = 0

    // Clean up any existing test containers
    document
      .querySelectorAll('[id^="test-map"], [id^="minimap-"], [id^="mock-map"]')
      .forEach(el => el.remove())

    // Create main test container
    testContainer = document.createElement('div')
    testContainer.id = 'test-map'
    document.body.appendChild(testContainer)

    // Helper to create a mock parent map
    createParentMap = () => ({
      getContainer: jest.fn(() => testContainer),
      getCenter: jest.fn(() => ({
        toArray: () => [90.39017821904588, 23.719800220780733],
      })),
      getZoom: jest.fn(() => 10),
      getBearing: jest.fn(() => 0),
      getPitch: jest.fn(() => 0),
      getCanvas: jest.fn(() => ({ width: 800, height: 600 })),
      on: jest.fn(),
      off: jest.fn(),
      unproject: jest.fn(point => ({
        toArray: () => {
          if (point[0] === 0 && point[1] === 0) return [90.0, 24.0]
          if (point[0] === 800 && point[1] === 0) return [91.0, 24.0]
          if (point[0] === 0 && point[1] === 600) return [90.0, 23.0]
          return [91.0, 23.0]
        },
      })),
    })
  })

  afterEach(() => {
    // Clean up DOM
    document
      .querySelectorAll('[id^="test-map"], [id^="minimap-"], [id^="mock-map"]')
      .forEach(el => el.remove())
  })

  describe('Constructor', () => {
    test('should create minimap with default options', () => {
      const minimap = new Minimap()

      expect(minimap).toBeDefined()
      expect(minimap.map).toBeUndefined() // Map not created until onAdd
    })

    test('should create minimap with custom options', () => {
      const options = {
        zoomAdjust: -3,
        position: 'bottom-left',
        containerStyle: { width: '200px', height: '150px' },
      }

      const minimap = new Minimap(options)
      expect(minimap).toBeDefined()
    })

    test('should accept different style option', () => {
      const minimap = new Minimap({
        style: 'https://example.com/style.json',
      })

      expect(minimap).toBeDefined()
    })

    test('should set initialMinimized state', () => {
      const minimap = new Minimap({
        initialMinimized: true,
      })

      expect(minimap.isMinimized()).toBe(true)
    })

    test('should default to not minimized', () => {
      const minimap = new Minimap()
      expect(minimap.isMinimized()).toBe(false)
    })
  })

  describe('onAdd', () => {
    test('should create container and minimap instance', () => {
      const parentMap = createParentMap()
      const minimap = new Minimap()
      const container = minimap.onAdd(parentMap)

      expect(container).toBeInstanceOf(HTMLElement)
      expect(container.id).toMatch(/^minimap-/)
      expect(minimap.map).toBeDefined()
      expect(mockMapInstances.length).toBeGreaterThan(0)
    })

    test('should apply custom container styles', () => {
      const parentMap = createParentMap()
      const minimap = new Minimap({
        containerStyle: { width: '250px', height: '200px' },
      })

      const container = minimap.onAdd(parentMap)

      expect(container.style.width).toBe('250px')
      expect(container.style.height).toBe('200px')
    })

    test('should add minimized class if initialMinimized is true', () => {
      const parentMap = createParentMap()
      const minimap = new Minimap({
        initialMinimized: true,
        collapsedWidth: '30px',
        collapsedHeight: '30px',
      })

      const container = minimap.onAdd(parentMap)

      expect(container.classList.contains('minimized')).toBe(true)
      expect(container.style.width).toBe('30px')
      expect(container.style.height).toBe('30px')
    })

    test('should register style.load and load event handlers', () => {
      const parentMap = createParentMap()
      const minimap = new Minimap()
      minimap.onAdd(parentMap)

      expect(minimap.map.once).toHaveBeenCalledWith('style.load', expect.any(Function))
      expect(minimap.map.once).toHaveBeenCalledWith('load', expect.any(Function))
    })

    test('should call resize on style.load', done => {
      const parentMap = createParentMap()
      const minimap = new Minimap()
      minimap.onAdd(parentMap)

      // Find the style.load callback
      const styleLoadCalls = minimap.map.once.mock.calls.filter(call => call[0] === 'style.load')
      if (styleLoadCalls.length > 0 && styleLoadCalls[0][1]) {
        styleLoadCalls[0][1]()
        expect(minimap.map.resize).toHaveBeenCalled()
        done()
      } else {
        done()
      }
    })
  })

  describe('onRemove', () => {
    test('should remove container from DOM', () => {
      const parentMap = createParentMap()
      const minimap = new Minimap()
      const container = minimap.onAdd(parentMap)

      // Simulate MapLibre adding the control to DOM (map.addControl behavior)
      document.body.appendChild(container)

      // The container should be in DOM after onAdd
      expect(document.body.contains(container)).toBe(true)

      minimap.onRemove()

      // The container should be removed from DOM after onRemove
      expect(document.body.contains(container)).toBe(false)
    })
  })

  describe('toggle', () => {
    test('should toggle minimized state', () => {
      const parentMap = createParentMap()
      const minimap = new Minimap({
        collapsedWidth: '25px',
        collapsedHeight: '25px',
        containerStyle: { width: '300px', height: '200px' },
      })
      minimap.onAdd(parentMap)

      expect(minimap.isMinimized()).toBe(false)

      minimap.toggle()
      expect(minimap.isMinimized()).toBe(true)

      minimap.toggle()
      expect(minimap.isMinimized()).toBe(false)
    })

    test('should add minimized class and adjust size when minimizing', () => {
      const parentMap = createParentMap()
      const minimap = new Minimap({
        collapsedWidth: '25px',
        collapsedHeight: '25px',
        containerStyle: { width: '300px', height: '200px' },
      })
      const container = minimap.onAdd(parentMap)

      minimap.toggle()

      expect(container.classList.contains('minimized')).toBe(true)
      expect(container.style.width).toBe('25px')
      expect(container.style.height).toBe('25px')
    })

    test('should remove minimized class and restore size when maximizing', () => {
      const parentMap = createParentMap()
      const minimap = new Minimap({
        collapsedWidth: '25px',
        collapsedHeight: '25px',
        containerStyle: { width: '300px', height: '200px' },
      })
      const container = minimap.onAdd(parentMap)

      minimap.toggle() // Minimize
      minimap.toggle() // Maximize

      expect(container.classList.contains('minimized')).toBe(false)
      expect(container.style.width).toBe('300px')
      expect(container.style.height).toBe('200px')
    })

    test('should call onToggle callback if provided', () => {
      const parentMap = createParentMap()
      const onToggle = jest.fn()
      const minimap = new Minimap({
        onToggle,
      })
      minimap.onAdd(parentMap)

      minimap.toggle()

      expect(onToggle).toHaveBeenCalledWith(true)
    })
  })

  describe('isMinimized', () => {
    test('should return false by default', () => {
      const minimap = new Minimap()
      expect(minimap.isMinimized()).toBe(false)
    })

    test('should return true when initialMinimized is set', () => {
      const minimap = new Minimap({ initialMinimized: true })
      expect(minimap.isMinimized()).toBe(true)
    })

    test('should return correct state after toggle', () => {
      const parentMap = createParentMap()
      const minimap = new Minimap()
      minimap.onAdd(parentMap)

      expect(minimap.isMinimized()).toBe(false)

      minimap.toggle()
      expect(minimap.isMinimized()).toBe(true)

      minimap.toggle()
      expect(minimap.isMinimized()).toBe(false)
    })
  })

  describe('Style and Layer Methods', () => {
    let parentMap
    let minimap

    beforeEach(() => {
      parentMap = createParentMap()
      // Without a custom style, differentStyle is false, so methods delegate to map
      minimap = new Minimap()
      minimap.onAdd(parentMap)
    })

    describe('setStyle', () => {
      test('should call map.setStyle', () => {
        const newStyle = 'https://example.com/new-style.json'
        minimap.setStyle(newStyle)

        expect(minimap.map.setStyle).toHaveBeenCalledWith(newStyle, undefined)
      })

      test('should accept style options', () => {
        const style = { version: 8, name: 'test', sources: {}, layers: [] }
        const options = { diff: true }

        minimap.setStyle(style, options)

        expect(minimap.map.setStyle).toHaveBeenCalledWith(style, options)
      })
    })

    describe('addLayer', () => {
      test('should call map.addLayer', () => {
        const layer = { id: 'test-layer', type: 'circle', source: 'test' }

        const result = minimap.addLayer(layer)

        expect(minimap.map.addLayer).toHaveBeenCalledWith(layer, undefined)
        expect(result).toBe(minimap.map)
      })

      test('should accept beforeId parameter', () => {
        const layer = { id: 'test-layer', type: 'circle', source: 'test' }
        const beforeId = 'existing-layer'

        minimap.addLayer(layer, beforeId)

        expect(minimap.map.addLayer).toHaveBeenCalledWith(layer, beforeId)
      })
    })

    describe('moveLayer', () => {
      test('should call map.moveLayer', () => {
        const result = minimap.moveLayer('layer-id', 'before-id')

        expect(minimap.map.moveLayer).toHaveBeenCalledWith('layer-id', 'before-id')
        expect(result).toBe(minimap.map)
      })
    })

    describe('removeLayer', () => {
      test('should call map.removeLayer', () => {
        const result = minimap.removeLayer('layer-id')

        expect(minimap.map.removeLayer).toHaveBeenCalledWith('layer-id')
        expect(result).toBe(minimap)
      })
    })

    describe('setLayerZoomRange', () => {
      test('should call map.setLayerZoomRange', () => {
        const result = minimap.setLayerZoomRange('layer-id', 5, 15)

        expect(minimap.map.setLayerZoomRange).toHaveBeenCalledWith('layer-id', 5, 15)
        expect(result).toBe(minimap)
      })
    })

    describe('setFilter', () => {
      test('should call map.setFilter', () => {
        const filter = ['==', 'category', 'restaurant']
        const result = minimap.setFilter('layer-id', filter)

        expect(minimap.map.setFilter).toHaveBeenCalledWith('layer-id', filter, undefined)
        expect(result).toBe(minimap)
      })

      test('should accept options parameter', () => {
        const filter = ['>', 'population', 1000]
        const options = { validate: true }

        minimap.setFilter('layer-id', filter, options)

        expect(minimap.map.setFilter).toHaveBeenCalledWith('layer-id', filter, options)
      })
    })

    describe('setPaintProperty', () => {
      test('should call map.setPaintProperty', () => {
        const result = minimap.setPaintProperty('layer-id', 'circle-color', '#ff0000')

        expect(minimap.map.setPaintProperty).toHaveBeenCalledWith(
          'layer-id',
          'circle-color',
          '#ff0000',
          undefined
        )
        expect(result).toBe(minimap)
      })

      test('should accept options parameter', () => {
        const options = { validate: false }

        minimap.setPaintProperty('layer-id', 'circle-radius', 10, options)

        expect(minimap.map.setPaintProperty).toHaveBeenCalledWith(
          'layer-id',
          'circle-radius',
          10,
          options
        )
      })
    })

    describe('setLayoutProperty', () => {
      test('should call map.setLayoutProperty', () => {
        const result = minimap.setLayoutProperty('layer-id', 'visibility', 'visible')

        expect(minimap.map.setLayoutProperty).toHaveBeenCalledWith(
          'layer-id',
          'visibility',
          'visible',
          undefined
        )
        expect(result).toBe(minimap)
      })

      test('should accept options parameter', () => {
        const options = { validate: true }

        minimap.setLayoutProperty('layer-id', 'visibility', 'none', options)

        expect(minimap.map.setLayoutProperty).toHaveBeenCalledWith(
          'layer-id',
          'visibility',
          'none',
          options
        )
      })
    })

    describe('setGlyphs', () => {
      test('should call map.setGlyphs', () => {
        const glyphsUrl = 'https://example.com/glyphs/{fontstack}/{range}.pbf'
        const result = minimap.setGlyphs(glyphsUrl)

        expect(minimap.map.setGlyphs).toHaveBeenCalledWith(glyphsUrl, undefined)
        expect(result).toBe(minimap)
      })

      test('should accept options parameter', () => {
        const options = { validate: false }

        minimap.setGlyphs('https://example.com/glyphs/{fontstack}/{range}.pbf', options)

        expect(minimap.map.setGlyphs).toHaveBeenCalledWith(
          'https://example.com/glyphs/{fontstack}/{range}.pbf',
          options
        )
      })
    })
  })

  describe('Container Styles', () => {
    test('should apply custom borderRadius', () => {
      const parentMap = createParentMap()
      const minimap = new Minimap({
        borderRadius: '5px',
      })

      const container = minimap.onAdd(parentMap)
      const styleEl = container.querySelector('style')

      expect(styleEl.innerHTML).toContain('border-radius: 5px')
    })

    test('should apply custom collapsed dimensions', () => {
      const parentMap = createParentMap()
      const minimap = new Minimap({
        collapsedWidth: '40px',
        collapsedHeight: '40px',
        initialMinimized: true,
      })

      const container = minimap.onAdd(parentMap)

      expect(container.style.width).toBe('40px')
      expect(container.style.height).toBe('40px')
    })

    test('should apply custom container styles', () => {
      const parentMap = createParentMap()
      const minimap = new Minimap({
        containerStyle: {
          width: '500px',
          height: '400px',
          border: '2px solid red',
        },
      })

      const container = minimap.onAdd(parentMap)

      expect(container.style.width).toBe('500px')
      expect(container.style.height).toBe('400px')
      expect(container.style.border).toBe('2px solid red')
    })
  })

  describe('Container Classes', () => {
    test('should add proper CSS classes to container', () => {
      const parentMap = createParentMap()
      const minimap = new Minimap()
      const container = minimap.onAdd(parentMap)

      expect(container.classList.contains('maplibregl-ctrl')).toBe(true)
      expect(container.classList.contains('maplibregl-ctrl-group')).toBe(true)
      expect(container.classList.contains('maplibregl-ctrl-minimap')).toBe(true)
      expect(container.classList.contains('custom-ctrl-minimap')).toBe(true)
    })

    test('should have unique ID', () => {
      const parentMap = createParentMap()
      const minimap1 = new Minimap()
      const container1 = minimap1.onAdd(parentMap)

      const minimap2 = new Minimap()
      const container2 = minimap2.onAdd(parentMap)

      expect(container1.id).not.toBe(container2.id)
      expect(container1.id).toMatch(/^minimap-/)
      expect(container2.id).toMatch(/^minimap-/)
    })
  })

  describe('Position', () => {
    test('should accept custom position', () => {
      const minimap = new Minimap({
        position: 'bottom-left',
      })

      expect(minimap).toBeDefined()
    })
  })

  describe('Edge Cases', () => {
    test('should handle undefined options gracefully', () => {
      const parentMap = createParentMap()
      const minimap = new Minimap(undefined)

      minimap.onAdd(parentMap)

      expect(minimap).toBeDefined()
      expect(minimap.map).toBeDefined()
    })

    test('should handle empty object options', () => {
      const parentMap = createParentMap()
      const minimap = new Minimap({})

      minimap.onAdd(parentMap)

      expect(minimap).toBeDefined()
      expect(minimap.map).toBeDefined()
    })

    test('should handle custom container styles', () => {
      const parentMap = createParentMap()
      const minimap = new Minimap({
        containerStyle: {
          width: '500px',
          height: '400px',
          border: '2px solid red',
        },
      })

      const container = minimap.onAdd(parentMap)

      expect(container.style.width).toBe('500px')
      expect(container.style.height).toBe('400px')
      expect(container.style.border).toBe('2px solid red')
    })

    test('should apply default dimensions when no container style provided', () => {
      const parentMap = createParentMap()
      const minimap = new Minimap()

      const container = minimap.onAdd(parentMap)

      // Check that default dimensions from inline styles are applied
      const styleEl = container.querySelector('style')
      expect(styleEl.innerHTML).toContain('width: 400px')
      expect(styleEl.innerHTML).toContain('height: 300px')
    })
  })

  describe('Style-specific Behavior', () => {
    describe('when custom style is provided', () => {
      test('should NOT delegate setStyle to map', () => {
        const parentMap = createParentMap()
        const minimap = new Minimap({
          style: 'https://example.com/custom-style.json',
        })
        minimap.onAdd(parentMap)

        minimap.setStyle('https://example.com/new-style.json')

        // When differentStyle is true, setStyle should NOT be called
        expect(minimap.map.setStyle).not.toHaveBeenCalled()
      })

      test('should NOT delegate addLayer to map', () => {
        const parentMap = createParentMap()
        const minimap = new Minimap({
          style: 'https://example.com/custom-style.json',
        })
        minimap.onAdd(parentMap)

        const layer = { id: 'test-layer', type: 'circle', source: 'test' }
        minimap.addLayer(layer)

        // When differentStyle is true, addLayer should NOT be called
        expect(minimap.map.addLayer).not.toHaveBeenCalled()
      })

      test('should NOT delegate moveLayer to map', () => {
        const parentMap = createParentMap()
        const minimap = new Minimap({
          style: 'https://example.com/custom-style.json',
        })
        minimap.onAdd(parentMap)

        minimap.moveLayer('layer-id', 'before-id')

        expect(minimap.map.moveLayer).not.toHaveBeenCalled()
      })

      test('should NOT delegate removeLayer to map', () => {
        const parentMap = createParentMap()
        const minimap = new Minimap({
          style: 'https://example.com/custom-style.json',
        })
        minimap.onAdd(parentMap)

        minimap.removeLayer('layer-id')

        expect(minimap.map.removeLayer).not.toHaveBeenCalled()
      })

      test('should NOT delegate setLayerZoomRange to map', () => {
        const parentMap = createParentMap()
        const minimap = new Minimap({
          style: 'https://example.com/custom-style.json',
        })
        minimap.onAdd(parentMap)

        minimap.setLayerZoomRange('layer-id', 5, 15)

        expect(minimap.map.setLayerZoomRange).not.toHaveBeenCalled()
      })

      test('should NOT delegate setFilter to map', () => {
        const parentMap = createParentMap()
        const minimap = new Minimap({
          style: 'https://example.com/custom-style.json',
        })
        minimap.onAdd(parentMap)

        minimap.setFilter('layer-id', ['==', 'category', 'restaurant'])

        expect(minimap.map.setFilter).not.toHaveBeenCalled()
      })

      test('should NOT delegate setPaintProperty to map', () => {
        const parentMap = createParentMap()
        const minimap = new Minimap({
          style: 'https://example.com/custom-style.json',
        })
        minimap.onAdd(parentMap)

        minimap.setPaintProperty('layer-id', 'circle-color', '#ff0000')

        expect(minimap.map.setPaintProperty).not.toHaveBeenCalled()
      })

      test('should NOT delegate setLayoutProperty to map', () => {
        const parentMap = createParentMap()
        const minimap = new Minimap({
          style: 'https://example.com/custom-style.json',
        })
        minimap.onAdd(parentMap)

        minimap.setLayoutProperty('layer-id', 'visibility', 'none')

        expect(minimap.map.setLayoutProperty).not.toHaveBeenCalled()
      })

      test('should NOT delegate setGlyphs to map', () => {
        const parentMap = createParentMap()
        const minimap = new Minimap({
          style: 'https://example.com/custom-style.json',
        })
        minimap.onAdd(parentMap)

        minimap.setGlyphs('https://example.com/glyphs/{fontstack}/{range}.pbf')

        expect(minimap.map.setGlyphs).not.toHaveBeenCalled()
      })
    })

    describe('when no custom style (default behavior)', () => {
      test('should delegate setStyle to map', () => {
        const parentMap = createParentMap()
        const minimap = new Minimap()
        minimap.onAdd(parentMap)

        minimap.setStyle('https://example.com/new-style.json')

        expect(minimap.map.setStyle).toHaveBeenCalledWith(
          'https://example.com/new-style.json',
          undefined
        )
      })

      test('should delegate addLayer to map', () => {
        const parentMap = createParentMap()
        const minimap = new Minimap()
        minimap.onAdd(parentMap)

        const layer = { id: 'test-layer', type: 'circle', source: 'test' }
        minimap.addLayer(layer)

        expect(minimap.map.addLayer).toHaveBeenCalledWith(layer, undefined)
      })
    })
  })

  describe('Zoom Calculation', () => {
    test('should calculate minimap zoom as parent zoom plus zoomAdjust', () => {
      const parentMap = createParentMap()
      const minimap = new Minimap({
        zoomAdjust: -3,
      })

      minimap.onAdd(parentMap)

      // Parent zoom is 10, zoomAdjust is -3, so minimap zoom should be 7
      expect(mockMapInstances[mockMapInstances.length - 1].options.zoom).toBe(7)
    })

    test('should use default zoomAdjust of -4 when not specified', () => {
      const parentMap = createParentMap()
      const minimap = new Minimap()

      minimap.onAdd(parentMap)

      // Parent zoom is 10, default zoomAdjust is -4, so minimap zoom should be 6
      expect(mockMapInstances[mockMapInstances.length - 1].options.zoom).toBe(6)
    })

    test('should handle positive zoomAdjust', () => {
      const parentMap = createParentMap()
      const minimap = new Minimap({
        zoomAdjust: 2,
      })

      minimap.onAdd(parentMap)

      // Parent zoom is 10, zoomAdjust is 2, so minimap zoom should be 12
      expect(mockMapInstances[mockMapInstances.length - 1].options.zoom).toBe(12)
    })

    test('should use parent zoom when zoomAdjust is 0', () => {
      const parentMap = createParentMap()
      const minimap = new Minimap({
        zoomAdjust: 0,
      })

      minimap.onAdd(parentMap)

      // Parent zoom is 10, zoomAdjust is 0, so minimap zoom should be 10
      expect(mockMapInstances[mockMapInstances.length - 1].options.zoom).toBe(10)
    })
  })

  describe('Parent Rectangle', () => {
    test('should not add parent rect when config is undefined', () => {
      const parentMap = createParentMap()
      const minimap = new Minimap()
      minimap.onAdd(parentMap)

      // Trigger the load event to initialize features
      const loadCallback = minimap.map.once.mock.calls.find(call => call[0] === 'load')?.[1]
      if (loadCallback) {
        loadCallback()
      }

      // No parentRect source should be added
      expect(minimap.map.addSource).not.toHaveBeenCalled()
    })

    test('should not add parent rect when both linePaint and fillPaint are undefined', () => {
      const parentMap = createParentMap()
      const minimap = new Minimap({
        parentRect: {},
      })
      minimap.onAdd(parentMap)

      // Trigger the load event to initialize features
      const loadCallback = minimap.map.once.mock.calls.find(call => call[0] === 'load')?.[1]
      if (loadCallback) {
        loadCallback()
      }

      // No parentRect source should be added
      expect(minimap.map.addSource).not.toHaveBeenCalled()
    })

    test('should add parent rect source and line layer when linePaint is provided', () => {
      const parentMap = createParentMap()
      const minimap = new Minimap({
        parentRect: {
          linePaint: { 'line-color': '#FF0000', 'line-width': 3 },
        },
      })
      minimap.onAdd(parentMap)

      // Trigger the load event to initialize features
      const loadCallback = minimap.map.once.mock.calls.find(call => call[0] === 'load')?.[1]
      if (loadCallback) {
        loadCallback()
      }

      // Source should be added
      expect(minimap.map.addSource).toHaveBeenCalledWith('parentRect', {
        type: 'geojson',
        data: expect.objectContaining({
          type: 'Feature',
          properties: { name: 'parentRect' },
          geometry: { type: 'Polygon', coordinates: expect.any(Array) },
        }),
      })

      // Line layer should be added
      const lineLayerCall = minimap.map.addLayer.mock.calls.find(
        call => call[0]?.id === 'parentRectOutline'
      )
      expect(lineLayerCall).toBeDefined()
      expect(lineLayerCall[0]).toMatchObject({
        id: 'parentRectOutline',
        type: 'line',
        source: 'parentRect',
      })
    })

    test('should add parent rect source and fill layer when fillPaint is provided', () => {
      const parentMap = createParentMap()
      const minimap = new Minimap({
        parentRect: {
          fillPaint: { 'fill-color': '#0088FF', 'fill-opacity': 0.2 },
        },
      })
      minimap.onAdd(parentMap)

      // Trigger the load event to initialize features
      const loadCallback = minimap.map.once.mock.calls.find(call => call[0] === 'load')?.[1]
      if (loadCallback) {
        loadCallback()
      }

      // Source should be added
      expect(minimap.map.addSource).toHaveBeenCalledWith('parentRect', expect.any(Object))

      // Fill layer should be added
      const fillLayerCall = minimap.map.addLayer.mock.calls.find(
        call => call[0]?.id === 'parentRectFill'
      )
      expect(fillLayerCall).toBeDefined()
      expect(fillLayerCall[0]).toMatchObject({
        id: 'parentRectFill',
        type: 'fill',
        source: 'parentRect',
      })
    })

    test('should add both line and fill layers when both paints are provided', () => {
      const parentMap = createParentMap()
      const minimap = new Minimap({
        parentRect: {
          linePaint: { 'line-color': '#FFFFFF', 'line-width': 2 },
          fillPaint: { 'fill-color': '#0088FF', 'fill-opacity': 0.15 },
        },
      })
      minimap.onAdd(parentMap)

      // Trigger the load event to initialize features
      const loadCallback = minimap.map.once.mock.calls.find(call => call[0] === 'load')?.[1]
      if (loadCallback) {
        loadCallback()
      }

      // Both layers should be added
      const addLayerCalls = minimap.map.addLayer.mock.calls
      const layerIds = addLayerCalls.map(call => call[0]?.id)

      expect(layerIds).toContain('parentRectOutline')
      expect(layerIds).toContain('parentRectFill')
    })

    test('should merge custom linePaint with defaults', () => {
      const parentMap = createParentMap()
      const customLinePaint = { 'line-color': '#FF0000', 'line-width': 5 }
      const minimap = new Minimap({
        parentRect: {
          linePaint: customLinePaint,
        },
      })
      minimap.onAdd(parentMap)

      // Trigger the load event to initialize features
      const loadCallback = minimap.map.once.mock.calls.find(call => call[0] === 'load')?.[1]
      if (loadCallback) {
        loadCallback()
      }

      const lineLayerCall = minimap.map.addLayer.mock.calls.find(
        call => call[0]?.id === 'parentRectOutline'
      )
      expect(lineLayerCall).toBeDefined()
      // Should have merged custom values with defaults
      expect(lineLayerCall[0].paint).toMatchObject({
        'line-color': '#FF0000',
        'line-width': 5,
        'line-opacity': 0.85, // default value
      })
    })

    test('should merge custom fillPaint with defaults', () => {
      const parentMap = createParentMap()
      const customFillPaint = { 'fill-color': '#00FF00', 'fill-opacity': 0.5 }
      const minimap = new Minimap({
        parentRect: {
          fillPaint: customFillPaint,
        },
      })
      minimap.onAdd(parentMap)

      // Trigger the load event to initialize features
      const loadCallback = minimap.map.once.mock.calls.find(call => call[0] === 'load')?.[1]
      if (loadCallback) {
        loadCallback()
      }

      const fillLayerCall = minimap.map.addLayer.mock.calls.find(
        call => call[0]?.id === 'parentRectFill'
      )
      expect(fillLayerCall).toBeDefined()
      expect(fillLayerCall[0].paint).toMatchObject({
        'fill-color': '#00FF00',
        'fill-opacity': 0.5,
      })
    })

    test('should apply custom lineLayout when provided', () => {
      const parentMap = createParentMap()
      const minimap = new Minimap({
        parentRect: {
          linePaint: { 'line-color': '#FFFFFF' },
          lineLayout: { 'line-join': 'round', 'line-cap': 'round' },
        },
      })
      minimap.onAdd(parentMap)

      // Trigger the load event to initialize features
      const loadCallback = minimap.map.once.mock.calls.find(call => call[0] === 'load')?.[1]
      if (loadCallback) {
        loadCallback()
      }

      const lineLayerCall = minimap.map.addLayer.mock.calls.find(
        call => call[0]?.id === 'parentRectOutline'
      )
      expect(lineLayerCall[0].layout).toMatchObject({
        'line-join': 'round',
        'line-cap': 'round',
      })
    })
  })
})
