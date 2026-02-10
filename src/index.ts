/**
 * @fileoverview bkoi-gl-js Main Library Entry Point
 * @description This file implements the core bkoi-gl-js library, providing a MapLibre GL JS wrapper
 * with Barikoi-specific enhancements including drawing tools, style management, and authentication.

 * The library extends MapLibre GL JS with:
 * - Barikoi API integration and authentication
 * - Interactive polygon/line/point drawing tools
 * - Dynamic style switching with UI drawer
 * - Automatic attribution and branding
 * - TypeScript support with comprehensive type definitions
 */

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
  IControl,
} from 'maplibre-gl'
import MapboxDraw from 'maplibre-gl-draw'
import { bkoiConfig } from './utils/config'
import { isBarikoiStyle } from './utils/validator'
import type { BkoiMapOptions, StyleConfig, MinimapOptions } from './types'
import { Minimap } from './controls/Minimap'

const { setRTLTextPlugin, getRTLTextPluginStatus, prewarm, clearPrewarmedResources } = maplibre

/**
 * @class BkoiGlMap
 * @description Extended MapLibre GL Map class with Barikoi integration.
 *
 * This class extends the base MapLibre GL Map with Barikoi-specific features:
 * - Automatic API authentication for Barikoi styles
 * - Interactive drawing tools using Mapbox GL Draw
 * - Style switching drawer with thumbnail previews
 * - Barikoi branding and attribution
 *
 * @extends {Map}
 */
export class BkoiGlMap extends Map {
  /**
   * @private
   * @description Reference to the MapboxDraw instance when drawing tools are enabled.
   * This property is undefined when polygon drawing is not activated.
   */
  private draw?: MapboxDraw

  /**
   * @constructor
   * @description Creates a new BkoiGlMap instance with Barikoi integration.
   *
   * Initializes a MapLibre GL map with Barikoi-specific features including:
   * - Automatic authentication for Barikoi styles
   * - Optional drawing tools initialization
   * - Style drawer setup
   * - Barikoi branding and attribution
   *
   * @param {BkoiMapOptions} mapOptions - Configuration options for the map
   *
   * @throws {Error} When Barikoi API access token is required but not provided
   */
  constructor(mapOptions: BkoiMapOptions) {
    // Validate access token for Barikoi styles
    if (
      !mapOptions.accessToken &&
      !bkoiConfig.ACCESS_TOKEN &&
      (!mapOptions.style || isBarikoiStyle(mapOptions.style))
    ) {
      console.error('Please provide a valid accessToken to use Barikoi assets.')
    }

    // Build the style URL with access token
    const styleUrl = mapOptions.style
      ? isBarikoiStyle(mapOptions.style)
        ? `${mapOptions.style}?key=${mapOptions.accessToken || bkoiConfig.ACCESS_TOKEN}`
        : mapOptions.style
      : `${bkoiConfig.DEFAULT_STYLE}?key=${mapOptions.accessToken || bkoiConfig.ACCESS_TOKEN}`

    // Initialize parent Map class
    super({
      ...mapOptions,
      attributionControl: false,
      style: styleUrl,
    } as MapOptions)

    // Setup attribution control
    this.setupAttributionControl()

    // Initialize features on map load
    this.once('load', () => {
      this.addBarikoiAttribution()

      if (mapOptions.polygon) {
        this.initializeDraw(mapOptions.drawOptions || {})
      }

      if (mapOptions.styles) {
        this.initializeStyleDrawer(mapOptions.styles)
      }

      if (mapOptions.minimap) {
        this.initializeMinimap(mapOptions.minimap)
      }
    })
  }

  /**
   * @private
   * @method setupAttributionControl
   * @description Initializes the attribution control with custom Barikoi attribution.
   *
   * Sets up a MapLibre GL attribution control with compact styling and prepares
   * it for custom Barikoi attribution content that gets injected after map load.
   * The attribution control is positioned at bottom-right.
   *
   * @returns {void}
   */
  private setupAttributionControl(): void {
    const attributionControl = new AttributionControl({
      compact: true,
      customAttribution: '',
    })
    this.addControl(attributionControl, 'bottom-right')

    // Make attribution links clickable after control is added
    this.once('load', () => {
      setTimeout(() => {
        const container = this.getContainer()
        const attributionContainer = container.querySelector('.maplibregl-ctrl-attrib')

        if (attributionContainer) {
          const inner = attributionContainer.querySelector('.maplibregl-ctrl-attrib-inner')

          if (inner) {
            inner.innerHTML =
              '© <a href="https://www.barikoi.com" target="_blank">Barikoi</a> © <a href="https://openmaptiles.org" target="_blank">OpenMapTiles</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>'
          }
        }
      }, 0)
    })
  }

  /**
   * @private
   * @method addBarikoiAttribution
   * @description Adds the Barikoi logo control to the map.
   *
   * Creates and adds a custom control displaying the Barikoi logo that links
   * to the Barikoi website. The logo is positioned at bottom-left and uses
   * CSS styling defined in index.css.
   *
   * @returns {void}
   */
  private addBarikoiAttribution(): void {
    const logoControl: IControl = {
      onAdd: (): HTMLElement => {
        const container = document.createElement('a')
        container.className = 'maplibregl-ctrl-logo'
        container.setAttribute('href', 'https://www.barikoi.com')
        container.setAttribute('target', '_blank')
        container.setAttribute('alt', 'Barikoi')
        return container
      },
      onRemove: (): void => {
        // Cleanup if needed
      },
    }

    this.addControl(logoControl, 'bottom-left')
  }

  /**
   * @private
   * @method initializeDraw
   * @description Initializes the MapboxDraw drawing tools for the map.
   *
   * Creates a new MapboxDraw instance with default options optimized for polygon drawing,
   * merges in any custom options provided, and adds the drawing controls to the map.
   * By default, only polygon and trash controls are enabled for simplicity.
   *
   * Also sets up event listeners to reset cursor after drawing events to prevent
   * cursor sticking issues.
   *
   * @param {Partial<MapboxDraw.MapboxDrawOptions>} drawOptions - Custom options to merge with defaults
   *
   * @returns {void}
   */
  private initializeDraw(drawOptions: Partial<MapboxDraw.MapboxDrawOptions>): void {
    const defaultOptions: MapboxDraw.MapboxDrawOptions = {
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      ...drawOptions,
    } as MapboxDraw.MapboxDrawOptions

    this.draw = new MapboxDraw(defaultOptions)
    this.addControl(this.draw as unknown as IControl)

    // Only reset when not in drawing mode to allow CSS cursor to work
    this.on('draw.create', () => {
      const currentMode = this.draw?.getMode()
      if (currentMode === 'simple_select') {
        this.getCanvas().style.cursor = ''
      }
    })

    this.on('draw.update', () => {
      const currentMode = this.draw?.getMode()
      if (currentMode === 'simple_select') {
        this.getCanvas().style.cursor = ''
      }
    })

    this.on('draw.delete', () => {
      const currentMode = this.draw?.getMode()
      if (currentMode === 'simple_select') {
        this.getCanvas().style.cursor = ''
      }
    })

    this.on('draw.selectionchange', () => {
      const currentMode = this.draw?.getMode()
      if (currentMode === 'simple_select') {
        this.getCanvas().style.cursor = ''
      }
    })

    this.on('draw.modechange', () => {
      // Reset cursor when changing to simple_select mode to prevent sticking
      // Allow CSS to control cursor in drawing modes
      const currentMode = this.draw?.getMode()
      if (currentMode === 'simple_select') {
        this.getCanvas().style.cursor = ''
      }
    })
  }

  /**
   * @private
   * @method initializeStyleDrawer
   * @description Creates and initializes the interactive style drawer UI.
   *
   * Builds a collapsible drawer containing style selection options with thumbnails.
   * Each style is represented by an image thumbnail that shows the style name on hover
   * and allows switching to that style when clicked. The drawer includes a toggle
   * button to show/hide the style options.
   *
   * @param {StyleConfig[]} styles - Array of style configurations to display in the drawer
   *
   * @returns {void}
   */
  private initializeStyleDrawer(styles: StyleConfig[]): void {
    const mapContainer = this.getContainer()

    // Create drawer container
    const drawer = document.createElement('div')
    drawer.className = 'style-drawer'
    drawer.style.maxHeight = '0'

    // Create toggle button
    const toggleButton = document.createElement('button')
    toggleButton.className = 'style-drawer-toggle-button'
    toggleButton.innerHTML = '☰'

    // Toggle drawer visibility
    toggleButton.addEventListener('click', () => {
      const isOpen = drawer.style.maxHeight !== '0px'
      drawer.style.maxHeight = isOpen ? '0' : '400px'
      toggleButton.innerHTML = isOpen ? '☰' : '▲'
    })

    // Add style items
    styles.forEach(({ style, image, name }) => {
      const styleItem = this.createStyleItem(style, image, name)
      drawer.appendChild(styleItem)
    })

    mapContainer.appendChild(toggleButton)
    mapContainer.appendChild(drawer)
  }

  /**
   * @private
   * @method createStyleItem
   * @description Creates a single style selection item for the style drawer.
   *
   * Builds an interactive DOM element representing one map style option.
   * The item includes a thumbnail image with hover effects that reveal the style name,
   * and clicking the item switches the map to that style.
   *
   * @param {string} style - The style URL or identifier
   * @param {string} image - URL of the thumbnail image for the style
   * @param {string} name - Human-readable name of the style
   *
   * @returns {HTMLDivElement} The created style item DOM element
   */
  private createStyleItem(style: string, image: string, name: string): HTMLDivElement {
    const styleItem = document.createElement('div')
    styleItem.className = 'style-item'
    styleItem.style.position = 'relative'
    styleItem.style.cursor = 'pointer'
    styleItem.style.marginBottom = '10px'

    const wrapper = document.createElement('div')
    wrapper.style.position = 'relative'
    wrapper.style.overflow = 'hidden'

    const thumbnail = document.createElement('img')
    thumbnail.src = image
    thumbnail.alt = name
    thumbnail.style.width = '100%'
    thumbnail.style.height = '100%'
    thumbnail.style.objectFit = 'cover'
    thumbnail.style.transition = 'transform 0.3s'

    const nameOverlay = document.createElement('div')
    nameOverlay.innerText = name
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
    })

    // Hover effects
    styleItem.addEventListener('mouseenter', () => {
      thumbnail.style.transform = 'scale(1.05)'
      nameOverlay.style.display = 'block'
    })

    styleItem.addEventListener('mouseleave', () => {
      thumbnail.style.transform = 'scale(1)'
      nameOverlay.style.display = 'none'
    })

    // Style change on click
    styleItem.addEventListener('click', () => {
      this.setStyle(style)
    })

    wrapper.appendChild(thumbnail)
    wrapper.appendChild(nameOverlay)
    styleItem.appendChild(wrapper)

    return styleItem
  }

  /**
   * @method getDraw
   * @description Retrieves the MapboxDraw instance if drawing tools are enabled.
   *
   * Returns the MapboxDraw instance that was initialized when the `polygon` option
   * was set to true in the map constructor. This allows access to the full
   * MapboxDraw API for programmatic drawing operations.
   *
   * @returns {MapboxDraw | undefined} The MapboxDraw instance if drawing tools are enabled, undefined otherwise
   */
  public getDraw(): MapboxDraw | undefined {
    return this.draw
  }

  /**
   * @private
   * @method initializeMinimap
   * @description Initializes the minimap control.
   *
   * Creates a Minimap control instance with the provided options and adds it
   * to the map at the specified position. The minimap provides a small overview
   * map that syncs with the parent map's position.
   *
   * @param {MinimapOptions} options - Configuration options for the minimap
   * @returns {void}
   */
  private initializeMinimap(options: MinimapOptions): void {
    // Dynamic import to avoid circular dependency
    import('./controls/Minimap').then(({ Minimap: MinimapControl }) => {
      const minimap = new MinimapControl(options)
      const position = options.position ?? 'top-right'
      this.addControl(minimap, position)
    })
  }
}

// Re-export utilities
/**
 * @description Global configuration object for bkoi-gl-js library settings.
 */
export { bkoiConfig } from './utils/config'
export { DEFAULT_CENTER } from './utils/constants'

/**
 * @description Utility function to validate if a style URL is a Barikoi style.
 * @param {string | null | undefined} style - The style URL to validate
 * @returns {boolean} True if the style is a valid Barikoi style URL
 */
export { isBarikoiStyle } from './utils/validator'

/**
 * @description Re-exports all TypeScript type definitions from the types module.
 * Includes BkoiMapOptions, StyleConfig, and BkoiConfig interfaces.
 */
export type * from './types'

/**
 * @description Re-exports the Minimap control class.
 * Users can import and use Minimap directly or enable it via map options.
 */
export { Minimap } from './controls/Minimap'

// Export all maplibre features individually for tree-shaking
/**
 * @description Re-exports all MapLibre GL JS features for tree-shaking compatibility.
 * These exports allow importing only the specific MapLibre features you need,
 * reducing bundle size when using modern bundlers.
 */
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
}

// Export BkoiGlMap as Map (main export)
/**
 * @description Main export: BkoiGlMap class aliased as Map for convenience.
 *
 * This is the primary way to create maps with Barikoi integration.
 */
export { BkoiGlMap as Map }

// Default export with all Maplibre features + Barikoi extensions
/**
 * @description Default export providing all MapLibre GL JS features plus Barikoi extensions.
 *
 * This export includes everything from MapLibre GL JS plus additional Barikoi-specific
 * features and a convenient accessToken getter/setter.
 *
 * @property {BkoiGlMap} Map - The enhanced map class with Barikoi integration
 * @property {string | null} accessToken - Global Barikoi API token getter/setter
 * @property {string} workerUrl - MapLibre worker URL (usually empty string)
 * @property {Function} setRTLTextPlugin - MapLibre RTL text plugin setter
 * @property {Function} getRTLTextPluginStatus - MapLibre RTL text plugin status getter
 * @property {Function} prewarm - MapLibre resource prewarming function
 * @property {Function} clearPrewarmedResources - MapLibre resource cleanup function
 * @property {typeof NavigationControl} NavigationControl - MapLibre navigation control
 * @property {typeof GeolocateControl} GeolocateControl - MapLibre geolocation control
 * @property {typeof AttributionControl} AttributionControl - MapLibre attribution control
 * @property {typeof ScaleControl} ScaleControl - MapLibre scale control
 * @property {typeof FullscreenControl} FullscreenControl - MapLibre fullscreen control
 * @property {typeof Popup} Popup - MapLibre popup class
 * @property {typeof Marker} Marker - MapLibre marker class
 * @property {typeof Style} Style - MapLibre style utilities
 * @property {typeof LngLat} LngLat - MapLibre coordinate class
 * @property {typeof LngLatBounds} LngLatBounds - MapLibre bounds class
 * @property {typeof Point} Point - MapLibre point utilities
 * @property {typeof MercatorCoordinate} MercatorCoordinate - MapLibre projection utilities
 * @property {typeof Evented} Evented - MapLibre event system base class
 */
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
  Minimap,

  /**
   * @description Global Barikoi API access token getter/setter.
   *
   * Provides convenient access to set the global Barikoi API token that will be used
   * by all map instances that don't have their own accessToken specified.
   *
   * @type {string | null}
   */
  get accessToken(): string | null {
    return bkoiConfig.ACCESS_TOKEN
  },
  set accessToken(token: string | null) {
    bkoiConfig.ACCESS_TOKEN = token
  },

  /**
   * @description MapLibre GL JS worker URL.
   * Usually left as empty string for default behavior.
   * @type {string}
   */
  workerUrl: '',
}

export default exported
