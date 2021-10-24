import {
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

// Extend Map
class BkoiGlMap extends Map {
  constructor(mapOptions) {
    if((!mapOptions.accessToken && !bkoiConfig.ACCESS_TOKEN) && (!mapOptions.style || isBarikoiStyle(mapOptions.style))) {
      console.error('Please provide a valid accessToken to use Barikoi assets.')
    }

    super({
      ...mapOptions,
      accessToken: null,
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
  }
}

const exported = {
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