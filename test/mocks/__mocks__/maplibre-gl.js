// Enhanced mock for maplibre-gl with comprehensive functionality
const mockMap = jest.fn().mockImplementation((options) => {
  const mockInstance = {
    options,
    addControl: jest.fn(function(control, position) {
      // Store controls for testing
      this.controls = this.controls || [];
      this.controls.push({ control, position });
      return this;
    }),
    removeControl: jest.fn(function(control) {
      this.controls = this.controls.filter(c => c.control !== control);
      return this;
    }),
    hasControl: jest.fn(function(control) {
      return this.controls.some(c => c.control === control);
    }),
    once: jest.fn(function(event, callback) {
      // Simulate event firing
      if (event === 'load') {
        setTimeout(() => callback({ type: 'load' }), 0);
      }
      return this;
    }),
    on: jest.fn(function(event, callback) {
      // Store event listeners
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
    getContainer: jest.fn(() => {
      // Return the actual container if it exists, otherwise create one
      if (options && options.container) {
        if (typeof options.container === 'string') {
          return document.getElementById(options.container) || document.createElement('div');
        }
        return options.container;
      }
      return document.createElement('div');
    }),
    setStyle: jest.fn(function(style) {
      this.style = style;
      return this;
    }),
    getStyle: jest.fn(() => this.style),
    setCenter: jest.fn(function(center) {
      this.center = center;
      return this;
    }),
    getCenter: jest.fn(() => this.center || [90.4125, 23.8103]),
    setZoom: jest.fn(function(zoom) {
      this.zoom = zoom;
      return this;
    }),
    getZoom: jest.fn(() => this.zoom || 10),
    setBearing: jest.fn(function(bearing) {
      this.bearing = bearing;
      return this;
    }),
    getBearing: jest.fn(() => this.bearing || 0),
    setPitch: jest.fn(function(pitch) {
      this.pitch = pitch;
      return this;
    }),
    getPitch: jest.fn(() => this.pitch || 0),
    flyTo: jest.fn(function(options) {
      Object.assign(this, options);
      return this;
    }),
    easeTo: jest.fn(function(options) {
      Object.assign(this, options);
      return this;
    }),
    zoomTo: jest.fn(function(zoom, options) {
      this.zoom = zoom;
      return this;
    }),
    zoomIn: jest.fn(() => {
      this.zoom = (this.zoom || 10) + 1;
      return this;
    }),
    zoomOut: jest.fn(() => {
      this.zoom = (this.zoom || 10) - 1;
      return this;
    }),
    panTo: jest.fn(function(center) {
      this.center = center;
      return this;
    }),
    panBy: jest.fn(function(offset) {
      // Simplified pan simulation
      return this;
    }),
    fitBounds: jest.fn(function(bounds, options) {
      this.bounds = bounds;
      return this;
    }),
    resize: jest.fn(() => this),
    remove: jest.fn(() => {
      // Cleanup
      this.removed = true;
      return this;
    }),
    loaded: jest.fn(() => true),
    isStyleLoaded: jest.fn(() => true),
    isMoving: jest.fn(() => false),
    isZooming: jest.fn(() => false),
    isRotating: jest.fn(() => false),
    // Performance tracking
    _frameId: null,
    _startTime: Date.now(),
    getPerformanceMetrics: jest.fn(() => ({
      loadTime: Date.now() - this._startTime,
      renderCount: 0,
      memoryUsage: 0
    }))
  };

  // Initialize with provided options
  if (options) {
    Object.assign(mockInstance, options);
  }

  return mockInstance;
});

// Enhanced control mocks with accessibility features
const mockNavigationControl = jest.fn().mockImplementation((options) => ({
  options: options || {},
  on: jest.fn(function(event, callback) {
    // Store event listeners
    this._listeners = this._listeners || {};
    this._listeners[event] = this._listeners[event] || [];
    this._listeners[event].push(callback);
    return this;
  }),
  onAdd: jest.fn(() => {
    const container = document.createElement('div');
    container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
    container.innerHTML = `
      <button class="maplibregl-ctrl-zoom-in" aria-label="Zoom in" type="button">+</button>
      <button class="maplibregl-ctrl-zoom-out" aria-label="Zoom out" type="button">−</button>
      <button class="maplibregl-ctrl-compass" aria-label="Reset north" type="button">
        <span class="maplibregl-ctrl-icon" aria-hidden="true"></span>
      </button>
    `;
    return container;
  }),
  onRemove: jest.fn(),
  _zoomIn: jest.fn(),
  _zoomOut: jest.fn(),
  _resetNorth: jest.fn()
}));

const mockGeolocateControl = jest.fn().mockImplementation((options) => ({
  options: options || {},
  onAdd: jest.fn(() => {
    const container = document.createElement('div');
    container.className = 'maplibregl-ctrl maplibregl-ctrl-geolocate';
    container.innerHTML = `
      <button class="maplibregl-ctrl-geolocate" aria-label="Find my location" type="button">
        <span class="maplibregl-ctrl-icon" aria-hidden="true"></span>
      </button>
    `;
    return container;
  }),
  onRemove: jest.fn(),
  trigger: jest.fn(),
  _onSuccess: jest.fn(),
  _onError: jest.fn(),
  _finish: jest.fn(),
  _setupUI: jest.fn()
}));

const mockAttributionControl = jest.fn().mockImplementation((options) => ({
  options: options || {},
  onAdd: jest.fn(() => {
    const container = document.createElement('div');
    container.className = 'maplibregl-ctrl maplibregl-ctrl-attrib';
    container.innerHTML = '<div class="maplibregl-ctrl-attrib-inner">© Barikoi</div>';
    return container;
  }),
  onRemove: jest.fn(),
  _updateAttributions: jest.fn(),
  _updateCompact: jest.fn()
}));

const mockScaleControl = jest.fn().mockImplementation((options) => ({
  options: options || { maxWidth: 100, unit: 'metric' },
  onAdd: jest.fn(() => {
    const container = document.createElement('div');
    container.className = 'maplibregl-ctrl maplibregl-ctrl-scale';
    container.innerHTML = '<div class="maplibregl-ctrl-scale-inner">100 m</div>';
    return container;
  }),
  onRemove: jest.fn(),
  setUnit: jest.fn(),
  _onMove: jest.fn(),
  _updateScale: jest.fn()
}));

const mockFullscreenControl = jest.fn().mockImplementation((options) => ({
  options: options || {},
  onAdd: jest.fn(() => {
    const container = document.createElement('div');
    container.className = 'maplibregl-ctrl maplibregl-ctrl-fullscreen';
    container.innerHTML = `
      <button class="maplibregl-ctrl-fullscreen" aria-label="Toggle fullscreen" type="button">
        <span class="maplibregl-ctrl-icon" aria-hidden="true"></span>
      </button>
    `;
    return container;
  }),
  onRemove: jest.fn(),
  _onClickFullscreen: jest.fn(),
  _updateIcon: jest.fn()
}));

// Enhanced popup mock with accessibility
const mockPopup = jest.fn().mockImplementation((options) => {
  const mockInstance = {
    options: options || {},
    setLngLat: jest.fn(function(lngLat) {
      this.lngLat = lngLat;
      return this;
    }),
    setHTML: jest.fn(function(html) {
      this.html = html;
      return this;
    }),
    setText: jest.fn(function(text) {
      this.text = text;
      return this;
    }),
    addTo: jest.fn(function(map) {
      this.map = map;
      return this;
    }),
    remove: jest.fn(() => {
      this.removed = true;
      return this;
    }),
    isOpen: jest.fn(() => !this.removed),
    getLngLat: jest.fn(() => this.lngLat),
    setOffset: jest.fn(function(offset) {
      this.offset = offset;
      return this;
    }),
    // Accessibility features
    _content: null,
    _createContent: jest.fn(function() {
      this._content = document.createElement('div');
      this._content.className = 'maplibregl-popup-content';
      if (this.options.className) {
        this._content.classList.add(this.options.className);
      }
      return this._content;
    }),
    _update: jest.fn(),
    _onClose: jest.fn()
  };

  return mockInstance;
});

// Enhanced marker mock with accessibility
const mockMarker = jest.fn().mockImplementation((options) => {
  const mockInstance = {
    options: options || {},
    setLngLat: jest.fn(function(lngLat) {
      this.lngLat = lngLat;
      return this;
    }),
    getLngLat: jest.fn(() => this.lngLat),
    addTo: jest.fn(function(map) {
      this.map = map;
      return this;
    }),
    remove: jest.fn(() => {
      this.removed = true;
      return this;
    }),
    setPopup: jest.fn(function(popup) {
      this.popup = popup;
      return this;
    }),
    getPopup: jest.fn(() => this.popup),
    togglePopup: jest.fn(),
    getElement: jest.fn(() => {
      if (!this._element) {
        this._element = document.createElement('div');
        this._element.className = 'maplibregl-marker';
        this._element.setAttribute('role', 'button');
        this._element.setAttribute('tabindex', '0');
        this._element.setAttribute('aria-label', 'Map marker');
      }
      return this._element;
    }),
    setOffset: jest.fn(function(offset) {
      this.offset = offset;
      return this;
    }),
    // Accessibility features
    _element: null,
    _onMapClick: jest.fn(),
    _update: jest.fn()
  };

  return mockInstance;
});

// Enhanced utility class mocks
const mockLngLat = jest.fn().mockImplementation((lng, lat) => ({
  lng,
  lat,
  wrap: jest.fn(() => new mockLngLat(lng, lat)),
  toArray: jest.fn(() => [lng, lat]),
  toString: jest.fn(() => `${lng},${lat}`),
  distanceTo: jest.fn(() => 1000),
  toBounds: jest.fn(() => new mockLngLatBounds([lng - 0.01, lat - 0.01], [lng + 0.01, lat + 0.01]))
}));

const mockLngLatBounds = jest.fn().mockImplementation((sw, ne) => ({
  _sw: sw,
  _ne: ne,
  getSouthWest: jest.fn(() => sw),
  getNorthEast: jest.fn(() => ne),
  getSouth: jest.fn(() => sw[1]),
  getWest: jest.fn(() => sw[0]),
  getNorth: jest.fn(() => ne[1]),
  getEast: jest.fn(() => ne[0]),
  getCenter: jest.fn(() => [(sw[0] + ne[0]) / 2, (sw[1] + ne[1]) / 2]),
  contains: jest.fn((lngLat) => {
    const [lng, lat] = Array.isArray(lngLat) ? lngLat : [lngLat.lng, lngLat.lat];
    return lng >= sw[0] && lng <= ne[0] && lat >= sw[1] && lat <= ne[1];
  }),
  extend: jest.fn(function(point) {
    // Simplified extend logic
    return this;
  }),
  toArray: jest.fn(() => [sw, ne]),
  isValid: jest.fn(() => true)
}));

const mockPoint = jest.fn().mockImplementation((x, y) => ({
  x,
  y,
  add: jest.fn((p) => new mockPoint(x + p.x, y + p.y)),
  sub: jest.fn((p) => new mockPoint(x - p.x, y - p.y)),
  mult: jest.fn((k) => new mockPoint(x * k, y * k)),
  div: jest.fn((k) => new mockPoint(x / k, y / k)),
  mag: jest.fn(() => Math.sqrt(x * x + y * y)),
  equals: jest.fn((p) => x === p.x && y === p.y),
  clone: jest.fn(() => new mockPoint(x, y))
}));

const mockMercatorCoordinate = jest.fn().mockImplementation((x, y, z) => ({
  x,
  y,
  z: z || 0,
  toLngLat: jest.fn(() => new mockLngLat(x * 360 - 180, (Math.atan(Math.exp(y * Math.PI)) - Math.PI/4) * 360 / Math.PI)),
  meterInMercatorCoordinateUnits: jest.fn(() => 1)
}));

const mockEvented = jest.fn().mockImplementation(() => ({
  on: jest.fn(function(type, listener) {
    this._listeners = this._listeners || {};
    this._listeners[type] = this._listeners[type] || [];
    this._listeners[type].push(listener);
    return this;
  }),
  off: jest.fn(function(type, listener) {
    if (this._listeners && this._listeners[type]) {
      this._listeners[type] = this._listeners[type].filter(l => l !== listener);
    }
    return this;
  }),
  fire: jest.fn(function(event, properties) {
    if (this._listeners && this._listeners[event.type || event]) {
      const listeners = this._listeners[event.type || event];
      listeners.forEach(listener => listener(properties || event));
    }
    return this;
  }),
  listens: jest.fn(function(type) {
    return !!(this._listeners && this._listeners[type] && this._listeners[type].length);
  })
}));

// Enhanced utility function mocks
const mockSetRTLTextPlugin = jest.fn((url, callback, deferred) => {
  if (callback) callback();
});

const mockGetRTLTextPluginStatus = jest.fn(() => 'unavailable');

const mockPrewarm = jest.fn();
const mockClearPrewarmedResources = jest.fn();

// Enhanced style mock
const mockStyle = jest.fn().mockImplementation(() => ({
  loadURL: jest.fn(),
  loadJSON: jest.fn(),
  _load: jest.fn(),
  _serialize: jest.fn(),
  hasClass: jest.fn(() => false),
  addClass: jest.fn(),
  removeClass: jest.fn(),
  setClassList: jest.fn(),
  getClasses: jest.fn(() => []),
  isLoaded: jest.fn(() => true),
  _update: jest.fn()
}));

module.exports = {
  Map: mockMap,
  NavigationControl: mockNavigationControl,
  GeolocateControl: mockGeolocateControl,
  AttributionControl: mockAttributionControl,
  ScaleControl: mockScaleControl,
  FullscreenControl: mockFullscreenControl,
  Popup: mockPopup,
  Marker: mockMarker,
  Style: mockStyle,
  LngLat: mockLngLat,
  LngLatBounds: mockLngLatBounds,
  Point: mockPoint,
  MercatorCoordinate: mockMercatorCoordinate,
  Evented: mockEvented,
  setRTLTextPlugin: mockSetRTLTextPlugin,
  getRTLTextPluginStatus: mockGetRTLTextPluginStatus,
  prewarm: mockPrewarm,
  clearPrewarmedResources: mockClearPrewarmedResources,
  // Version info
  version: '2.4.0',
  supported: jest.fn(() => true),
  setRTLTextPlugin: mockSetRTLTextPlugin,
  getRTLTextPluginStatus: mockGetRTLTextPluginStatus,
  prewarm: mockPrewarm,
  clearPrewarmedResources: mockClearPrewarmedResources
};
