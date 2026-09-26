'use client';

import * as THREE from 'three';
import { useGlobeStore } from '@/stores/useGlobeStore';

export function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

export function vector3ToLatLng(vector: THREE.Vector3): { lat: number; lng: number } {
  const norm = vector.clone().normalize();
  const phi = Math.acos(Math.max(-1, Math.min(1, norm.y)));
  const theta = Math.atan2(norm.z, -norm.x);

  const lat = 90 - (phi * 180) / Math.PI;
  let lng = (theta * 180) / Math.PI - 180;
  if (lng < -180) lng += 360;
  if (lng > 180) lng -= 360;

  return { lat, lng };
}

// Quintic ease-out: 1 - (1 - t)^5
export function quinticEaseOut(t: number): number {
  return 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 5);
}

export interface CameraTransition {
  startPos: THREE.Vector3;
  endPos: THREE.Vector3;
  startTime: number;
  durationMs: number;
  startRot: THREE.Quaternion;
  endRot: THREE.Quaternion;
}

export class GlobeCameraController {
  private camera: THREE.PerspectiveCamera;
  private currentTransition: CameraTransition | null = null;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

  public setCamera(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

  public flyTo(lat: number, lng: number, distance: number = 2.0, durationMs: number = 2200) {
    const targetPos = latLngToVector3(lat, lng, distance);
    const startPos = this.camera.position.clone();
    const startRot = this.camera.quaternion.clone();

    // Calculate end rotation looking at origin (0,0,0)
    const dummy = new THREE.PerspectiveCamera();
    dummy.position.copy(targetPos);
    dummy.lookAt(0, 0, 0);
    const endRot = dummy.quaternion.clone();

    this.currentTransition = {
      startPos,
      endPos: targetPos,
      startTime: performance.now(),
      durationMs,
      startRot,
      endRot,
    };
  }

  public update(): boolean {
    if (!this.currentTransition) return false;

    const now = performance.now();
    const elapsed = now - this.currentTransition.startTime;
    const rawProgress = elapsed / this.currentTransition.durationMs;

    if (rawProgress >= 1.0) {
      this.camera.position.copy(this.currentTransition.endPos);
      this.camera.quaternion.copy(this.currentTransition.endRot);
      this.camera.lookAt(0, 0, 0);
      this.currentTransition = null;
      return true; // Finished
    }

    const t = quinticEaseOut(rawProgress);

    // Slerp position along great-circle arc
    const startLen = this.currentTransition.startPos.length();
    const endLen = this.currentTransition.endPos.length();
    const currentRadius = THREE.MathUtils.lerp(startLen, endLen, t);

    const slerpedPos = new THREE.Vector3();
    const startNorm = this.currentTransition.startPos.clone().normalize();
    const endNorm = this.currentTransition.endPos.clone().normalize();
    const qStart = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), startNorm);
    const qEnd = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), endNorm);
    const qCurrent = new THREE.Quaternion().copy(qStart).slerp(qEnd, t);

    slerpedPos.set(0, 1, 0).applyQuaternion(qCurrent).multiplyScalar(currentRadius);
    this.camera.position.copy(slerpedPos);
    this.camera.quaternion.copy(this.currentTransition.startRot).slerp(this.currentTransition.endRot, t);
    this.camera.lookAt(0, 0, 0);

    return false;
  }
}
