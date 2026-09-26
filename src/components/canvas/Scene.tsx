'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GlobeCore } from './GlobeCore';
import { createAtmosphereMesh } from './Atmosphere';
import { SatelliteVisualizer } from './Satellites';
import { SeismicVisualizer } from './SeismicLayer';
import { PostProcessingPipeline } from './PostProcessing';
import { useGlobeStore } from '@/stores/useGlobeStore';
import { useLayerStore } from '@/stores/useLayerStore';
import { useSeismicData } from '@/hooks/useSeismicData';
import { useISSTracker } from '@/hooks/useISSTracker';
import { GlobeCameraController, vector3ToLatLng, latLngToVector3 } from '@/hooks/useGlobeControls';
import { fetchCountryDossier } from '@/services/dossierService';
import { useAudio } from '@/hooks/useAudioSynth';

// Deep space starfield generator
function createStarfield(): THREE.Points {
  const count = 3500;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const starColors = [
    new THREE.Color(0xffffff), // White
    new THREE.Color(0xa5c9eb), // Blueish
    new THREE.Color(0xfff4e8), // Pale yellow
    new THREE.Color(0x00f0ff), // Cyan shimmer
  ];

  for (let i = 0; i < count; i++) {
    const r = 900 + Math.random() * 800;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    const c = starColors[Math.floor(Math.random() * starColors.length)];
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 2.0,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });

  return new THREE.Points(geometry, material);
}

export function Scene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);

  // Ingestion data streams
  const { events: seismicEvents } = useSeismicData();
  const { telemetry: issTelemetry, trajectory: issTrajectory } = useISSTracker();

  // Stores
  const setCursorCoordinates = useGlobeStore((s) => s.setCursorCoordinates);
  const setCameraAltitudeKm = useGlobeStore((s) => s.setCameraAltitudeKm);
  const setFps = useGlobeStore((s) => s.setFps);
  const setHoveredEntity = useGlobeStore((s) => s.setHoveredEntity);
  const setSelectedCountry = useGlobeStore((s) => s.setSelectedCountry);
  const targetCoordinates = useGlobeStore((s) => s.targetCoordinates);
  const clearFlyTo = useGlobeStore((s) => s.clearFlyTo);
  const isOrbitLocked = useGlobeStore((s) => s.isOrbitLocked);
  const layers = useLayerStore((s) => s.layers);

  const { playHover, playSelect, playFlyTo } = useAudio();

  // References for render loop
  const cameraControllerRef = useRef<GlobeCameraController | null>(null);
  const globeCoreRef = useRef<GlobeCore | null>(null);
  const atmosphereRef = useRef<THREE.Group | null>(null);
  const satellitesRef = useRef<SatelliteVisualizer | null>(null);
  const seismicRef = useRef<SeismicVisualizer | null>(null);
  const postProcessingRef = useRef<PostProcessingPipeline | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020408); // Deep Void

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 3000);
    camera.position.set(0, 30, 280);
    camera.lookAt(0, 0, 0);

    const cameraController = new GlobeCameraController(camera);
    cameraControllerRef.current = cameraController;

    // 2. Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.error('WebGL Context creation failed:', e);
      setWebglSupported(false);
      return;
    }

    // 3. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 125;
    controls.maxDistance = 600;
    controls.rotateSpeed = 0.65;
    controls.zoomSpeed = 0.85;
    controlsRef.current = controls;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(250, 60, 180);
    scene.add(sunLight);

    // 5. Starfield Background
    const starfield = createStarfield();
    scene.add(starfield);

    // 6. Globe Core
    const globeCore = new GlobeCore();
    globeCoreRef.current = globeCore;
    scene.add(globeCore.getObject3D());

    // 7. Atmospheric Rayleigh/Mie Scattering Mesh
    const atmosphere = createAtmosphereMesh(100);
    atmosphereRef.current = atmosphere;
    scene.add(atmosphere);

    // 8. ISS Satellites Visualizer
    const satellites = new SatelliteVisualizer(100);
    satellitesRef.current = satellites;
    scene.add(satellites.getObject3D());

    // 9. USGS Seismic Visualizer
    const seismic = new SeismicVisualizer(100);
    seismicRef.current = seismic;
    scene.add(seismic.getObject3D());

    // 10. Post-processing (UnrealBloom + Vignette)
    const postProcessing = new PostProcessingPipeline(renderer, scene, camera, width, height);
    postProcessingRef.current = postProcessing;

    // 11. Fetch boundary GeoJSON
    fetch('/api/geojson')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.features && data.features.length > 0) {
          globeCore.setupPolygons(data.features);
        }
      })
      .catch((err) => console.warn('Could not load vector boundaries:', err));

    // 12. Raycasting Hit Detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);
    const globeSphere = new THREE.Mesh(
      new THREE.SphereGeometry(100, 32, 32),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    scene.add(globeSphere);

    let lastRaycastTime = 0;

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Throttle raycasting to ~30 FPS to preserve 60+ FPS render loop
      const now = performance.now();
      if (now - lastRaycastTime < 33) return;
      lastRaycastTime = now;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(globeSphere);

      if (intersects.length > 0) {
        const hitPoint = intersects[0].point;
        const coords = vector3ToLatLng(hitPoint);
        setCursorCoordinates(coords.lat, coords.lng);
      }
    };

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(globeSphere);

      if (intersects.length > 0) {
        const hitPoint = intersects[0].point;
        const coords = vector3ToLatLng(hitPoint);
        playSelect();
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointermove', onPointerMove, { passive: true });
    domElement.addEventListener('click', onClick);

    // 13. Window Resize Handler
    const onResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      postProcessing.setSize(width, height);
    };

    window.addEventListener('resize', onResize);

    // 14. 60+ FPS Main Render Loop
    let animationFrameId: number;
    let lastFrameTime = performance.now();
    let frameCount = 0;
    let fpsAccumulator = 0;

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = (time - lastFrameTime) / 1000;
      lastFrameTime = time;

      // FPS calculation every 500ms
      frameCount++;
      fpsAccumulator += delta;
      if (fpsAccumulator >= 0.5) {
        setFps((frameCount / fpsAccumulator));
        frameCount = 0;
        fpsAccumulator = 0;
      }

      // Update camera fly-to transition
      const isTransitioning = cameraController.update();
      if (!isTransitioning) {
        controls.update();
      }

      // Auto-rotation when orbit locked or layer enabled
      if (isOrbitLocked || layers.autoRotate) {
        scene.rotation.y += 0.0012;
      }

      // Calculate camera orbital altitude
      const distance = camera.position.length();
      const altitudeKm = ((distance / 100) - 1) * 6371;
      setCameraAltitudeKm(Math.max(400, altitudeKm));

      // Update Seismic & ISS animations
      if (seismicRef.current && layers.seismic) {
        seismicRef.current.update(time);
      }
      if (satellitesRef.current && layers.satellites) {
        satellitesRef.current.update(issTelemetry, issTrajectory, time / 1000);
      }

      // Render via PostProcessing Composer or Fallback Renderer
      if (layers.bloom) {
        postProcessing.render();
      } else {
        renderer.render(scene, camera);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onResize);
      domElement.removeEventListener('pointermove', onPointerMove);
      domElement.removeEventListener('click', onClick);
      controls.dispose();
      renderer.dispose();
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, []);

  // Update seismic events when data arrives
  useEffect(() => {
    if (seismicRef.current && seismicEvents.length > 0) {
      seismicRef.current.updateEvents(seismicEvents);
    }
  }, [seismicEvents]);

  // Handle flyTo camera targets from Omnibox or Country sheet
  useEffect(() => {
    if (targetCoordinates && cameraControllerRef.current) {
      const { lat, lng, altitude, duration } = targetCoordinates;
      const targetDist = (altitude || 2.0) * 100;
      cameraControllerRef.current.flyTo(lat, lng, targetDist, duration || 2400);
      clearFlyTo();
    }
  }, [targetCoordinates, clearFlyTo]);

  // Sync Layer toggles with 3D meshes
  useEffect(() => {
    if (atmosphereRef.current) {
      atmosphereRef.current.visible = layers.atmosphere;
    }
    if (satellitesRef.current) {
      satellitesRef.current.setVisible(layers.satellites);
    }
    if (seismicRef.current) {
      seismicRef.current.setVisible(layers.seismic);
    }
    if (globeCoreRef.current) {
      globeCoreRef.current.setPolygonsVisible(layers.boundaries);
    }
    if (postProcessingRef.current) {
      postProcessingRef.current.setBloomEnabled(layers.bloom);
    }
  }, [layers]);

  if (!webglSupported) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-white font-mono p-6 text-center">
        <div className="text-cyan-400 text-lg font-bold mb-2">WEBGL ACCELERATION REQUIRED</div>
        <p className="text-xs text-slate-400 max-w-md">
          TERRA operates with hardware-accelerated 3D shaders. Please enable WebGL in your browser settings.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden bg-void cursor-grab active:cursor-grabbing"
    />
  );
}
