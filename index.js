import exported from './src/index.js'

// Re-export everything except Map, then export Map separately
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
    workerUrl
} = exported

export {
    version,
    supported,
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
    config,
    prewarm,
    clearPrewarmedResources,
    workerUrl
}

// Export Map separately to avoid private property issues
export { Map }

export default exported