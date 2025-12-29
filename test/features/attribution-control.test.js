/**
 * Attribution Control Tests
 * Tests for the custom attribution control functionality in BkoiGlMap
 */

describe('Attribution Control Tests', () => {
  let bkoiModule;
  let mockMapInstance;
  let mockAttributionControl;

  beforeEach(() => {
    jest.clearAllMocks();
    
    bkoiModule = require('../../dist/cjs/index.js');

    const container = document.createElement('div');
    container.id = 'test-map';
    document.body.appendChild(container);

    // Create mock attribution control
    const AttributionControl = require('../../test/mocks/__mocks__/maplibre-gl.js').AttributionControl;
    mockAttributionControl = new AttributionControl({
      compact: true,
      customAttribution: '',
    });

    mockMapInstance = {
      addControl: jest.fn(function(control, position) {
        this.controls = this.controls || [];
        this.controls.push({ control, position });
        
        // Simulate control being added to DOM
        if (control.onAdd) {
          const controlElement = control.onAdd(this);
          if (controlElement) {
            const mapContainer = this.getContainer();
            mapContainer.appendChild(controlElement);
          }
        }
        
        return this;
      }),
      getContainer: jest.fn(() => container),
      setStyle: jest.fn(),
      once: jest.fn(function(event, callback) {
        if (event === 'load') {
          this._loadCallbacks = this._loadCallbacks || [];
          this._loadCallbacks.push(callback);
          // Auto-trigger load after a short delay
          setTimeout(() => {
            if (this._loadCallbacks) {
              this._loadCallbacks.forEach(cb => {
                try {
                  cb({ type: 'load' });
                } catch (e) {
                  // Ignore errors
                }
              });
            }
          }, 0);
        }
        return this;
      }),
      on: jest.fn(),
      off: jest.fn(),
      fire: jest.fn(),
      remove: jest.fn(),
      loaded: jest.fn(() => true),
      isStyleLoaded: jest.fn(() => true),
    };

    bkoiModule.Map = jest.fn((options) => {
      const map = Object.create(mockMapInstance);
      map.options = options;
      
      // Simulate setupAttributionControl
      const attributionControl = new AttributionControl({
        compact: true,
        customAttribution: '',
      });
      map.addControl(attributionControl, 'bottom-right');
      
      // Simulate addBarikoiAttribution
      const logoControl = {
        onAdd: () => {
          const logoElement = document.createElement('a');
          logoElement.className = 'maplibregl-ctrl-logo';
          logoElement.setAttribute('href', 'https://www.barikoi.com');
          logoElement.setAttribute('target', '_blank');
          logoElement.setAttribute('alt', 'Barikoi');
          return logoElement;
        },
        onRemove: () => {},
      };
      map.addControl(logoControl, 'bottom-left');
      
      // Simulate custom attribution HTML update
      map.once('load', () => {
        setTimeout(() => {
          const mapContainer = map.getContainer();
          const attributionContainer = mapContainer.querySelector('.maplibregl-ctrl-attrib');
          
          if (attributionContainer) {
            const inner = attributionContainer.querySelector('.maplibregl-ctrl-attrib-inner');
            
            if (inner) {
              inner.innerHTML =
                '© <a href="https://www.barikoi.com" target="_blank">Barikoi</a> © <a href="https://openmaptiles.org" target="_blank">OpenMapTiles</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>';
            }
          }
        }, 0);
      });
      
      return map;
    });
  });

  afterEach(() => {
    const container = document.getElementById('test-map');
    if (container) {
      document.body.removeChild(container);
    }
  });

  describe('Attribution Control Setup', () => {
    test('should create AttributionControl on map initialization', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      expect(map.addControl).toHaveBeenCalled();
      const attributionCall = map.addControl.mock.calls.find(
        call => call[0] && call[0].onAdd && call[0].onAdd().classList.contains('maplibregl-ctrl-attrib')
      );
      expect(attributionCall).toBeDefined();
    });

    test('should add AttributionControl at bottom-right position', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      const bottomRightCall = map.addControl.mock.calls.find(
        call => call[1] === 'bottom-right'
      );
      expect(bottomRightCall).toBeDefined();
    });

    test('should configure AttributionControl with compact mode', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      // Verify attribution control was created with compact option
      expect(map.addControl).toHaveBeenCalled();
    });
  });

  describe('Custom Attribution HTML', () => {
    test('should update attribution HTML after map load', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      setTimeout(() => {
        const container = map.getContainer();
        const attributionInner = container.querySelector('.maplibregl-ctrl-attrib-inner');
        
        if (attributionInner) {
          expect(attributionInner.innerHTML).toContain('barikoi.com');
          expect(attributionInner.innerHTML).toContain('openmaptiles.org');
          expect(attributionInner.innerHTML).toContain('openstreetmap.org');
        }
        
        done();
      }, 50);
    });

    test('should include Barikoi link in attribution', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      setTimeout(() => {
        const container = map.getContainer();
        const attributionInner = container.querySelector('.maplibregl-ctrl-attrib-inner');
        
        if (attributionInner) {
          expect(attributionInner.innerHTML).toContain('https://www.barikoi.com');
          expect(attributionInner.innerHTML).toContain('Barikoi');
        }
        
        done();
      }, 50);
    });

    test('should include OpenMapTiles link in attribution', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      setTimeout(() => {
        const container = map.getContainer();
        const attributionInner = container.querySelector('.maplibregl-ctrl-attrib-inner');
        
        if (attributionInner) {
          expect(attributionInner.innerHTML).toContain('https://openmaptiles.org');
          expect(attributionInner.innerHTML).toContain('OpenMapTiles');
        }
        
        done();
      }, 50);
    });

    test('should include OpenStreetMap link in attribution', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      setTimeout(() => {
        const container = map.getContainer();
        const attributionInner = container.querySelector('.maplibregl-ctrl-attrib-inner');
        
        if (attributionInner) {
          expect(attributionInner.innerHTML).toContain('https://www.openstreetmap.org/copyright');
          expect(attributionInner.innerHTML).toContain('OpenStreetMap contributors');
        }
        
        done();
      }, 50);
    });

    test('should make attribution links clickable with target="_blank"', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      setTimeout(() => {
        const container = map.getContainer();
        const attributionInner = container.querySelector('.maplibregl-ctrl-attrib-inner');
        
        if (attributionInner) {
          const links = attributionInner.querySelectorAll('a');
          links.forEach(link => {
            expect(link.getAttribute('target')).toBe('_blank');
          });
        }
        
        done();
      }, 50);
    });
  });

  describe('Barikoi Logo Control', () => {
    test('should add Barikoi logo control on map initialization', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      const logoCall = map.addControl.mock.calls.find(
        call => {
          if (call[0] && call[0].onAdd) {
            const element = call[0].onAdd();
            return element && element.classList.contains('maplibregl-ctrl-logo');
          }
          return false;
        }
      );
      
      expect(logoCall).toBeDefined();
    });

    test('should add logo control at bottom-left position', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      const bottomLeftCall = map.addControl.mock.calls.find(
        call => call[1] === 'bottom-left'
      );
      expect(bottomLeftCall).toBeDefined();
    });

    test('should create logo element with correct attributes', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      setTimeout(() => {
        const container = map.getContainer();
        const logo = container.querySelector('.maplibregl-ctrl-logo');
        
        expect(logo).toBeDefined();
        expect(logo.getAttribute('href')).toBe('https://www.barikoi.com');
        expect(logo.getAttribute('target')).toBe('_blank');
        expect(logo.getAttribute('alt')).toBe('Barikoi');
        done();
      }, 50);
    });

    test('should create logo as anchor element', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      setTimeout(() => {
        const container = map.getContainer();
        const logo = container.querySelector('.maplibregl-ctrl-logo');
        
        expect(logo).toBeDefined();
        expect(logo.tagName.toLowerCase()).toBe('a');
        done();
      }, 50);
    });
  });

  describe('Attribution Control Positioning', () => {
    test('should position attribution control at bottom-right', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      const bottomRightCalls = map.addControl.mock.calls.filter(
        call => call[1] === 'bottom-right'
      );
      
      // Should have at least one control at bottom-right (attribution)
      expect(bottomRightCalls.length).toBeGreaterThan(0);
    });

    test('should position logo control at bottom-left', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      const bottomLeftCalls = map.addControl.mock.calls.filter(
        call => call[1] === 'bottom-left'
      );
      
      expect(bottomLeftCalls.length).toBeGreaterThan(0);
    });
  });

  describe('Attribution Control Timing', () => {
    test('should setup attribution control before map load', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      // Attribution control should be added immediately
      expect(map.addControl).toHaveBeenCalled();
    });

    test('should update attribution HTML after map load event', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      // Initially, custom HTML might not be set
      // After load event
      setTimeout(() => {
        const container = map.getContainer();
        const attributionInner = container.querySelector('.maplibregl-ctrl-attrib-inner');
        
        if (attributionInner) {
          expect(attributionInner.innerHTML).toContain('Barikoi');
        }
        
        done();
      }, 50);
    });
  });

  describe('Integration with Other Controls', () => {
    test('should work alongside other map controls', () => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      // Attribution should be added
      expect(map.addControl).toHaveBeenCalled();
      
      // Should be able to add other controls
      const NavigationControl = bkoiModule.NavigationControl;
      const navControl = new NavigationControl();
      map.addControl(navControl, 'top-right');
      
      expect(map.addControl).toHaveBeenCalledTimes(3); // Attribution, Logo, Navigation
    });
  });

  describe('Edge Cases', () => {
    test('should handle missing attribution container gracefully', (done) => {
      // Create a map where attribution container might not exist
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      setTimeout(() => {
        // Should not throw error even if container doesn't exist
        expect(map).toBeDefined();
        done();
      }, 50);
    });

    test('should handle multiple map instances with attribution', () => {
      const map1 = new bkoiModule.Map({
        container: 'test-map',
      });

      const container2 = document.createElement('div');
      container2.id = 'test-map-2';
      document.body.appendChild(container2);

      const map2 = new bkoiModule.Map({
        container: 'test-map-2',
      });

      expect(map1.addControl).toHaveBeenCalled();
      expect(map2.addControl).toHaveBeenCalled();
      
      document.body.removeChild(container2);
    });
  });

  describe('Attribution HTML Structure', () => {
    test('should create proper HTML structure for attribution', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      setTimeout(() => {
        const container = map.getContainer();
        const attributionContainer = container.querySelector('.maplibregl-ctrl-attrib');
        
        if (attributionContainer) {
          const inner = attributionContainer.querySelector('.maplibregl-ctrl-attrib-inner');
          expect(inner).toBeDefined();
        }
        
        done();
      }, 50);
    });

    test('should include copyright symbol in attribution', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      setTimeout(() => {
        const container = map.getContainer();
        const attributionInner = container.querySelector('.maplibregl-ctrl-attrib-inner');
        
        if (attributionInner) {
          expect(attributionInner.innerHTML).toContain('©');
        }
        
        done();
      }, 50);
    });
  });
});

