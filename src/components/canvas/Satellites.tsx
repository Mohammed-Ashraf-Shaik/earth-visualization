'use client';

import * as THREE from 'three';
import { SatelliteTelemetry } from '@/types/telemetry';
import { latLngToVector3 } from '@/hooks/useGlobeControls';

export class SatelliteVisualizer {
  private group: THREE.Group;
  private earthRadius: number;
  private beaconMesh: THREE.Mesh;
  private solarWingLeft: THREE.Mesh;
  private solarWingRight: THREE.Mesh;
  private trajectoryLine: THREE.Line;
  private trajectoryGeometry: THREE.BufferGeometry;
  private ringMesh: THREE.Mesh;

  constructor(earthRadius: number = 100) {
    this.earthRadius = earthRadius;
    this.group = new THREE.Group();
    this.group.name = 'SatelliteLayer';

    // 1. Emissive Diamond Core (Octahedron)
    const coreGeo = new THREE.OctahedronGeometry(1.6, 0);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: false,
    });
    this.beaconMesh = new THREE.Mesh(coreGeo, coreMat);

    // Solar array wings
    const wingGeo = new THREE.BoxGeometry(3.6, 0.1, 1.2);
    const wingMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    this.solarWingLeft = new THREE.Mesh(wingGeo, wingMat);
    this.solarWingLeft.position.set(-2.8, 0, 0);
    this.solarWingRight = new THREE.Mesh(wingGeo, wingMat);
    this.solarWingRight.position.set(2.8, 0, 0);

    const satelliteRig = new THREE.Group();
    satelliteRig.name = 'ISS_RIG';
    satelliteRig.add(this.beaconMesh);
    satelliteRig.add(this.solarWingLeft);
    satelliteRig.add(this.solarWingRight);

    // Pulsing halo ring around ISS
    const ringGeo = new THREE.RingGeometry(2.4, 2.7, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    this.ringMesh = new THREE.Mesh(ringGeo, ringMat);
    this.ringMesh.rotation.x = Math.PI / 2;
    satelliteRig.add(this.ringMesh);

    this.group.add(satelliteRig);

    // 2. Glowing Trajectory Ribbon
    this.trajectoryGeometry = new THREE.BufferGeometry();
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.7,
      linewidth: 2,
    });
    this.trajectoryLine = new THREE.Line(this.trajectoryGeometry, lineMat);
    this.group.add(this.trajectoryLine);
  }

  public getObject3D(): THREE.Group {
    return this.group;
  }

  public update(telemetry: SatelliteTelemetry, trajectory: Array<[number, number]>, elapsedSec: number) {
    const orbitalRadius = this.earthRadius * (1 + 0.08); // elevated at h = 0.08

    // Update ISS Rig position
    const pos = latLngToVector3(telemetry.latitude, telemetry.longitude, orbitalRadius);
    const issRig = this.group.getObjectByName('ISS_RIG');
    if (issRig) {
      issRig.position.copy(pos);
      issRig.lookAt(0, 0, 0);
      issRig.rotateY(elapsedSec * 1.5);
    }

    // Pulse ring
    if (this.ringMesh) {
      const scale = 1 + Math.sin(elapsedSec * 6) * 0.25;
      this.ringMesh.scale.set(scale, scale, scale);
    }

    // Update trajectory spline ribbon
    if (trajectory.length > 1) {
      const positions: number[] = [];
      for (const [lat, lng] of trajectory) {
        const p = latLngToVector3(lat, lng, orbitalRadius);
        positions.push(p.x, p.y, p.z);
      }
      this.trajectoryGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3)
      );
      this.trajectoryGeometry.computeBoundingSphere();
    }
  }

  public setVisible(visible: boolean) {
    this.group.visible = visible;
  }
}
