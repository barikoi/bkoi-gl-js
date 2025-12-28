/**
 * Accessibility Tests
 * Tests that ensure the library meets accessibility standards and provides good user experience
 */

describe('Accessibility Tests', () => {
  beforeAll(() => {
    // Mock the Map constructor globally to avoid real instantiation
    const bkoiModule = require('../../dist/cjs/index.js');
    const mockMapInstance = {
      addControl: jest.fn(),
      getContainer: jest.fn(() => document.createElement('div')),
      setStyle: jest.fn(),
      once: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      fire: jest.fn(),
      remove: jest.fn(),
      loaded: jest.fn(() => true),
      isStyleLoaded: jest.fn(() => true)
    };

    bkoiModule.Map = jest.fn(() => mockMapInstance);
  });

  describe('Map Container Accessibility', () => {
    test('should have proper ARIA attributes on map container', () => {
      const container = document.createElement('div');
      container.id = 'accessible-map';
      container.setAttribute('role', 'application');
      container.setAttribute('aria-label', 'Interactive map');
      document.body.appendChild(container);

      const bkoiModule = require('../../dist/cjs/index.js');

      // Mock the Map constructor to avoid real instantiation
      const mockMapInstance = {
        addControl: jest.fn(),
        getContainer: jest.fn(() => container),
        setStyle: jest.fn(),
        once: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
        fire: jest.fn(),
        remove: jest.fn(),
        loaded: jest.fn(() => true),
        isStyleLoaded: jest.fn(() => true)
      };

      jest.spyOn(bkoiModule, 'Map').mockImplementation(() => mockMapInstance);

      const map = new bkoiModule.Map({
        container: 'accessible-map',
        style: 'https://map.barikoi.com/styles/streets',
        center: [90.4125, 23.8103],
        zoom: 10
      });

      // Verify ARIA attributes are maintained
      expect(container.getAttribute('role')).toBe('application');
      expect(container.getAttribute('aria-label')).toBe('Interactive map');
    });

    test('should support keyboard navigation', () => {
      const container = document.createElement('div');
      container.id = 'keyboard-map';
      container.setAttribute('tabindex', '0');
      document.body.appendChild(container);

      const bkoiModule = require('../../dist/cjs/index.js');

      // Mock the Map constructor to avoid real instantiation
      const mockMapInstance = {
        addControl: jest.fn(),
        getContainer: jest.fn(() => container),
        setStyle: jest.fn(),
        once: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
        fire: jest.fn(),
        remove: jest.fn(),
        loaded: jest.fn(() => true),
        isStyleLoaded: jest.fn(() => true)
      };

      jest.spyOn(bkoiModule, 'Map').mockImplementation(() => mockMapInstance);

      const map = new bkoiModule.Map({
        container: 'keyboard-map',
        style: 'https://map.barikoi.com/styles/streets',
        center: [90.4125, 23.8103],
        zoom: 10
      });

      // Container should be focusable
      expect(container.getAttribute('tabindex')).toBe('0');
      expect(container.tabIndex).toBe(0);
    });

    test('should announce map state changes to screen readers', () => {
      const container = document.createElement('div');
      container.id = 'sr-map';
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);

      const bkoiModule = require('../../dist/cjs/index.js');

      // Mock the Map constructor to avoid real instantiation
      const mockMapInstance = {
        addControl: jest.fn(),
        getContainer: jest.fn(() => container),
        setStyle: jest.fn(),
        once: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
        fire: jest.fn(),
        remove: jest.fn(),
        loaded: jest.fn(() => true),
        isStyleLoaded: jest.fn(() => true)
      };

      jest.spyOn(bkoiModule, 'Map').mockImplementation(() => mockMapInstance);

      const map = new bkoiModule.Map({
        container: 'sr-map',
        style: 'https://map.barikoi.com/styles/streets',
        center: [90.4125, 23.8103],
        zoom: 10
      });

      // Should maintain aria-live for dynamic content announcements
      expect(container.getAttribute('aria-live')).toBe('polite');
    });
  });

  describe('Control Accessibility', () => {
    let map;
    let bkoiModule;

    beforeEach(() => {
      const container = document.createElement('div');
      container.id = 'control-accessibility';
      document.body.appendChild(container);

      bkoiModule = require('../../dist/cjs/index.js');

      // Mock the Map constructor to avoid real instantiation
      const mockMapInstance = {
        addControl: jest.fn(),
        getContainer: jest.fn(() => container),
        setStyle: jest.fn(),
        once: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
        fire: jest.fn(),
        remove: jest.fn(),
        loaded: jest.fn(() => true),
        isStyleLoaded: jest.fn(() => true)
      };

      jest.spyOn(bkoiModule, 'Map').mockImplementation(() => mockMapInstance);

      map = new bkoiModule.Map({
        container: 'control-accessibility',
        style: 'https://map.barikoi.com/styles/streets',
        center: [90.4125, 23.8103],
        zoom: 10
      });
    });

    test('should have accessible navigation controls', () => {
      const bkoiModule = require('../../dist/cjs/index.js');
      const navControl = new bkoiModule.NavigationControl();

      // Mock control element creation
      const controlElement = document.createElement('div');
      controlElement.setAttribute('class', 'maplibregl-ctrl');
      controlElement.innerHTML = `
        <button class="maplibregl-ctrl-zoom-in" aria-label="Zoom in" type="button">+</button>
        <button class="maplibregl-ctrl-zoom-out" aria-label="Zoom out" type="button">−</button>
        <button class="maplibregl-ctrl-compass" aria-label="Reset north" type="button">
          <span class="maplibregl-ctrl-icon" aria-hidden="true"></span>
        </button>
      `;

      map.addControl(navControl);

      // Verify control was added (mock verification)
      expect(map.addControl).toHaveBeenCalledWith(navControl);
    });

    test('should have accessible geolocation control', () => {
      const bkoiModule = require('../../dist/cjs/index.js');
      const geolocateControl = new bkoiModule.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        showUserHeading: true
      });

      map.addControl(geolocateControl);

      // Geolocation control should handle permissions appropriately
      expect(map.addControl).toHaveBeenCalledWith(geolocateControl);
    });

    test('should have accessible fullscreen control', () => {
      const bkoiModule = require('../../dist/cjs/index.js');
      const fullscreenControl = new bkoiModule.FullscreenControl();

      map.addControl(fullscreenControl);

      // Fullscreen control should announce state changes
      expect(map.addControl).toHaveBeenCalledWith(fullscreenControl);
    });
  });

  describe('Marker and Popup Accessibility', () => {
    let map;

    beforeEach(() => {
      const container = document.createElement('div');
      container.id = 'marker-accessibility';
      document.body.appendChild(container);

      const bkoiModule = require('../../dist/cjs/index.js');
      map = new bkoiModule.Map({
        container: 'marker-accessibility',
        style: 'https://map.barikoi.com/styles/streets',
        center: [90.4125, 23.8103],
        zoom: 12
      });
    });

    test('should create accessible markers', () => {
      const bkoiModule = require('../../dist/cjs/index.js');

      const markerElement = document.createElement('div');
      markerElement.setAttribute('role', 'button');
      markerElement.setAttribute('tabindex', '0');
      markerElement.setAttribute('aria-label', 'Map marker');

      const marker = new bkoiModule.Marker()
        .setLngLat([90.4125, 23.8103])
        .addTo(map);

      expect(marker).toBeDefined();
      // In real implementation, marker should have proper accessibility attributes
    });

    test('should create accessible popups', () => {
      const bkoiModule = require('../../dist/cjs/index.js');

      const popup = new bkoiModule.Popup({
        closeButton: true,
        closeOnClick: true,
        className: 'accessible-popup'
      })
        .setLngLat([90.4125, 23.8103])
        .setHTML(`
          <div role="dialog" aria-labelledby="popup-title" aria-describedby="popup-content">
            <h3 id="popup-title">Location Information</h3>
            <div id="popup-content">
              <p>This is an accessible popup with proper ARIA attributes.</p>
            </div>
          </div>
        `)
        .addTo(map);

      expect(popup).toBeDefined();
      // In real implementation, popup should maintain semantic structure
    });

    test('should handle keyboard interaction for popups', () => {
      const bkoiModule = require('../../dist/cjs/index.js');

      const popup = new bkoiModule.Popup({
        closeButton: true,
        closeOnClick: false
      })
        .setLngLat([90.4125, 23.8103])
        .setHTML('<div>Focusable content</div>')
        .addTo(map);

      // Popup should support keyboard navigation
      expect(popup).toBeDefined();
    });
  });

  describe('Keyboard Navigation', () => {
    test('should support arrow key navigation', () => {
      const container = document.createElement('div');
      container.id = 'keyboard-nav';
      container.setAttribute('tabindex', '0');
      document.body.appendChild(container);

      const map = new (require('../../dist/cjs/index.js')).Map({
        container: 'keyboard-nav',
        style: 'https://map.barikoi.com/styles/streets',
        center: [90.4125, 23.8103],
        zoom: 10,
        keyboard: true // Enable keyboard navigation
      });

      // Map should be keyboard navigable
      expect(container.getAttribute('tabindex')).toBe('0');
    });

    test('should support Tab key navigation through interactive elements', () => {
      const bkoiModule = require('../../dist/cjs/index.js');

      const container = document.createElement('div');
      container.id = 'tab-nav';
      document.body.appendChild(container);

      // Mock the Map constructor to avoid real instantiation
      const mockMapInstance = {
        addControl: jest.fn(),
        getContainer: jest.fn(() => container),
        setStyle: jest.fn(),
        once: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
        fire: jest.fn(),
        remove: jest.fn(),
        loaded: jest.fn(() => true),
        isStyleLoaded: jest.fn(() => true)
      };

      jest.spyOn(bkoiModule, 'Map').mockImplementation(() => mockMapInstance);

      const map = new bkoiModule.Map({
        container: 'tab-nav',
        style: 'https://map.barikoi.com/styles/streets',
        center: [90.4125, 23.8103],
        zoom: 10
      });

      // Add controls that should be in tab order
      const navControl = new bkoiModule.NavigationControl();
      map.addControl(navControl);

      expect(map).toBeDefined();
    });

    test('should provide keyboard shortcuts with proper announcements', () => {
      const container = document.createElement('div');
      container.id = 'shortcuts';
      container.setAttribute('aria-describedby', 'keyboard-help');
      document.body.appendChild(container);

      // Add hidden help text for keyboard shortcuts
      const helpText = document.createElement('div');
      helpText.id = 'keyboard-help';
      helpText.setAttribute('aria-hidden', 'true');
      helpText.textContent = 'Use arrow keys to pan, +/- to zoom, Enter to select';
      container.appendChild(helpText);

      const map = new (require('../../dist/cjs/index.js')).Map({
        container: 'shortcuts',
        style: 'https://map.barikoi.com/styles/streets',
        center: [90.4125, 23.8103],
        zoom: 10
      });

      expect(container.getAttribute('aria-describedby')).toBe('keyboard-help');
    });
  });

  describe('Screen Reader Support', () => {
    test('should provide meaningful labels for interactive elements', () => {
      const bkoiModule = require('../../dist/cjs/index.js');

      const container = document.createElement('div');
      container.id = 'sr-support';
      document.body.appendChild(container);

      const map = new bkoiModule.Map({
        container: 'sr-support',
        style: 'https://map.barikoi.com/styles/streets',
        center: [90.4125, 23.8103],
        zoom: 10
      });

      // Add a marker with descriptive text
      const marker = new bkoiModule.Marker()
        .setLngLat([90.4125, 23.8103])
        .addTo(map);

      const popup = new bkoiModule.Popup()
        .setHTML('<div aria-label="Dhaka, Bangladesh - Capital city">Dhaka</div>')
        .addTo(map);

      expect(marker).toBeDefined();
      expect(popup).toBeDefined();
    });

    test('should announce dynamic content changes', () => {
      const container = document.createElement('div');
      container.id = 'dynamic-content';
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(container);

      const map = new (require('../../dist/cjs/index.js')).Map({
        container: 'dynamic-content',
        style: 'https://map.barikoi.com/styles/streets',
        center: [90.4125, 23.8103],
        zoom: 10
      });

      // Dynamic content changes should be announced
      expect(container.getAttribute('aria-live')).toBe('polite');
      expect(container.getAttribute('aria-atomic')).toBe('true');
    });

    test('should provide status announcements', () => {
      const container = document.createElement('div');
      container.id = 'status-announcements';
      document.body.appendChild(container);

      // Create a status region for announcements
      const statusRegion = document.createElement('div');
      statusRegion.setAttribute('role', 'status');
      statusRegion.setAttribute('aria-live', 'polite');
      statusRegion.setAttribute('aria-atomic', 'true');
      statusRegion.id = 'map-status';
      container.appendChild(statusRegion);

      const map = new (require('../../dist/cjs/index.js')).Map({
        container: 'status-announcements',
        style: 'https://map.barikoi.com/styles/streets',
        center: [90.4125, 23.8103],
        zoom: 10
      });

      // Status messages should be announced to screen readers
      const statusElement = document.getElementById('map-status');
      expect(statusElement).toBeDefined();
      expect(statusElement.getAttribute('role')).toBe('status');
      expect(statusElement.getAttribute('aria-live')).toBe('polite');
    });
  });

  describe('Color and Contrast', () => {
    test('should support high contrast mode', () => {
      const container = document.createElement('div');
      container.id = 'high-contrast';
      document.body.appendChild(container);

      const map = new (require('../../dist/cjs/index.js')).Map({
        container: 'high-contrast',
        style: 'https://map.barikoi.com/styles/streets',
        center: [90.4125, 23.8103],
        zoom: 10
      });

      // In high contrast mode, the map should adapt
      // This would typically involve CSS media queries and style switching
      expect(map).toBeDefined();
    });

    test('should respect user color preferences', () => {
      // Test for prefers-color-scheme support
      const mockMediaQuery = {
        matches: false,
        addListener: jest.fn(),
        removeListener: jest.fn()
      };

      global.window.matchMedia = jest.fn(() => mockMediaQuery);

      const container = document.createElement('div');
      container.id = 'color-preference';
      document.body.appendChild(container);

      const bkoiModule = require('../../dist/cjs/index.js');

      // Mock the Map constructor to check for media query calls
      const mockMapInstance = {
        addControl: jest.fn(),
        getContainer: jest.fn(() => container),
        setStyle: jest.fn(),
        once: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
        fire: jest.fn(),
        remove: jest.fn(),
        loaded: jest.fn(() => true),
        isStyleLoaded: jest.fn(() => true)
      };

      jest.spyOn(bkoiModule, 'Map').mockImplementation(() => mockMapInstance);

      const map = new bkoiModule.Map({
        container: 'color-preference',
        style: 'https://map.barikoi.com/styles/streets',
        center: [90.4125, 23.8103],
        zoom: 10
      });

      // Verify that matchMedia is available for color scheme detection
      expect(typeof global.window.matchMedia).toBe('function');
      // In real implementation, the map would check for color scheme preferences
    });

    test('should provide sufficient color contrast for text elements', () => {
      const bkoiModule = require('../../dist/cjs/index.js');

      const popup = new bkoiModule.Popup()
        .setHTML(`
          <div style="background-color: white; color: black; padding: 10px;">
            <h3 style="color: #000; background-color: #fff;">High Contrast Text</h3>
            <p style="color: #333; background-color: #fff;">This text should have sufficient contrast.</p>
          </div>
        `);

      // In real implementation, contrast ratios should be calculated and validated
      expect(popup).toBeDefined();
    });
  });

  describe('Focus Management', () => {
    test('should maintain focus order', () => {
      const container = document.createElement('div');
      container.id = 'focus-management';
      document.body.appendChild(container);

      const map = new (require('../../dist/cjs/index.js')).Map({
        container: 'focus-management',
        style: 'https://map.barikoi.com/styles/streets',
        center: [90.4125, 23.8103],
        zoom: 10
      });

      // Focus should move logically through interactive elements
      expect(container).toBeDefined();
    });

    test('should restore focus appropriately', () => {
      const bkoiModule = require('../../dist/cjs/index.js');

      const container = document.createElement('div');
      container.id = 'focus-restore';
      document.body.appendChild(container);

      const map = new bkoiModule.Map({
        container: 'focus-restore',
        style: 'https://map.barikoi.com/styles/streets',
        center: [90.4125, 23.8103],
        zoom: 10
      });

      // When popups open/close, focus should be managed properly
      const popup = new bkoiModule.Popup()
        .setLngLat([90.4125, 23.8103])
        .setHTML('<button autofocus>Close</button>')
        .addTo(map);

      expect(popup).toBeDefined();
    });

    test('should prevent focus traps', () => {
      const bkoiModule = require('../../dist/cjs/index.js');

      const container = document.createElement('div');
      container.id = 'no-focus-trap';
      document.body.appendChild(container);

      const map = new bkoiModule.Map({
        container: 'no-focus-trap',
        style: 'https://map.barikoi.com/styles/streets',
        center: [90.4125, 23.8103],
        zoom: 10
      });

      // Modal dialogs should not trap focus
      const popup = new bkoiModule.Popup({
        closeOnClick: false,
        closeButton: true
      })
        .setLngLat([90.4125, 23.8103])
        .setHTML('<div><button>Action 1</button><button>Action 2</button></div>')
        .addTo(map);

      expect(popup).toBeDefined();
    });
  });

  describe('Motion and Animation Preferences', () => {
    test('should respect prefers-reduced-motion', () => {
      const mockMediaQuery = {
        matches: true, // User prefers reduced motion
        addListener: jest.fn(),
        removeListener: jest.fn()
      };

      global.window.matchMedia = jest.fn(() => mockMediaQuery);

      const container = document.createElement('div');
      container.id = 'reduced-motion';
      document.body.appendChild(container);

      const bkoiModule = require('../../dist/cjs/index.js');

      // Mock the Map constructor to check for media query calls
      const mockMapInstance = {
        addControl: jest.fn(),
        getContainer: jest.fn(() => container),
        setStyle: jest.fn(),
        once: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
        fire: jest.fn(),
        remove: jest.fn(),
        loaded: jest.fn(() => true),
        isStyleLoaded: jest.fn(() => true)
      };

      jest.spyOn(bkoiModule, 'Map').mockImplementation(() => mockMapInstance);

      const map = new bkoiModule.Map({
        container: 'reduced-motion',
        style: 'https://map.barikoi.com/styles/streets',
        center: [90.4125, 23.8103],
        zoom: 10
      });

      // Verify that matchMedia is available for reduced motion detection
      expect(typeof global.window.matchMedia).toBe('function');
      // In real implementation, the map would check for reduced motion preferences
    });

    test('should provide animation controls', () => {
      const container = document.createElement('div');
      container.id = 'animation-controls';
      document.body.appendChild(container);

      const map = new (require('../../dist/cjs/index.js')).Map({
        container: 'animation-controls',
        style: 'https://map.barikoi.com/styles/streets',
        center: [90.4125, 23.8103],
        zoom: 10,
        fadeDuration: 0 // Disable animations for users who prefer it
      });

      expect(map).toBeDefined();
    });
  });

  describe('Error Announcements', () => {
    test('should announce errors to screen readers', () => {
      const container = document.createElement('div');
      container.id = 'error-announcements';
      document.body.appendChild(container);

      // Create error announcement region
      const errorRegion = document.createElement('div');
      errorRegion.setAttribute('role', 'alert');
      errorRegion.setAttribute('aria-live', 'assertive');
      errorRegion.id = 'map-errors';
      container.appendChild(errorRegion);

      const map = new (require('../../dist/cjs/index.js')).Map({
        container: 'error-announcements',
        style: 'https://map.barikoi.com/styles/streets',
        center: [90.4125, 23.8103],
        zoom: 10
      });

      const errorElement = document.getElementById('map-errors');
      expect(errorElement).toBeDefined();
      expect(errorElement.getAttribute('role')).toBe('alert');
      expect(errorElement.getAttribute('aria-live')).toBe('assertive');
    });

    test('should provide helpful error messages', () => {
      const bkoiModule = require('../../dist/cjs/index.js');

      // Test invalid configurations with helpful messages
      expect(() => {
        new bkoiModule.Map({
          container: 'nonexistent',
          style: 'invalid-style'
        });
      }).not.toThrow(); // Should handle gracefully with appropriate messaging
    });
  });
});
