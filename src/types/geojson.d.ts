export interface GeoJsonGeometry {
  type: string;
  coordinates: any;
}

export interface GeoJsonFeature {
  type: 'Feature';
  id?: string | number;
  properties: {
    NAME?: string;
    name?: string;
    ISO_A3?: string;
    ISO_A2?: string;
    ADM0_A3?: string;
    POP_EST?: number;
    CONTINENT?: string;
    [key: string]: any;
  };
  geometry: GeoJsonGeometry;
}

export interface GeoJsonFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
}

export interface WorldPolygonData {
  id: string;
  name: string;
  cca3: string;
  geometry: GeoJsonGeometry;
  altitude: number;
}
