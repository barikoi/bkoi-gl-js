import {
  Map,
  NavigationControl,
  GeolocateControl,
  Popup,
  Marker
} from 'maplibre-gl'

// Extend Map
class BkoiGlMap extends Map {
  constructor(mapOptions) {
    super({
      ...mapOptions,
      style: 'https://map.barikoi.com/styles/osm-liberty/style.json'
    })
  }
}

// Exports
export {
  BkoiGlMap as Map,
  NavigationControl,
  GeolocateControl,
  Popup,
  Marker
}