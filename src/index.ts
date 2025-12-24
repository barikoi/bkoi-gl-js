import maplibre, {
  Map,
  MapOptions,
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
  IControl
} from 'maplibre-gl';
import MapboxDraw from 'maplibre-gl-draw';
import { bkoiConfig } from './utils/config';
import { isBarikoiStyle } from './utils/validator';
import type { BkoiMapOptions, StyleConfig } from './types';

const {
  setRTLTextPlugin,
  getRTLTextPluginStatus,
  prewarm,
  clearPrewarmedResources,
} = maplibre;

/**
 * Extended Map class with Barikoi integration
 * 
 * This class extends the base Maplibre GL Map with Barikoi-specific features:
 * - Custom Barikoi map styles with authentication
 * - Barikoi attribution and branding
 * - Drawing tools for polygons, lines, and points
 * - Style drawer for switching between map styles
 * 
 * @example
 * ```typescript
 * const map = new BkoiGlMap({
 *   container: 'map',
 *   accessToken: 'your-barikoi-token',
 *   center: [90.3938, 23.8103],
 *   zoom: 12,
 *   polygon: true
 * });
 * ```
 */
export class BkoiGlMap extends Map {
  private draw?: MapboxDraw;

  constructor(mapOptions: BkoiMapOptions) {
    // Validate access token for Barikoi styles
    if (
      !mapOptions.accessToken &&
      !bkoiConfig.ACCESS_TOKEN &&
      (!mapOptions.style || isBarikoiStyle(mapOptions.style))
    ) {
      console.error(
        'Please provide a valid accessToken to use Barikoi assets.'
      );
    }

    // Build the style URL with access token
    const styleUrl = mapOptions.style
      ? isBarikoiStyle(mapOptions.style)
        ? `${mapOptions.style}?key=${mapOptions.accessToken || bkoiConfig.ACCESS_TOKEN}`
        : mapOptions.style
      : `${bkoiConfig.DEFAULT_STYLE}?key=${mapOptions.accessToken || bkoiConfig.ACCESS_TOKEN}`;

    // Initialize parent Map class
    super({
      ...mapOptions,
      accessToken: mapOptions.mapboxAccessToken || undefined,
      attributionControl: false,
      style: styleUrl,
    } as MapOptions);

    // Setup attribution control
    this.setupAttributionControl();

    // Initialize features on map load
    this.once('load', () => {
      this.addBarikoiAttribution();
      
      if (mapOptions.polygon) {
        this.initializeDraw(mapOptions.drawOptions || {});
      }
      
      if (mapOptions.styles) {
        this.initializeStyleDrawer(mapOptions.styles);
      }
    });
  }

  /**
   * Setup custom attribution control with Barikoi, OpenMapTiles, and OSM links
   * @private
   */
  private setupAttributionControl(): void {
    const attributionControl = new AttributionControl({
      compact: true,
      customAttribution: '',
    });
    this.addControl(attributionControl, 'bottom-right');

    // Make attribution links clickable after control is added
    this.once('load', () => {
      setTimeout(() => {
        const container = this.getContainer();
        const attributionContainer = container.querySelector(
          '.maplibregl-ctrl-attrib'
        );
        
        if (attributionContainer) {
          const inner = attributionContainer.querySelector(
            '.maplibregl-ctrl-attrib-inner'
          );
          
          if (inner) {
            inner.innerHTML =
              '© <a href="https://www.barikoi.com" target="_blank">Barikoi</a> © <a href="https://openmaptiles.org" target="_blank">OpenMapTiles</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>';
          }
        }
      }, 0);
    });
  }

  /**
   * Add Barikoi logo attribution control to the map
   * @private
   */
  private addBarikoiAttribution(): void {
    const logoControl: IControl = {
      onAdd: (): HTMLElement => {
        const container = document.createElement('a');
        container.className = 'maplibregl-ctrl-logo';
        container.setAttribute('href', 'https://www.barikoi.com');
        container.setAttribute('target', '_blank');
        container.setAttribute('alt', 'Barikoi');
        return container;
      },
      onRemove: (): void => {
        // Cleanup if needed
      },
    };

    this.addControl(logoControl, 'bottom-left');
  }

  /**
   * Initialize maplibre-gl-draw for polygon drawing
   * @param drawOptions - Configuration options for the drawing tools
   * @private
   */
  private initializeDraw(drawOptions: Partial<MapboxDraw.MapboxDrawOptions>): void {
    const defaultOptions: MapboxDraw.MapboxDrawOptions = {
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      ...drawOptions,
    } as MapboxDraw.MapboxDrawOptions;

    this.draw = new MapboxDraw(defaultOptions);
    this.addControl(this.draw as unknown as IControl);
  }

  /**
   * Initialize style drawer UI for switching between map styles
   * @param styles - Array of style configurations
   * @private
   */
  private initializeStyleDrawer(styles: StyleConfig[]): void {
    const mapContainer = this.getContainer();

    // Create drawer container
    const drawer = document.createElement('div');
    drawer.className = 'style-drawer';
    drawer.style.maxHeight = '0';

    // Create toggle button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'style-drawer-toggle-button';
    toggleButton.innerHTML = '☰';

    // Toggle drawer visibility
    toggleButton.addEventListener('click', () => {
      const isOpen = drawer.style.maxHeight !== '0px';
      drawer.style.maxHeight = isOpen ? '0' : '400px';
      toggleButton.innerHTML = isOpen ? '☰' : '▲';
    });

    // Add style items
    styles.forEach(({ style, image, name }) => {
      const styleItem = this.createStyleItem(style, image, name);
      drawer.appendChild(styleItem);
    });

    mapContainer.appendChild(toggleButton);
    mapContainer.appendChild(drawer);
  }

  /**
   * Create a single style item for the drawer
   * @param style - Style URL
   * @param image - Thumbnail image URL
   * @param name - Display name
   * @returns HTML element for the style item
   * @private
   */
  private createStyleItem(style: string, image: string, name: string): HTMLDivElement {
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
    thumbnail.style.transition = 'transform 0.3s';

    const nameOverlay = document.createElement('div');
    nameOverlay.innerText = name;
    Object.assign(nameOverlay.style, {
      position: 'absolute',
      top: '50%',
      width: '100%',
      height: '100%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      color: '#fff',
      fontWeight: 'bold',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: '4px',
      display: 'none',
    });

    // Hover effects
    styleItem.addEventListener('mouseenter', () => {
      thumbnail.style.transform = 'scale(1.05)';
      nameOverlay.style.display = 'block';
    });

    styleItem.addEventListener('mouseleave', () => {
      thumbnail.style.transform = 'scale(1)';
      nameOverlay.style.display = 'none';
    });

    // Style change on click
    styleItem.addEventListener('click', () => {
      this.setStyle(style);
    });

    wrapper.appendChild(thumbnail);
    wrapper.appendChild(nameOverlay);
    styleItem.appendChild(wrapper);

    return styleItem;
  }

  /**
   * Get the MapboxDraw instance if initialized
   * @returns The MapboxDraw instance or undefined if not initialized
   * @public
   */
  public getDraw(): MapboxDraw | undefined {
    return this.draw;
  }
}

// Re-export utilities
export { bkoiConfig } from './utils/config';
export { isBarikoiStyle } from './utils/validator';
export type * from './types';

// Export all maplibre features individually for tree-shaking
export {
  setRTLTextPlugin,
  getRTLTextPluginStatus,
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
  prewarm,
  clearPrewarmedResources,
};

// Export BkoiGlMap as Map (main export)
export { BkoiGlMap as Map };

// Default export with all Maplibre features + Barikoi extensions
const exported = {
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
  prewarm,
  clearPrewarmedResources,
  
  get accessToken(): string | null {
    return bkoiConfig.ACCESS_TOKEN;
  },
  set accessToken(token: string | null) {
    bkoiConfig.ACCESS_TOKEN = token;
  },
  
  workerUrl: '',
};

export default exported;
