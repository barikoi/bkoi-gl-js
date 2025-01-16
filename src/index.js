// @ts-nocheck
import maplibre from 'maplibre-gl';
import MapboxDraw from 'maplibre-gl-draw'; // Import maplibre-gl-draw
import { bkoiConfig } from './util/config.js';
import { isBarikoiStyle } from './util/validator.js';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
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
    });
  }

  // Add Barikoi Attribution on Map Load
  // Add Barikoi Attribution on Map Load
  _addBarikoiAttribution() {
    // Map Container
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

    // Logo
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
