'use client';

import * as THREE from 'three';
import { atmosphereVertShader, atmosphereFragShader } from '@/shaders';

export function createAtmosphereMesh(earthRadius: number = 100): THREE.Group {
  const group = new THREE.Group();
  group.name = 'AtmosphereSystem';

  // 1. Inner atmospheric limb scattering layer (R = 1.015)
  const innerRadius = earthRadius * 1.015;
  const innerGeo = new THREE.SphereGeometry(innerRadius, 64, 64);
  const innerMat = new THREE.ShaderMaterial({
    vertexShader: atmosphereVertShader,
    fragmentShader: atmosphereFragShader,
    uniforms: {
      uAtmosphereColor: { value: new THREE.Color(0.18, 0.54, 0.98) },
      uCoefficient: { value: 0.65 },
      uPower: { value: 3.2 },
    },
    blending: THREE.AdditiveBlending,
    side: THREE.FrontSide,
    transparent: true,
    depthWrite: false,
  });
  const innerMesh = new THREE.Mesh(innerGeo, innerMat);
  group.add(innerMesh);

  // 2. Outer Rayleigh/Mie diffuse halo glow layer (R = 1.15)
  const outerRadius = earthRadius * 1.15;
  const outerGeo = new THREE.SphereGeometry(outerRadius, 64, 64);
  const outerMat = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.8);
        gl_FragColor = vec4(0.0, 0.85, 1.0, 1.0) * intensity * 0.75;
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
  });
  const outerMesh = new THREE.Mesh(outerGeo, outerMat);
  group.add(outerMesh);

  return group;
}
