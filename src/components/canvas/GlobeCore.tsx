'use client';

import * as THREE from 'three';
import ThreeGlobe from 'three-globe';
import { EARTH_TEXTURES } from '@/utils/textureGenerator';
import { WorldPolygonData } from '@/types/geojson';

export function calculateSubsolarPoint(date: Date = new Date()): { lat: number; lng: number } {
  // Approximate day of year
  const start = new Date(date.getUTCFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // Solar declination (approx -23.44° to +23.44°)
  const declination = -23.44 * Math.cos(((2 * Math.PI) / 365.25) * (dayOfYear + 10));

  // Sun longitude in degrees (-180 to 180) based on UTC hour
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  let sunLng = (12 - utcHours) * 15;
  if (sunLng > 180) sunLng -= 360;
  if (sunLng < -180) sunLng += 360;

  return { lat: declination, lng: sunLng };
}

export interface GlobeCoreCallbacks {
  onHoverPolygon?: (polygon: any | null, coords?: { lat: number; lng: number }) => void;
  onClickPolygon?: (polygon: any, coords: { lat: number; lng: number }) => void;
}

export class GlobeCore {
  public globe: ThreeGlobe;
  public group: THREE.Group;
  private hoveredPolygonId: string | null = null;
  private polygonsList: any[] = [];
  public sunDirection: THREE.Vector3 = new THREE.Vector3(1, 0.2, 0.5).normalize();

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'GlobeCoreGroup';

    // 1. Initialize three-globe with resilient constructor interop
    const GlobeConstructor = (ThreeGlobe as any).default || ThreeGlobe;
    this.globe = new GlobeConstructor({ animateIn: false })
      .globeImageUrl(EARTH_TEXTURES.dayHighRes)
      .bumpImageUrl(EARTH_TEXTURES.topologyBump)
      .showAtmosphere(false) // Custom Atmosphere GLSL shader handled separately
      .showGraticules(true);

    // Initial scale and orientation
    this.globe.scale.set(1, 1, 1);
    this.group.add(this.globe);

    // 2. Configure default polygon styling
    this.setupPolygons([]);
    this.updateSunPosition();
  }

  public updateSunPosition(date: Date = new Date()) {
    const { lat, lng } = calculateSubsolarPoint(date);
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);

    const x = -(Math.sin(phi) * Math.cos(theta));
    const z = Math.sin(phi) * Math.sin(theta);
    const y = Math.cos(phi);

    this.sunDirection.set(x, y, z).normalize();
  }

  public setupPolygons(polygons: any[]) {
    this.polygonsList = polygons;

    this.globe
      .polygonsData(polygons)
      .polygonGeoJsonGeometry((d: any) => d.geometry)
      .polygonAltitude((d: any) => {
        const isHovered = this.hoveredPolygonId === (d.id || d.properties?.ISO_A3 || d.properties?.cca3);
        // Elevate hovered polygon by +0.006 as required by Section 3.3
        return isHovered ? 0.016 : 0.006;
      })
      .polygonCapColor((d: any) => {
        const isHovered = this.hoveredPolygonId === (d.id || d.properties?.ISO_A3 || d.properties?.cca3);
        return isHovered ? 'rgba(56, 189, 248, 0.35)' : 'rgba(14, 165, 233, 0.03)';
      })
      .polygonSideColor(() => 'rgba(2, 132, 199, 0.15)')
      .polygonStrokeColor((d: any) => {
        const isHovered = this.hoveredPolygonId === (d.id || d.properties?.ISO_A3 || d.properties?.cca3);
        // Section 3.3: Set boundary stroke to #38bdf8 with emissive intensity
        return isHovered ? '#38bdf8' : 'rgba(56, 189, 248, 0.28)';
      });
  }

  public setHoveredPolygon(id: string | null) {
    if (this.hoveredPolygonId === id) return;
    this.hoveredPolygonId = id;
    // Trigger polygon re-evaluation in three-globe
    if (this.polygonsList.length > 0) {
      this.globe.polygonAltitude(this.globe.polygonAltitude());
      this.globe.polygonCapColor(this.globe.polygonCapColor());
      this.globe.polygonStrokeColor(this.globe.polygonStrokeColor());
    }
  }

  public setPolygonsVisible(visible: boolean) {
    if (!visible) {
      this.globe.polygonsData([]);
    } else {
      this.globe.polygonsData(this.polygonsList);
    }
  }

  public getObject3D(): THREE.Group {
    return this.group;
  }
}
