require('dotenv').config()

// Set mock access token for tests using the test API key from .env
process.env.BARIKOI_ACCESS_TOKEN = 'test-access-token'

// Mock browser APIs that may be needed by tests
global.TextDecoder = class TextDecoder {
  decode() {
    return ''
  }
}
global.TextEncoder = class TextEncoder {
  encode() {
    return new Uint8Array()
  }
}

// Mock WebGL and other browser APIs
global.WebGLRenderingContext = class WebGLRenderingContext {}
global.WebGL2RenderingContext = class WebGL2RenderingContext {}

// Mock Performance API
global.performance = {
  now: () => Date.now(),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(() => []),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
}

// Mock URL.createObjectURL which may be used by some libraries
global.URL = global.URL || {
  createObjectURL: jest.fn(() => 'mock-url'),
  revokeObjectURL: jest.fn(),
}

// Global test utilities for testing real bundled library
global.bkoiTestUtils = {
  // Helper for creating test containers
  createTestContainer: (id = 'test-container') => {
    const container = document.createElement('div')
    container.id = id
    container.style.width = '400px'
    container.style.height = '300px'
    document.body.appendChild(container)
    return container
  },

  // Helper for cleaning up test containers
  cleanupTestContainers: () => {
    const containers = document.querySelectorAll('[id^="test-container"], [id^="map-"]')
    containers.forEach(container => container.remove())
  },

  // Load real bundled library
  loadRealLibrary: () => {
    try {
      return require('../../dist/index.cjs')
    } catch {
      console.warn('Could not load CJS build, trying ESM...')
      return require('../../dist/index.js')
    }
  },

  // Create mock instances for tests that need isolation
  createMockMap: (options = {}) => {
    // For testing, we create a minimal mock that behaves like the real Map
    return {
      ...options,
      addControl: jest.fn(),
      removeControl: jest.fn(),
      setStyle: jest.fn(),
      getCenter: jest.fn(() => options.center || [90.4125, 23.8103]),
      getZoom: jest.fn(() => options.zoom || 10),
      on: jest.fn(),
      off: jest.fn(),
      fire: jest.fn(),
      loaded: jest.fn(() => true),
      isStyleLoaded: jest.fn(() => true),
    }
  },

  createMockMarker: (options = {}) => {
    const marker = {
      ...options,
      setLngLat: jest.fn(function (lngLat) {
        this.lngLat = lngLat
        return this
      }),
      getLngLat: jest.fn(() => marker.lngLat),
      addTo: jest.fn(() => marker),
      remove: jest.fn(() => marker),
      setPopup: jest.fn(function (popup) {
        this.popup = popup
        return this
      }),
      getPopup: jest.fn(() => marker.popup),
      togglePopup: jest.fn(() => marker),
    }
    return marker
  },

  createMockPopup: (options = {}) => {
    const popup = {
      ...options,
      setLngLat: jest.fn(function (lngLat) {
        this.lngLat = lngLat
        return this
      }),
      setHTML: jest.fn(function (html) {
        this.html = html
        return this
      }),
      setText: jest.fn(function (text) {
        this.text = text
        return this
      }),
      addTo: jest.fn(() => popup),
      remove: jest.fn(() => {
        popup.removed = true
        return popup
      }),
      isOpen: jest.fn(() => !popup.removed),
    }
    return popup
  },

  createMockNavigationControl: (options = {}) => {
    const control = {
      ...options,
      _container: document.createElement('div'),
      onAdd: jest.fn(() => control._container),
      onRemove: jest.fn(),
      _onZoom: jest.fn(),
      _onRotate: jest.fn(),
    }
    return control
  },

  createMockScaleControl: (options = {}) => {
    const control = {
      ...options,
      _container: document.createElement('div'),
      onAdd: jest.fn(() => control._container),
      onRemove: jest.fn(),
      setUnit: jest.fn(),
    }
    return control
  },

  createMockAttributionControl: (options = {}) => {
    const control = {
      ...options,
      _container: document.createElement('div'),
      onAdd: jest.fn(() => control._container),
      onRemove: jest.fn(),
      addAttribution: jest.fn(),
      removeAttribution: jest.fn(),
    }
    return control
  },

  createMockGeolocateControl: (options = {}) => {
    const control = {
      ...options,
      _container: document.createElement('div'),
      onAdd: jest.fn(() => control._container),
      onRemove: jest.fn(),
      trigger: jest.fn(),
      _onSuccess: jest.fn(),
      _onError: jest.fn(),
      _finish: jest.fn(),
      _setupUI: jest.fn(),
    }
    return control
  },

  createMockFullscreenControl: (options = {}) => {
    const control = {
      ...options,
      _container: document.createElement('div'),
      onAdd: jest.fn(() => control._container),
      onRemove: jest.fn(),
      _onClickFullscreen: jest.fn(),
      _setupUI: jest.fn(),
    }
    return control
  },
}
