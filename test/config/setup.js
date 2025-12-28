require('dotenv').config();

// Set mock access token for tests using the test API key from .env
process.env.BKOI_ACCESS_TOKEN = process.env.TEST_BARIKOI_API_KEY || 'test-access-token';

// Mock browser APIs that may be needed by tests
global.TextDecoder = class TextDecoder {
  decode() { return ''; }
};
global.TextEncoder = class TextEncoder {
  encode() { return new Uint8Array(); }
};

// Mock WebGL and other browser APIs
global.WebGLRenderingContext = class WebGLRenderingContext {};
global.WebGL2RenderingContext = class WebGL2RenderingContext {};

// Mock URL.createObjectURL which may be used by some libraries
global.URL = global.URL || {
  createObjectURL: jest.fn(() => 'mock-url'),
  revokeObjectURL: jest.fn(),
};
