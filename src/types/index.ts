import type { MapOptions, Map, ControlPosition } from 'maplibre-gl';
import type MapboxDraw from 'maplibre-gl-draw';

export interface BkoiMapOptions extends Omit<MapOptions, 'style' | 'accessToken'> {
  /**
   * Barikoi API access token for authentication
   */
  accessToken?: string;
  
  /**
   * Mapbox access token (if using Mapbox features)
   */
  mapboxAccessToken?: string;
  
  /**
   * Map style URL or Barikoi style identifier
   */
  style?: string;
  
  /**
   * Enable polygon drawing tools
   */
  polygon?: boolean;
  
  /**
   * Configuration options for maplibre-gl-draw
   */
  drawOptions?: Partial<MapboxDraw.DrawOptions>;
  
  /**
   * Array of style configurations for the style drawer
   */
  styles?: StyleConfig[];
}

export interface StyleConfig {
  /**
   * Style URL or identifier
   */
  style: string;
  
  /**
   * Thumbnail image URL for the style
   */
  image: string;
  
  /**
   * Display name for the style
   */
  name: string;
}

export interface BkoiConfig {
  ACCESS_TOKEN: string | null;
  DEFAULT_STYLE: string;
}
