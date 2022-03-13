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
import barikoiLogoBlack from './assets/barikoi_logo_black.png'

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
    const brAttrContainer = document.querySelector('.mapboxgl-control-container .mapboxgl-ctrl-bottom-left')

    if(brAttrContainer) {
      // Logo Container
      const logoContainer = document.createElement('div')
      logoContainer.className = 'barikoi-logo'
      logoContainer.style.boxSizing = 'border-box'

      // Logo
      const logo = document.createElement('img')
      logo.setAttribute('src', barikoiLogoBlack)
      logo.setAttribute('alt', 'Barikoi')
      logo.setAttribute('width', '48px')
      logo.style.boxSizing = 'border-box'
      logo.style.margin = '0px 0px 10px 10px'

      // Append Logo
      logoContainer.appendChild(logo)
      brAttrContainer.prepend(logoContainer)
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