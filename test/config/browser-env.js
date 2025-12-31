// Enhanced browser environment simulation for testing UMD/IIFE builds
// This provides comprehensive browser API mocks that MapLibre GL JS requires

// Note: JSDOM is already initialized by Jest's jsdom environment
// We just need to add additional browser API mocks on top of the existing jsdom setup

// Canvas API mocks
global.HTMLCanvasElement = class HTMLCanvasElement {
  constructor() {
    this.width = 300;
    this.height = 150;
  }

  getContext(contextType) {
    if (contextType === '2d') {
      return new CanvasRenderingContext2D();
    }
    if (contextType === 'webgl' || contextType === 'experimental-webgl') {
      return new WebGLRenderingContext();
    }
    if (contextType === 'webgl2') {
      return new WebGL2RenderingContext();
    }
    return null;
  }

  toDataURL() {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }
};

global.CanvasRenderingContext2D = class CanvasRenderingContext2D {
  fillRect() {}
  clearRect() {}
  getImageData() {
    return {
      data: new Uint8ClampedArray(4),
      width: 1,
      height: 1
    };
  }
  putImageData() {}
  createImageData() {
    return {
      data: new Uint8ClampedArray(4),
      width: 1,
      height: 1
    };
  }
  setTransform() {}
  drawImage() {}
  save() {}
  restore() {}
  beginPath() {}
  moveTo() {}
  lineTo() {}
  closePath() {}
  stroke() {}
  fill() {}
  arc() {}
  fillText() {}
  measureText() {
    return { width: 0 };
  }
};

// WebGL API mocks
global.WebGLRenderingContext = class WebGLRenderingContext {
  createShader() { return {}; }
  shaderSource() {}
  compileShader() {}
  createProgram() { return {}; }
  attachShader() {}
  linkProgram() {}
  useProgram() {}
  getUniformLocation() { return {}; }
  uniformMatrix4fv() {}
  enable() {}
  disable() {}
  blendFunc() {}
  clearColor() {}
  clear() {}
  viewport() {}
  createBuffer() { return {}; }
  bindBuffer() {}
  bufferData() {}
  createTexture() { return {}; }
  bindTexture() {}
  texParameteri() {}
  texImage2D() {}
  activeTexture() {}
  getExtension() { return {}; }
  getParameter() { return 1; }
  getProgramParameter() { return true; }
  getShaderParameter() { return true; }
  getAttribLocation() { return 0; }
  vertexAttribPointer() {}
  enableVertexAttribArray() {}
  drawArrays() {}
  drawElements() {}
};

global.WebGL2RenderingContext = class WebGL2RenderingContext extends WebGLRenderingContext {};

// Image and media mocks
global.Image = class Image {
  constructor() {
    this.src = '';
    this.onload = null;
    this.onerror = null;
    this.complete = true;
    this.width = 100;
    this.height = 100;
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }
};

global.HTMLImageElement = class HTMLImageElement extends Image {};

global.ImageData = class ImageData {
  constructor(width, height) {
    this.width = width || 1;
    this.height = height || 1;
    this.data = new Uint8ClampedArray((width || 1) * (height || 1) * 4);
  }
};

// URL and Blob mocks
global.URL.createObjectURL = jest.fn(() => 'mock://url');
global.URL.revokeObjectURL = jest.fn();

global.Blob = class Blob {
  constructor(parts, options) {
    this.parts = parts;
    this.options = options;
  }
};

// XMLHttpRequest mock
global.XMLHttpRequest = class XMLHttpRequest {
  constructor() {
    this.readyState = 4;
    this.status = 200;
    this.responseText = '{}';
    this.response = '{}';
  }

  open() {}
  send() {
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }
  setRequestHeader() {}
};

// Event and DOM event mocks
global.Event = class Event {
  constructor(type) {
    this.type = type;
  }
};

global.CustomEvent = class CustomEvent extends Event {
  constructor(type, options = {}) {
    super(type);
    this.detail = options.detail;
  }
};

// Performance API
global.performance = {
  now: () => Date.now(),
  mark: () => {},
  measure: () => {},
  getEntriesByName: () => [],
  getEntriesByType: () => [],
};

// Console API (ensure available)
global.console = global.console || {
  log: () => {},
  warn: () => {},
  error: () => {},
  info: () => {},
  debug: () => {},
};

// RequestAnimationFrame
global.requestAnimationFrame = (callback) => setTimeout(callback, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Geolocation API
global.navigator.geolocation = {
  getCurrentPosition: (success) => {
    success({
      coords: {
        latitude: 23.8103,
        longitude: 90.4125,
        accuracy: 100
      }
    });
  },
  watchPosition: () => 1,
  clearWatch: () => {}
};

// Device orientation
global.DeviceOrientationEvent = class DeviceOrientationEvent extends Event {};

// Touch events
global.TouchEvent = class TouchEvent extends Event {};
global.Touch = class Touch {
  constructor(options = {}) {
    this.identifier = options.identifier || 0;
    this.target = options.target || document.createElement('div');
    this.clientX = options.clientX || 0;
    this.clientY = options.clientY || 0;
    this.pageX = options.pageX || 0;
    this.pageY = options.pageY || 0;
    this.screenX = options.screenX || 0;
    this.screenY = options.screenY || 0;
  }
};

// Pointer events
global.PointerEvent = class PointerEvent extends Event {};

// Wheel events
global.WheelEvent = class WheelEvent extends Event {};

// Keyboard events
global.KeyboardEvent = class KeyboardEvent extends Event {};

// Mouse events
global.MouseEvent = class MouseEvent extends Event {};

// Additional browser APIs that might be needed
global.HTMLDivElement = class HTMLDivElement {};
global.HTMLButtonElement = class HTMLButtonElement {};
global.HTMLAnchorElement = class HTMLAnchorElement {};
global.HTMLImageElement = class HTMLImageElement {};

// CSS and style mocks
global.getComputedStyle = () => ({
  getPropertyValue: () => '',
  setProperty: () => {},
});

// Local storage mock
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
};

global.sessionStorage = { ...global.localStorage };

// MatchMedia
global.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {},
});

// CSS and animation APIs
global.CSS = {
  supports: () => true,
};

global.Animation = class Animation {
  play() {}
  pause() {}
  cancel() {}
};

// Web Audio API (if needed)
global.AudioContext = class AudioContext {};
global.webkitAudioContext = global.AudioContext;

// WebRTC (if needed)
global.RTCPeerConnection = class RTCPeerConnection {};
global.webkitRTCPeerConnection = global.RTCPeerConnection;

// Service Worker (if needed)
global.ServiceWorker = class ServiceWorker {};
global.ServiceWorkerRegistration = class ServiceWorkerRegistration {};

// Notification API
global.Notification = class Notification {
  constructor(title, options) {
    this.title = title;
    this.options = options;
  }

  static requestPermission() {
    return Promise.resolve('granted');
  }
};

// Battery API
global.navigator.getBattery = () => Promise.resolve({
  charging: true,
  chargingTime: 0,
  dischargingTime: Infinity,
  level: 1,
});

// Vibration API
global.navigator.vibrate = () => true;

// Clipboard API
global.navigator.clipboard = {
  readText: () => Promise.resolve(''),
  writeText: () => Promise.resolve(),
};

// Permissions API
global.navigator.permissions = {
  query: () => Promise.resolve({ state: 'granted' }),
};

// Wake Lock API
global.navigator.wakeLock = {
  request: () => Promise.resolve({
    released: false,
    release: () => {},
  }),
};
