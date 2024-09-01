import exported from './src/index.js'

export const {
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

export default exported