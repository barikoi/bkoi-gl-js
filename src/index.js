// @ts-nocheck
import maplibre from 'maplibre-gl';
import MapboxDraw from 'maplibre-gl-draw'; // Import maplibre-gl-draw
import { bkoiConfig } from './util/config.js';
import { isBarikoiStyle } from './util/validator.js';
const {
  version,
  supported,
  setRTLTextPlugin,
  getRTLTextPluginStatus,
  Map,
  NavigationControl,
  GeolocateControl,
  AttributionControl,
  ScaleControl,
  FullscreenControl,
  Popup,
  Marker,
  Style,
  LngLat,
  LngLatBounds,
  Point,
  MercatorCoordinate,
  Evented,
  config,
  prewarm,
  clearPrewarmedResources,
} = maplibre;

// Extend Map
class BkoiGlMap extends Map {
  constructor(mapOptions) {
    if (
      !mapOptions.accessToken &&
      !bkoiConfig.ACCESS_TOKEN &&
      (!mapOptions.style || isBarikoiStyle(mapOptions.style))
    ) {
      console.error(
        'Please provide a valid accessToken to use Barikoi assets.'
      );
    }

    super({
      ...mapOptions,
      accessToken: mapOptions.mapboxAccessToken
        ? mapOptions.mapboxAccessToken
        : null,
      attributionControl: false, // Disable default attribution control
      style: mapOptions.style
        ? isBarikoiStyle(mapOptions.style)
          ? mapOptions.style +
            '?key=' +
            (mapOptions.accessToken
              ? mapOptions.accessToken
              : bkoiConfig.ACCESS_TOKEN)
          : mapOptions.style
        : bkoiConfig.DEFAULT_STYLE +
          '?key=' +
          (mapOptions.accessToken
            ? mapOptions.accessToken
            : bkoiConfig.ACCESS_TOKEN),
    });

    // Add Barikoi Attribution
    this.on('load', () => {
      this._addBarikoiAttribution();
      // Initialize Draw if polygon drawing is enabled
      if (mapOptions.polygon) {
        this._initializeDraw(mapOptions.drawOptions || {});
      }
      // Initialize the style drawer
      if (mapOptions.styles) {
        this._initializeStyleDrawer(mapOptions.styles);
      }
    });
  }

  // Add Barikoi Attribution on Map Load
  // Add Barikoi Attribution on Map Load
  _addBarikoiAttribution() {
    const mapContainer = this.getContainer();

    // Attribute Container (specific to this map instance)
    const barikoiAttributeContainer = mapContainer.querySelector(
      '.maplibregl-control-container .maplibregl-ctrl-bottom-right .maplibregl-ctrl-attrib-inner'
    );

    // Logo Container (specific to this map instance)
    const logoContainer = mapContainer.querySelector(
      '.maplibregl-control-container .maplibregl-ctrl-bottom-left'
    );

    if (!barikoiAttributeContainer) {
      // Add a new AttributionControl with your custom content
      this.addControl(
        new maplibre.AttributionControl({
          customAttribution: '',
        })
      );
    }

    // Barikoi Logo Container
    const barikoiLogoContainer = document.createElement('a');
    barikoiLogoContainer.className = 'barikoi-logo-container';
    barikoiLogoContainer.setAttribute('href', 'https://www.barikoi.com');
    barikoiLogoContainer.setAttribute('target', '_blank');
    barikoiLogoContainer.style.boxSizing = 'border-box';
    barikoiLogoContainer.style.pointerEvents = 'auto';
    barikoiLogoContainer.style.cursor = 'pointer';
    barikoiLogoContainer.style.display = 'block';

    const logo = document.createElement('img');
    logo.setAttribute(
      'src',
      'https://docs.barikoi.com/img/barikoi-logo-black.svg'
    );
    logo.setAttribute('alt', 'Barikoi');
    logo.style.boxSizing = 'border-box';
    logo.style.margin = '0px 0px 4px 10px';
    logo.style.width = `clamp(40px, ${
      mapContainer ? Math.round(mapContainer.clientWidth * 0.05) : 44
    }px, 48px)`;
    logo.style.objectFit = 'fill';

    // Append Logo
    barikoiLogoContainer.appendChild(logo);
    if (logoContainer) {
      logoContainer.prepend(barikoiLogoContainer);
    }

    // On Map Container Resize Observer
    new ResizeObserver(() => {
      const barikoiLogo = mapContainer.querySelector(
        '.maplibregl-control-container .maplibregl-ctrl-bottom-left .barikoi-logo-container > img'
      );
      if (barikoiLogo) {
        barikoiLogo.style.width = `clamp(40px, ${
          mapContainer ? Math.round(mapContainer.clientWidth * 0.05) : 44
        }px, 48px)`;
      }
    }).observe(mapContainer);
  }
  // Initialize maplibre-gl-draw
  _initializeDraw(drawOptions) {
    const defaultOptions = {
      displayControlsDefault: false,
      controls: {
        polygon: true, // Enable polygon drawing by default
        trash: true,
      },
      ...drawOptions,
    };

    const draw = new MapboxDraw(defaultOptions);
    this.addControl(draw);
  }

  // Initialize Style Drawer
  _initializeStyleDrawer(styles) {
    const mapContainer = this.getContainer();

    // Create the drawer container
    const drawer = document.createElement('div');
    drawer.className = 'style-drawer';
    drawer.style.maxHeight = '0'; // Initially closed

    // Create the toggle button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'style-drawer-toggle-button';
    toggleButton.innerHTML = '☰'; // Initial icon for closed state

    // Toggle drawer visibility
    toggleButton.addEventListener('click', () => {
      if (drawer.style.maxHeight === '0px') {
        drawer.style.maxHeight = '400px'; // Open the drawer
        toggleButton.innerHTML = '▲'; // Change icon to open state
      } else {
        drawer.style.maxHeight = '0'; // Close the drawer
        toggleButton.innerHTML = '☰'; // Change icon to closed state
      }
    });

    // Add styles to the drawer
    styles.forEach(({ style, image, name }) => {
      const styleItem = document.createElement('div');
      styleItem.className = 'style-item';
      styleItem.style.position = 'relative';
      styleItem.style.cursor = 'pointer';
      styleItem.style.marginBottom = '10px';

      // Wrapper for image and overlay
      const wrapper = document.createElement('div');
      wrapper.style.position = 'relative';
      wrapper.style.overflow = 'hidden';

      // Add thumbnail (blurred image)
      const thumbnail = document.createElement('img');
      thumbnail.src = image;
      thumbnail.alt = name;
      thumbnail.style.width = '100%';
      thumbnail.style.height = '100%';
      thumbnail.style.objectFit = 'cover';
      // thumbnail.style.filter = 'blur(5px)';
      thumbnail.style.transition = 'transform 0.3s';

      // Add name overlay (hidden by default)
      const nameOverlay = document.createElement('div');
      nameOverlay.innerText = name;
      nameOverlay.style.position = 'absolute';
      nameOverlay.style.top = '50%';
      nameOverlay.style.width = '100%';
      nameOverlay.style.height = '100%';
      nameOverlay.style.left = '50%';
      nameOverlay.style.transform = 'translate(-50%, -50%)';
      nameOverlay.style.color = '#fff';
      nameOverlay.style.fontWeight = 'bold';
      nameOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      // nameOverlay.style.padding = '5px 10px';
      nameOverlay.style.borderRadius = '4px';
      nameOverlay.style.display = 'none'; // Initially hidden

      // Add hover effect
      styleItem.addEventListener('mouseenter', () => {
        thumbnail.style.transform = 'scale(1.05)';
        nameOverlay.style.display = 'block'; // Show name on hover
      });
      styleItem.addEventListener('mouseleave', () => {
        thumbnail.style.transform = 'scale(1)';
        nameOverlay.style.display = 'none'; // Hide name when not hovering
      });

      // Handle style change on click
      styleItem.addEventListener('click', () => {
        this.setStyle(style); // Change map style
      });

      // Append elements
      wrapper.appendChild(thumbnail);
      wrapper.appendChild(nameOverlay);
      styleItem.appendChild(wrapper);
      drawer.appendChild(styleItem);
    });

    // Append toggle button and drawer to the map container
    mapContainer.appendChild(toggleButton);
    mapContainer.appendChild(drawer);
  }
}

const exported = {
  version,
  supported,
  setRTLTextPlugin,
  getRTLTextPluginStatus,
  Map: BkoiGlMap,
  NavigationControl,
  GeolocateControl,
  AttributionControl,
  ScaleControl,
  FullscreenControl,
  Popup,
  Marker,
  Style,
  LngLat,
  LngLatBounds,
  Point,
  MercatorCoordinate,
  Evented,
  config,
  prewarm,
  clearPrewarmedResources,
  get accessToken() {
    return bkoiConfig.ACCESS_TOKEN;
  },
  /**
   * @param {string} token
   */
  set accessToken(token) {
    bkoiConfig.ACCESS_TOKEN = token;
  },
  get mapboxAccessToken() {
    return config.ACCESS_TOKEN;
  },
  /**
   * @param {string} token
   */
  set mapboxAccessToken(token) {
    config.ACCESS_TOKEN = token;
  },
  get baseApiUrl() {
    return config.API_URL;
  },
  /**
   * @param {string} url
   */
  set baseApiUrl(url) {
    config.API_URL = url;
  },
  get maxParallelImageRequests() {
    return config.MAX_PARALLEL_IMAGE_REQUESTS;
  },
  /**
   * @param {number} numRequests
   */
  set maxParallelImageRequests(numRequests) {
    config.MAX_PARALLEL_IMAGE_REQUESTS = numRequests;
  },
  workerUrl: '',
};

// Exports
export default exported;
