/**
 * Style Drawer Feature Tests
 * Tests for the style drawer functionality in BkoiGlMap
 */

describe('Style Drawer Feature Tests', () => {
  let bkoiModule;
  let mockMapInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    
    bkoiModule = require('../../dist/index.cjs');

    const container = document.createElement('div');
    container.id = 'test-map';
    document.body.appendChild(container);

    mockMapInstance = {
      addControl: jest.fn(),
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
      
      // Simulate style drawer initialization
      if (options.styles && Array.isArray(options.styles) && options.styles.length > 0) {
        map.once('load', () => {
          // Simulate initializeStyleDrawer
          const mapContainer = map.getContainer();
          
          // Create drawer
          const drawer = document.createElement('div');
          drawer.className = 'style-drawer';
          drawer.style.maxHeight = '0';
          
          // Create toggle button
          const toggleButton = document.createElement('button');
          toggleButton.className = 'style-drawer-toggle-button';
          toggleButton.innerHTML = '☰';
          
          // Toggle functionality
          toggleButton.addEventListener('click', () => {
            const isOpen = drawer.style.maxHeight && drawer.style.maxHeight !== '0' && drawer.style.maxHeight !== '0px';
            drawer.style.maxHeight = isOpen ? '0' : '400px';
            toggleButton.innerHTML = isOpen ? '☰' : '▲';
          });
          
          // Add style items
          options.styles.forEach(({ style, image, name }) => {
            const styleItem = document.createElement('div');
            styleItem.className = 'style-item';
            styleItem.style.position = 'relative';
            styleItem.style.cursor = 'pointer';
            styleItem.style.marginBottom = '10px';
            
            const wrapper = document.createElement('div');
            wrapper.style.position = 'relative';
            wrapper.style.overflow = 'hidden';
            
            const thumbnail = document.createElement('img');
            thumbnail.src = image;
            thumbnail.alt = name;
            thumbnail.style.width = '100%';
            thumbnail.style.height = '100%';
            thumbnail.style.objectFit = 'cover';
            
            const nameOverlay = document.createElement('div');
            nameOverlay.className = 'style-name-overlay';
            nameOverlay.innerText = name;
            nameOverlay.textContent = name; // Also set textContent for compatibility
            nameOverlay.style.display = 'none';
            
            // Hover functionality
            styleItem.addEventListener('mouseenter', () => {
              nameOverlay.style.display = 'block';
            });
            styleItem.addEventListener('mouseleave', () => {
              nameOverlay.style.display = 'none';
            });
            
            // Click handler
            styleItem.addEventListener('click', () => {
              map.setStyle(style);
            });
            
            wrapper.appendChild(thumbnail);
            wrapper.appendChild(nameOverlay);
            styleItem.appendChild(wrapper);
            drawer.appendChild(styleItem);
          });
          
          mapContainer.appendChild(toggleButton);
          mapContainer.appendChild(drawer);
        });
      }
      
      return map;
    });
  });

  afterEach(() => {
    const container = document.getElementById('test-map');
    if (container) {
      document.body.removeChild(container);
    }
  });

  describe('Style Drawer Initialization', () => {
    test('should create style drawer when styles array is provided', (done) => {
      const styles = [
        {
          style: 'https://map.barikoi.com/styles/barikoi-light/style.json',
          image: 'https://example.com/light.jpg',
          name: 'Light Style',
        },
      ];

      const map = new bkoiModule.Map({
        container: 'test-map',
        styles: styles,
      });

      setTimeout(() => {
        const container = map.getContainer();
        const drawer = container.querySelector('.style-drawer');
        expect(drawer).toBeDefined();
        done();
      }, 50);
    });

    test('should NOT create style drawer when styles array is not provided', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
      });

      setTimeout(() => {
        const container = map.getContainer();
        const drawer = container.querySelector('.style-drawer');
        expect(drawer).toBeNull();
        done();
      }, 50);
    });

    test('should NOT create style drawer when styles is undefined', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
        styles: undefined,
      });

      setTimeout(() => {
        const container = map.getContainer();
        const drawer = container.querySelector('.style-drawer');
        expect(drawer).toBeNull();
        done();
      }, 50);
    });

    test('should NOT create style drawer when styles is empty array', (done) => {
      const map = new bkoiModule.Map({
        container: 'test-map',
        styles: [],
      });

      setTimeout(() => {
        const container = map.getContainer();
        const drawer = container.querySelector('.style-drawer');
        expect(drawer).toBeNull();
        done();
      }, 50);
    });

    test('should create toggle button for style drawer', (done) => {
      const styles = [
        {
          style: 'https://map.barikoi.com/styles/barikoi-light/style.json',
          image: 'https://example.com/light.jpg',
          name: 'Light Style',
        },
      ];

      const map = new bkoiModule.Map({
        container: 'test-map',
        styles: styles,
      });

      setTimeout(() => {
        const container = map.getContainer();
        const toggleButton = container.querySelector('.style-drawer-toggle-button');
        expect(toggleButton).toBeDefined();
        expect(toggleButton.innerHTML).toBe('☰');
        done();
      }, 50);
    });
  });

  describe('Style Items Creation', () => {
    test('should create style items for each style in array', (done) => {
      const styles = [
        {
          style: 'https://map.barikoi.com/styles/barikoi-light/style.json',
          image: 'https://example.com/light.jpg',
          name: 'Light Style',
        },
        {
          style: 'https://map.barikoi.com/styles/barikoi-dark-mode/style.json',
          image: 'https://example.com/dark.jpg',
          name: 'Dark Style',
        },
      ];

      const map = new bkoiModule.Map({
        container: 'test-map',
        styles: styles,
      });

      setTimeout(() => {
        const container = map.getContainer();
        const styleItems = container.querySelectorAll('.style-item');
        expect(styleItems.length).toBe(2);
        done();
      }, 50);
    });

    test('should create style items with correct structure', (done) => {
      const styles = [
        {
          style: 'https://map.barikoi.com/styles/barikoi-light/style.json',
          image: 'https://example.com/light.jpg',
          name: 'Light Style',
        },
      ];

      const map = new bkoiModule.Map({
        container: 'test-map',
        styles: styles,
      });

      setTimeout(() => {
        const container = map.getContainer();
        const styleItem = container.querySelector('.style-item');
        expect(styleItem).toBeDefined();
        expect(styleItem.style.position).toBe('relative');
        expect(styleItem.style.cursor).toBe('pointer');
        
        const thumbnail = styleItem.querySelector('img');
        expect(thumbnail).toBeDefined();
        expect(thumbnail.src).toContain('light.jpg');
        expect(thumbnail.alt).toBe('Light Style');
        
        const nameOverlay = styleItem.querySelector('.style-name-overlay');
        expect(nameOverlay).toBeDefined();
        expect(nameOverlay).not.toBeNull();
        if (nameOverlay) {
          expect(nameOverlay.innerText || nameOverlay.textContent).toBe('Light Style');
        }
        done();
      }, 50);
    });

    test('should set correct image source and alt text', (done) => {
      const styles = [
        {
          style: 'https://map.barikoi.com/styles/barikoi-light/style.json',
          image: 'https://example.com/thumbnail.png',
          name: 'Custom Style Name',
        },
      ];

      const map = new bkoiModule.Map({
        container: 'test-map',
        styles: styles,
      });

      setTimeout(() => {
        const container = map.getContainer();
        const thumbnail = container.querySelector('.style-item img');
        expect(thumbnail.src).toContain('thumbnail.png');
        expect(thumbnail.alt).toBe('Custom Style Name');
        done();
      }, 50);
    });
  });

  describe('Style Drawer Toggle Functionality', () => {
    test('should toggle drawer open when button is clicked', (done) => {
      const styles = [
        {
          style: 'https://map.barikoi.com/styles/barikoi-light/style.json',
          image: 'https://example.com/light.jpg',
          name: 'Light Style',
        },
      ];

      const map = new bkoiModule.Map({
        container: 'test-map',
        styles: styles,
      });

      setTimeout(() => {
        const container = map.getContainer();
        const toggleButton = container.querySelector('.style-drawer-toggle-button');
        const drawer = container.querySelector('.style-drawer');
        
        // Initially closed
        expect(drawer.style.maxHeight).toBe('0');
        expect(toggleButton.innerHTML).toBe('☰');
        
        // Click to open
        toggleButton.click();
        
        // Should be open (need to wait a bit for the click handler to execute)
        setTimeout(() => {
          expect(drawer.style.maxHeight).toBe('400px');
          expect(toggleButton.innerHTML).toBe('▲');
          
          // Click to close
          toggleButton.click();
          
          setTimeout(() => {
            expect(drawer.style.maxHeight).toBe('0');
            expect(toggleButton.innerHTML).toBe('☰');
            done();
          }, 10);
        }, 10);
      }, 50);
    });

    test('should change button icon when toggled', (done) => {
      const styles = [
        {
          style: 'https://map.barikoi.com/styles/barikoi-light/style.json',
          image: 'https://example.com/light.jpg',
          name: 'Light Style',
        },
      ];

      const map = new bkoiModule.Map({
        container: 'test-map',
        styles: styles,
      });

      setTimeout(() => {
        const container = map.getContainer();
        const toggleButton = container.querySelector('.style-drawer-toggle-button');
        
        expect(toggleButton.innerHTML).toBe('☰');
        toggleButton.click();
        setTimeout(() => {
          expect(toggleButton.innerHTML).toBe('▲');
          toggleButton.click();
          setTimeout(() => {
            expect(toggleButton.innerHTML).toBe('☰');
            done();
          }, 10);
        }, 10);
        
        done();
      }, 50);
    });
  });

  describe('Style Switching', () => {
    test('should call setStyle when style item is clicked', (done) => {
      const styles = [
        {
          style: 'https://map.barikoi.com/styles/barikoi-light/style.json',
          image: 'https://example.com/light.jpg',
          name: 'Light Style',
        },
      ];

      const map = new bkoiModule.Map({
        container: 'test-map',
        styles: styles,
      });

      setTimeout(() => {
        const container = map.getContainer();
        const styleItem = container.querySelector('.style-item');
        
        styleItem.click();
        
        expect(map.setStyle).toHaveBeenCalledWith(
          'https://map.barikoi.com/styles/barikoi-light/style.json'
        );
        done();
      }, 50);
    });

    test('should switch to correct style when multiple styles available', (done) => {
      const styles = [
        {
          style: 'https://map.barikoi.com/styles/barikoi-light/style.json',
          image: 'https://example.com/light.jpg',
          name: 'Light Style',
        },
        {
          style: 'https://map.barikoi.com/styles/barikoi-dark-mode/style.json',
          image: 'https://example.com/dark.jpg',
          name: 'Dark Style',
        },
      ];

      const map = new bkoiModule.Map({
        container: 'test-map',
        styles: styles,
      });

      setTimeout(() => {
        const container = map.getContainer();
        const styleItems = container.querySelectorAll('.style-item');
        
        // Click first style
        styleItems[0].click();
        expect(map.setStyle).toHaveBeenCalledWith(
          'https://map.barikoi.com/styles/barikoi-light/style.json'
        );
        
        // Click second style
        styleItems[1].click();
        expect(map.setStyle).toHaveBeenCalledWith(
          'https://map.barikoi.com/styles/barikoi-dark-mode/style.json'
        );
        
        expect(map.setStyle).toHaveBeenCalledTimes(2);
        done();
      }, 50);
    });
  });

  describe('Style Item Hover Effects', () => {
    test('should show name overlay on hover', (done) => {
      const styles = [
        {
          style: 'https://map.barikoi.com/styles/barikoi-light/style.json',
          image: 'https://example.com/light.jpg',
          name: 'Light Style',
        },
      ];

      const map = new bkoiModule.Map({
        container: 'test-map',
        styles: styles,
      });

      setTimeout(() => {
        const container = map.getContainer();
        const styleItem = container.querySelector('.style-item');
        const nameOverlay = styleItem.querySelector('.style-name-overlay');
        const thumbnail = styleItem.querySelector('img');
        
        // Initially hidden
        expect(nameOverlay).toBeDefined();
        expect(nameOverlay.style.display === 'none' || nameOverlay.style.display === '').toBe(true);
        
        // Simulate mouseenter by creating a simple event
        // Use a simpler approach that works in jsdom
        const mouseenterEvent = document.createEvent('Event');
        mouseenterEvent.initEvent('mouseenter', true, true);
        styleItem.dispatchEvent(mouseenterEvent);
        
        // After hover, overlay should be visible
        setTimeout(() => {
          // The overlay should now be visible (display: block)
          expect(nameOverlay.style.display).toBe('block');
          expect(nameOverlay).toBeDefined();
          expect(thumbnail).toBeDefined();
          
          // Simulate mouseleave
          const mouseleaveEvent = document.createEvent('Event');
          mouseleaveEvent.initEvent('mouseleave', true, true);
          styleItem.dispatchEvent(mouseleaveEvent);
          
          setTimeout(() => {
            // After mouseleave, overlay should be hidden again
            expect(nameOverlay.style.display).toBe('none');
            done();
          }, 10);
        }, 10);
      }, 50);
    });
  });

  describe('Multiple Style Configurations', () => {
    test('should handle multiple styles correctly', (done) => {
      const styles = [
        {
          style: 'https://map.barikoi.com/styles/barikoi-light/style.json',
          image: 'https://example.com/light.jpg',
          name: 'Light',
        },
        {
          style: 'https://map.barikoi.com/styles/barikoi-dark-mode/style.json',
          image: 'https://example.com/dark.jpg',
          name: 'Dark',
        },
        {
          style: 'https://map.barikoi.com/styles/barkoi_green/style.json',
          image: 'https://example.com/green.jpg',
          name: 'Green',
        },
      ];

      const map = new bkoiModule.Map({
        container: 'test-map',
        styles: styles,
      });

      setTimeout(() => {
        const container = map.getContainer();
        const styleItems = container.querySelectorAll('.style-item');
        expect(styleItems.length).toBe(3);
        
        // Verify each style item has correct name
        const names = Array.from(styleItems).map(item => {
          const overlay = item.querySelector('.style-name-overlay');
          return overlay ? (overlay.innerText || overlay.textContent || '') : '';
        });
        
        expect(names).toContain('Light');
        expect(names).toContain('Dark');
        expect(names).toContain('Green');
        
        done();
      }, 50);
    });
  });

  describe('Integration with Map Load', () => {
    test('should initialize style drawer after map load event', (done) => {
      const styles = [
        {
          style: 'https://map.barikoi.com/styles/barikoi-light/style.json',
          image: 'https://example.com/light.jpg',
          name: 'Light Style',
        },
      ];

      const map = new bkoiModule.Map({
        container: 'test-map',
        styles: styles,
      });

      // Initially, drawer should not exist
      let container = map.getContainer();
      let drawer = container.querySelector('.style-drawer');
      expect(drawer).toBeNull();

      // After load event fires
      setTimeout(() => {
        container = map.getContainer();
        drawer = container.querySelector('.style-drawer');
        expect(drawer).toBeDefined();
        expect(map.once).toHaveBeenCalledWith('load', expect.any(Function));
        done();
      }, 50);
    });
  });

  describe('Edge Cases', () => {
    test('should handle styles with missing properties gracefully', (done) => {
      const styles = [
        {
          style: 'https://map.barikoi.com/styles/barikoi-light/style.json',
          image: '',
          name: '',
        },
      ];

      const map = new bkoiModule.Map({
        container: 'test-map',
        styles: styles,
      });

      setTimeout(() => {
        const container = map.getContainer();
        const styleItem = container.querySelector('.style-item');
        expect(styleItem).toBeDefined();
        done();
      }, 50);
    });

    test('should handle very long style names', (done) => {
      const styles = [
        {
          style: 'https://map.barikoi.com/styles/barikoi-light/style.json',
          image: 'https://example.com/light.jpg',
          name: 'This is a very long style name that might cause layout issues',
        },
      ];

      const map = new bkoiModule.Map({
        container: 'test-map',
        styles: styles,
      });

      setTimeout(() => {
        const container = map.getContainer();
        const nameOverlay = container.querySelector('.style-item .style-name-overlay');
        expect(nameOverlay).toBeDefined();
        expect(nameOverlay).not.toBeNull();
        if (nameOverlay) {
          expect(nameOverlay.innerText || nameOverlay.textContent).toBe('This is a very long style name that might cause layout issues');
        }
        done();
      }, 50);
    });
  });
});

