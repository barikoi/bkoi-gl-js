import { Map, NavigationControl, GeolocateControl, ScaleControl, Popup, Marker, FullscreenControl } from 'maplibre-gl'

// Default Style Types
const defaultStyleTypes = {
  light: 'https://map.barikoi.com/styles/osm-liberty/style.json',
  dark: 'https://map.barikoi.com/styles/barikoi-dark/style.json'
}

// Extend Map
class BkoiGlMap extends Map {
  constructor(mapOptions) {
    if(!mapOptions.styleType || !defaultStyleTypes[ mapOptions.styleType ]) {
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

// Exports
export {
  BkoiGlMap as Map,
  NavigationControl,
  GeolocateControl,
  ScaleControl,
  Popup,
  Marker,
  FullscreenControl
}