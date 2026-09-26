'use client';

import * as THREE from 'three';
import { SeismicEvent } from '@/types/telemetry';
import { latLngToVector3 } from '@/hooks/useGlobeControls';

export function getSeismicColor(magnitude: number): THREE.Color {
  if (magnitude >= 6.0) {
    return new THREE.Color('#ef4444'); // Emissive Crimson
  } else if (magnitude >= 4.0) {
    return new THREE.Color('#fbbf24'); // Solar Amber
  } else {
    return new THREE.Color('#22d3ee'); // Emerald Cyan
  }
}

export function getSeismicRadius(magnitude: number): number {
  return Math.pow(Math.max(0.1, magnitude - 2.0), 1.8) * 0.5;
}

export class SeismicVisualizer {
  private group: THREE.Group;
  private earthRadius: number;
  private ringsData: Array<{
    mesh: THREE.Mesh;
    mat: THREE.MeshBasicMaterial;
    baseRadius: number;
    phaseOffset: number;
  }> = [];

  constructor(earthRadius: number = 100) {
    this.earthRadius = earthRadius;
    this.group = new THREE.Group();
    this.group.name = 'SeismicLayer';
  }

  public getObject3D(): THREE.Group {
    return this.group;
  }

  public updateEvents(events: SeismicEvent[]) {
    // Clear old meshes
    while (this.group.children.length > 0) {
      const obj = this.group.children[0] as THREE.Mesh;
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material.dispose();
      }
      this.group.remove(obj);
    }
    this.ringsData = [];

    const surfaceR = this.earthRadius * 1.004;

    events.forEach((ev) => {
      const [lng, lat] = ev.coordinates;
      const pos = latLngToVector3(lat, lng, surfaceR);
      const color = getSeismicColor(ev.magnitude);
      const baseR = getSeismicRadius(ev.magnitude);

      // Normal vector from Earth center to position
      const normal = pos.clone().normalize();

      // Create central epicenter beacon
      const centerGeo = new THREE.SphereGeometry(Math.max(0.4, baseR * 0.2), 16, 16);
      const centerMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.95,
      });
      const centerMesh = new THREE.Mesh(centerGeo, centerMat);
      centerMesh.position.copy(pos);
      this.group.add(centerMesh);

      // Create 3 concentric expanding rings
      for (let ringIdx = 0; ringIdx < 3; ringIdx++) {
        const ringGeo = new THREE.RingGeometry(0.8, 1.0, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8,
          depthWrite: false,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.copy(pos);
        ringMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

        this.group.add(ringMesh);
        this.ringsData.push({
          mesh: ringMesh,
          mat: ringMat,
          baseRadius: baseR,
          phaseOffset: (ringIdx / 3),
        });
      }
    });
  }

  public update(timeMs: number) {
    const loopDuration = 2400; // 2400ms loop
    const t = (timeMs % loopDuration) / loopDuration;

    for (const item of this.ringsData) {
      const localPhase = (t + item.phaseOffset) % 1.0;
      const currentScale = (localPhase * item.baseRadius * 2.2) + 0.2;
      const currentOpacity = Math.max(0, 1.0 - localPhase);

      item.mesh.scale.set(currentScale, currentScale, 1);
      item.mat.opacity = currentOpacity * 0.85;
    }
  }

  public setVisible(visible: boolean) {
    this.group.visible = visible;
  }
}
