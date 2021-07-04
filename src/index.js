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
// import WorkerPool from 'maplibre-gl/src/util/worker_pool'
// import { clearTileCache } from 'maplibre-gl/src/util/tile_request_cache'

// Default Style Types
const defaultStyleTypes = {
  light: 'https://map.barikoi.com/styles/osm-liberty/style.json',
  dark: 'https://map.barikoi.com/styles/barikoi-dark/style.json'
}

// Extend Map
class BkoiGlMap extends Map {
  constructor(mapOptions) {
    if(mapOptions.styleType && !defaultStyleTypes[ mapOptions.styleType ]) {
      console.warn("Invalid Style Type. Please choose from [ 'light', 'dark' ]. Setting 'light' as fallback.")
    }

    super({
      ...mapOptions,
      style: mapOptions.style ?
        mapOptions.style :
        (mapOptions.styleType && defaultStyleTypes[ mapOptions.styleType ]) ?
        defaultStyleTypes[ mapOptions.styleType ] :
        defaultStyleTypes.light
    })
  }

  // Set Map Style based on styleType
  setStyleType(styleType) {
    if(styleType && defaultStyleTypes[ styleType ]) {
      this.setStyle(defaultStyleTypes[ styleType ])

    } else {
      throw new Error("Invalid Style Type. Please choose from [ 'light', 'dark' ].")
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
    return config.ACCESS_TOKEN
  },
  /**
   * @param {string} token
   */
  set accessToken(token) {
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