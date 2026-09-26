'use client';

import * as THREE from 'three';

// High-fidelity online NASA Blue Marble and Earth Observatory texture URLs
export const EARTH_TEXTURES = {
  dayHighRes: 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
  dayStandard: 'https://unpkg.com/three-globe/example/img/earth-day.jpg',
  nightLights: 'https://unpkg.com/three-globe/example/img/earth-night.jpg',
  topologyBump: 'https://unpkg.com/three-globe/example/img/earth-topology.png',
  specularOcean: 'https://unpkg.com/three-globe/example/img/earth-water.png',
  clouds: 'https://unpkg.com/three-globe/example/img/earth-clouds.png',
};

// Procedural fallback texture generator to guarantee 60+ FPS zero-latency rendering offline
export function generateProceduralDayTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep space ocean gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#04172c');
  grad.addColorStop(0.5, '#072444');
  grad.addColorStop(1, '#04172c');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Stylized procedural continental landmass silhouettes
  ctx.fillStyle = '#173b2c';
  // North America & South America rough patches
  ctx.beginPath();
  ctx.ellipse(280, 160, 130, 90, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(360, 340, 75, 120, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Eurasia & Africa
  ctx.fillStyle = '#1e4835';
  ctx.beginPath();
  ctx.ellipse(650, 150, 180, 100, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(560, 270, 90, 120, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Australia
  ctx.beginPath();
  ctx.ellipse(820, 360, 70, 50, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Antarctica ice shelf
  ctx.fillStyle = '#c5d8e8';
  ctx.fillRect(0, 470, 1024, 42);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function generateProceduralNightTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#020409';
  ctx.fillRect(0, 0, 1024, 512);

  // Urban city clusters (Golden / Cyan glowing points)
  const drawCluster = (cx: number, cy: number, radius: number, count: number) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.pow(Math.random(), 2) * radius;
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist;
      const brightness = Math.random();

      ctx.fillStyle = brightness > 0.8 ? '#00f0ff' : '#ffb938';
      ctx.fillRect(px, py, 1.5, 1.5);
    }
  };

  // US East Coast, Europe, East Asia, India, Japan
  drawCluster(320, 150, 50, 160);
  drawCluster(240, 160, 40, 100);
  drawCluster(550, 130, 45, 180);
  drawCluster(680, 220, 50, 190);
  drawCluster(770, 170, 40, 180);
  drawCluster(810, 160, 30, 150);
  drawCluster(370, 350, 35, 90);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}
