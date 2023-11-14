import {
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
  clearPrewarmedResources
} from 'maplibre-gl'
import { bkoiConfig } from './util/config'
import { isBarikoiStyle } from './util/validator'
// import WorkerPool from 'maplibre-gl/src/util/worker_pool'
// import { clearTileCache } from 'maplibre-gl/src/util/tile_request_cache'
import barikoiLogoBlack from './assets/barikoi_logo_black.svg'

// Extend Map
class BkoiGlMap extends Map {
  constructor(mapOptions) {
    if((!mapOptions.accessToken && !bkoiConfig.ACCESS_TOKEN) && (!mapOptions.style || isBarikoiStyle(mapOptions.style))) {
      console.error('Please provide a valid accessToken to use Barikoi assets.')
    }

    super({
      ...mapOptions,
      accessToken: mapOptions.mapboxAccessToken ? mapOptions.mapboxAccessToken : null,
      style: mapOptions.style ?
        isBarikoiStyle(mapOptions.style) ?
          mapOptions.style + '?key=' +
            (mapOptions.accessToken ?
              mapOptions.accessToken :
              bkoiConfig.ACCESS_TOKEN)
          :
          mapOptions.style
        :
        bkoiConfig.DEFAULT_STYLE + '?key=' +
          (mapOptions.accessToken ?
            mapOptions.accessToken :
            bkoiConfig.ACCESS_TOKEN)
    })
    
    // Add Barikoi Attribution
    this.on('load', () => {
      this._addBarikoiAttribution()
    })
  }

  // Add Barikoi Attribution on Map Load
  _addBarikoiAttribution() {
    // Check if Logo Already Added
    const barikoiLogoContainer = document.querySelector('.maplibregl-control-container .maplibregl-ctrl-bottom-left .barikoi-logo-container')
    if(barikoiLogoContainer) {
      return
    }

    // Add Barikoi Logo
    const brAttrContainer = document.querySelector('.maplibregl-control-container .maplibregl-ctrl-bottom-left')

    if(brAttrContainer) {
      // Logo Container
      const logoContainer = document.createElement('a')
      logoContainer.className = 'barikoi-logo-container'
      logoContainer.setAttribute('href', 'https://www.barikoi.com')
      logoContainer.setAttribute('target', '_blank')
      logoContainer.style.boxSizing = 'border-box'
      logoContainer.style.pointerEvents = 'auto'
      logoContainer.style.cursor = 'pointer'
      logoContainer.style.display = 'block'

      // Logo
      const mapContainer = this.getContainer()
      const logo = document.createElement('img')
      logo.setAttribute('src', barikoiLogoBlack)
      logo.setAttribute('alt', 'Barikoi')
      logo.style.boxSizing = 'border-box'
      logo.style.margin = '0px 0px 4px 10px'
      logo.style.width = `clamp(40px, ${ mapContainer ? Math.round(mapContainer.clientWidth * 0.05) : 44 }px, 48px)`
      logo.style.objectFit = 'fill'

      // Append Logo
      logoContainer.appendChild(logo)
      brAttrContainer.prepend(logoContainer)

      // On Map Container Resize Observer
      new ResizeObserver(() => {
        const barikoiLogo = document.querySelector('.maplibregl-control-container .maplibregl-ctrl-bottom-left .barikoi-logo-container > img')
        const mapContainer = this.getContainer()
        if(barikoiLogo) {
          barikoiLogo.style.width = `clamp(40px, ${ mapContainer ? Math.round(mapContainer.clientWidth * 0.05) : 44 }px, 48px)`
        }
      })
      .observe(mapContainer)
    }
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
    return bkoiConfig.ACCESS_TOKEN
  },
  /**
   * @param {string} token
   */
  set accessToken(token) {
    bkoiConfig.ACCESS_TOKEN = token
  },
  get mapboxAccessToken() {
    return config.ACCESS_TOKEN
  },
  /**
   * @param {string} token
   */
  set mapboxAccessToken(token) {
    config.ACCESS_TOKEN = token
  },
  get baseApiUrl() {
    return config.API_URL
  },
  /**
   * @param {string} url
   */
  set baseApiUrl(url) {
    config.API_URL = url
  },
  // get workerCount() {
  //   return WorkerPool.workerCount
  // },
  // /**
  //  * @param {number} count
  //  */
  // set workerCount(count) {
  //   WorkerPool.workerCount = count
  // },
  get maxParallelImageRequests() {
    return config.MAX_PARALLEL_IMAGE_REQUESTS
  },
  /**
   * @param {number} numRequests
   */
  set maxParallelImageRequests(numRequests) {
    config.MAX_PARALLEL_IMAGE_REQUESTS = numRequests
  },
  // /**
  //    * @function clearStorage
  //    * @param {Function} callback
  //    */
  // clearStorage: callback => {
  //   clearTileCache(callback)
  // },
  workerUrl: ''
}

// Exports
export default exported