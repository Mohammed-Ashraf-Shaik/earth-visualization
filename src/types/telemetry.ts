export type GeoCoordinate = [latitude: number, longitude: number];

export interface SeismicEvent {
  id: string;
  magnitude: number;
  place: string;
  time: number;
  coordinates: [longitude: number, latitude: number, depthKm: number];
  tsunamiAlert: boolean;
}

export interface SatelliteTelemetry {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  altitudeKm: number;
  velocityKph: number;
  visibility: 'daylight' | 'eclipsed';
  footprint: number;
  timestamp: number;
}

export interface CountryDossier {
  cca3: string;
  name: { common: string; official: string };
  capital: string[];
  region: string;
  subregion: string;
  population: number;
  areaKm2: number;
  coordinates: GeoCoordinate;
  borders: string[];
  flagSvg?: string;
  elevationExtremes: {
    highest: { name: string; meters: number };
    lowest: { name: string; meters: number };
  };
  weather: {
    tempC: number;
    windSpeedKph: number;
    conditionCode: number;
    humidity?: number;
  };
}

export interface LayerState {
  atmosphere: boolean;
  seismic: boolean;
  satellites: boolean;
  boundaries: boolean;
  terminator: boolean;
  clouds: boolean;
  bloom: boolean;
  audio: boolean;
  autoRotate: boolean;
}

export interface RaycastHitData {
  lat: number;
  lng: number;
  altitudeKm: number;
  countryCode?: string;
  countryName?: string;
}

export interface SearchItem {
  id: string;
  type: 'country' | 'city' | 'landmark';
  name: string;
  subtitle: string;
  lat: number;
  lng: number;
  cca3?: string;
}
