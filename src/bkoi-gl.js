import { Map, NavigationControl, GeolocateControl, ScaleControl, Popup, Marker } from 'maplibre-gl'

// Default Style Types
const defaultStyleTypes = {
  light: 'https://map.barikoi.com/styles/osm-liberty/style.json',
  dark: 'https://map.barikoi.com/styles/barikoi-dark/style.json'
}

// Extend Map
class BkoiGlMap extends Map {
  constructor(mapOptions) {
    super({
      ...mapOptions,
      style: defaultStyleTypes[ mapOptions.styleType ] ?? defaultStyleTypes.light
    })
  }
}

// Exports
export {
  BkoiGlMap as Map,
  NavigationControl,
  GeolocateControl,
  ScaleControl,
  Popup,
  Marker
}