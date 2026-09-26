'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  X,
  Compass,
  Maximize2,
  Minimize2,
  RotateCw,
  Globe2,
  Eye,
  MapPin,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useAudio } from '@/hooks/useAudioSynth';
import { GeographicFeature, GEOGRAPHIC_CATALOG } from '@/data/geographicCatalog';

interface PanoramaViewerProps {
  feature: GeographicFeature;
  onClose: () => void;
  onSelectFeature?: (feat: GeographicFeature) => void;
}

export function PanoramaViewer({
  feature,
  onClose,
  onSelectFeature,
}: PanoramaViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [currentHeading, setCurrentHeading] = useState(0);
  const [showInfo, setShowInfo] = useState(true);

  const { playHover, playSelect, playFlyTo } = useAudio();

  // Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const animFrameId = useRef<number | null>(null);

  // Interaction coordinates
  const isPointerDown = useRef(false);
  const onPointerDownMouseX = useRef(0);
  const onPointerDownMouseY = useRef(0);
  const onPointerDownLon = useRef(0);
  const onPointerDownLat = useRef(0);
  const lon = useRef(0);
  const lat = useRef(0);

  const toggleFullscreen = () => {
    playSelect();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleZoom = (delta: number) => {
    playSelect();
    if (!cameraRef.current) return;
    const newFov = Math.max(28, Math.min(95, cameraRef.current.fov + delta));
    cameraRef.current.fov = newFov;
    cameraRef.current.updateProjectionMatrix();
  };

  const handleResetHeading = () => {
    playSelect();
    lon.current = 0;
    lat.current = 0;
    if (cameraRef.current) {
      cameraRef.current.fov = 75;
      cameraRef.current.updateProjectionMatrix();
    }
  };

  // Initialize Three.js 360 Photosphere
  useEffect(() => {
    if (!mountRef.current) return;

    setIsLoading(true);

    const width = mountRef.current.clientWidth || window.innerWidth;
    const height = mountRef.current.clientHeight || window.innerHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 1, 1200);
    const cameraTarget = new THREE.Vector3(0, 0, 0);
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    rendererRef.current = renderer;

    mountRef.current.replaceChildren(renderer.domElement);

    // 3. 360 Inverted Sphere Geometry
    const geometry = new THREE.SphereGeometry(500, 64, 40);
    geometry.scale(-1, 1, 1); // Invert normals so texture is visible inside

    // 4. Load High-Resolution 360 Panoramic Texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');

    const textureUrl = feature.panoramaUrl || feature.imageUrl;
    const texture = textureLoader.load(
      textureUrl,
      () => {
        setIsLoading(false);
      },
      undefined,
      () => {
        // Fallback to standard photo if panorama texture failed
        if (textureUrl !== feature.imageUrl) {
          textureLoader.load(feature.imageUrl, (fallbackTex) => {
            if (meshRef.current) {
              fallbackTex.colorSpace = THREE.SRGBColorSpace;
              (meshRef.current.material as THREE.MeshBasicMaterial).map = fallbackTex;
              (meshRef.current.material as THREE.MeshBasicMaterial).needsUpdate = true;
            }
            setIsLoading(false);
          });
        } else {
          setIsLoading(false);
        }
      }
    );
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;

    const material = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(geometry, material);
    meshRef.current = mesh;
    scene.add(mesh);

    // 5. Animation Render Loop
    let running = true;
    const renderLoop = () => {
      if (!running) return;

      if (autoRotate && !isPointerDown.current) {
        lon.current += 0.08;
      }

      // Clamp vertical pitch to prevent gimbal singularity
      lat.current = Math.max(-85, Math.min(85, lat.current));

      const phi = THREE.MathUtils.degToRad(90 - lat.current);
      const theta = THREE.MathUtils.degToRad(lon.current);

      cameraTarget.x = 500 * Math.sin(phi) * Math.cos(theta);
      cameraTarget.y = 500 * Math.cos(phi);
      cameraTarget.z = 500 * Math.sin(phi) * Math.sin(theta);

      camera.lookAt(cameraTarget);

      // Update current heading readout
      const headingDeg = Math.round(((lon.current % 360) + 360) % 360);
      setCurrentHeading(headingDeg);

      renderer.render(scene, camera);
      animFrameId.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      running = false;
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      texture.dispose();
    };
  }, [feature, autoRotate]);

  // Pointer & Touch Events
  const handlePointerDown = (event: React.PointerEvent) => {
    isPointerDown.current = true;
    onPointerDownMouseX.current = event.clientX;
    onPointerDownMouseY.current = event.clientY;
    onPointerDownLon.current = lon.current;
    onPointerDownLat.current = lat.current;
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!isPointerDown.current) return;
    lon.current =
      (onPointerDownMouseX.current - event.clientX) * 0.15 + onPointerDownLon.current;
    lat.current =
      (event.clientY - onPointerDownMouseY.current) * 0.15 + onPointerDownLat.current;
  };

  const handlePointerUp = () => {
    isPointerDown.current = false;
  };

  const handleWheel = (event: React.WheelEvent) => {
    if (!cameraRef.current) return;
    const fov = cameraRef.current.fov + event.deltaY * 0.05;
    cameraRef.current.fov = THREE.MathUtils.clamp(fov, 25, 95);
    cameraRef.current.updateProjectionMatrix();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setAutoRotate((prev) => !prev);
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        lon.current -= 5;
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        lon.current += 5;
      } else if (e.key === 'ArrowUp' || e.key === 'w') {
        lat.current += 5;
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        lat.current -= 5;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Teleport to next / previous landmark
  const currentIndex = GEOGRAPHIC_CATALOG.findIndex((f) => f.id === feature.id);
  const handleNext = () => {
    playSelect();
    playFlyTo();
    const nextIdx = (currentIndex + 1) % GEOGRAPHIC_CATALOG.length;
    onSelectFeature?.(GEOGRAPHIC_CATALOG[nextIdx]);
  };

  const handlePrev = () => {
    playSelect();
    playFlyTo();
    const prevIdx =
      (currentIndex - 1 + GEOGRAPHIC_CATALOG.length) % GEOGRAPHIC_CATALOG.length;
    onSelectFeature?.(GEOGRAPHIC_CATALOG[prevIdx]);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#050608] select-none animate-in fade-in duration-300">
      {/* 360 WebGL Canvas Viewport */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing absolute inset-0 touch-none"
      />

      {/* Top Header Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between p-4 md:p-6 bg-gradient-to-b from-[#050608]/90 via-[#050608]/50 to-transparent pointer-events-none">
        {/* Left: Landmark Title & 360 Mode Pill */}
        <div className="flex items-center gap-3 bg-[#0d0e12]/90 backdrop-blur-xl border border-white/[0.08] px-4 py-2 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.8)] pointer-events-auto">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="font-extrabold text-xs text-white uppercase tracking-wider">
              360° IMMERSIVE VIEW
            </span>
          </div>

          <div className="h-3 w-[1px] bg-white/20" />

          <div className="flex items-center gap-1.5 text-xs font-mono text-amber-200">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold">{feature.name}</span>
            <span className="text-slate-400 hidden sm:inline">({feature.country})</span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Compass & Heading Readout */}
          <button
            onClick={handleResetHeading}
            onMouseEnter={playHover}
            title="Reset Orientation (North 0°)"
            className="hidden sm:flex items-center gap-1.5 bg-[#0d0e12]/90 hover:bg-[#161820] text-amber-300 px-3 py-2 rounded-full backdrop-blur-xl border border-white/[0.08] hover:border-amber-400/40 font-mono text-xs shadow-[0_8px_32px_rgba(0,0,0,0.8)]"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>{currentHeading}° HDG</span>
          </button>

          {/* Auto-Rotation Toggle */}
          <button
            onClick={() => {
              playSelect();
              setAutoRotate((prev) => !prev);
            }}
            onMouseEnter={playHover}
            title={autoRotate ? 'Pause 360 Auto-Rotation (Space)' : 'Start 360 Auto-Rotation (Space)'}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full backdrop-blur-xl border font-mono text-xs transition-all shadow-[0_8px_32px_rgba(0,0,0,0.8)] ${
              autoRotate
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                : 'bg-[#0d0e12]/90 text-slate-300 hover:text-white border-white/[0.08]'
            }`}
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{autoRotate ? 'AUTO 360° ON' : 'AUTO 360° OFF'}</span>
          </button>

          {/* Zoom In / Out Buttons */}
          <div className="hidden sm:flex items-center bg-[#0d0e12]/90 backdrop-blur-xl border border-white/[0.08] rounded-full p-0.5">
            <button
              onClick={() => handleZoom(-10)}
              onMouseEnter={playHover}
              title="Zoom In (Scroll Up)"
              className="p-1.5 text-slate-300 hover:text-amber-300 rounded-full hover:bg-white/[0.06] transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <div className="h-3 w-[1px] bg-white/10" />
            <button
              onClick={() => handleZoom(10)}
              onMouseEnter={playHover}
              title="Zoom Out (Scroll Down)"
              className="p-1.5 text-slate-300 hover:text-amber-300 rounded-full hover:bg-white/[0.06] transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Toggle Dossier Info */}
          <button
            onClick={() => {
              playSelect();
              setShowInfo((prev) => !prev);
            }}
            onMouseEnter={playHover}
            title="Toggle Landmark Dossier"
            className={`p-2 rounded-full backdrop-blur-xl border transition-all ${
              showInfo
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                : 'bg-[#0d0e12]/90 text-slate-300 hover:text-white border-white/[0.08]'
            }`}
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            onMouseEnter={playHover}
            className="flex items-center gap-1.5 bg-[#0d0e12]/90 hover:bg-[#161820] text-slate-200 hover:text-white px-3 py-2 rounded-full backdrop-blur-xl border border-white/[0.08] hover:border-amber-400/40 font-mono text-xs transition-all shadow-[0_8px_32px_rgba(0,0,0,0.8)]"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="hidden lg:inline">{isFullscreen ? 'EXIT FULL' : 'FULL'}</span>
          </button>

          {/* Return to 3D Globe */}
          <button
            onClick={() => {
              playSelect();
              onClose();
            }}
            onMouseEnter={playHover}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold px-4 py-2 rounded-full font-mono text-xs transition-all shadow-[0_0_24px_rgba(245,158,11,0.5)] active:scale-95"
          >
            <Globe2 className="w-4 h-4" />
            <span>RETURN TO 3D GLOBE</span>
          </button>
        </div>
      </div>

      {/* Floating Left Dossier Panel (Collapsible) */}
      {showInfo && (
        <div className="absolute top-20 left-6 z-40 w-80 bg-[#0d0e12]/90 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-4 shadow-[0_16px_50px_rgba(0,0,0,0.85)] font-mono text-xs space-y-2.5 animate-in slide-in-from-left duration-200 pointer-events-auto">
          <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.08]">
            <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
              360° FIELD DOSSIER
            </span>
            <span className="text-[9px] text-slate-400">
              {feature.lat.toFixed(4)}°, {feature.lng.toFixed(4)}°
            </span>
          </div>

          <div className="text-[11px] font-sans text-slate-200 leading-relaxed bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.04]">
            {feature.description}
          </div>

          <div className="space-y-1 text-[11px]">
            {feature.facts.slice(0, 3).map((f, i) => (
              <div key={i} className="flex justify-between py-0.5 border-b border-white/[0.03]">
                <span className="text-slate-400">{f.label}:</span>
                <span className="text-amber-200 font-semibold truncate max-w-[150px]">{f.value}</span>
              </div>
            ))}
          </div>

          <div className="pt-1 text-[10px] text-slate-400 flex items-center justify-between">
            <span>DRAG: 360° FREE LOOK</span>
            <span>SCROLL: ZOOM FOV</span>
          </div>
        </div>
      )}

      {/* Previous & Next Floating Chevrons */}
      <button
        onClick={handlePrev}
        onMouseEnter={playHover}
        title="Previous Landmark (Left Arrow)"
        className="absolute left-6 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-[#0d0e12]/80 hover:bg-amber-500 hover:text-slate-950 text-slate-200 border border-white/10 hover:border-amber-400 backdrop-blur-xl transition-all shadow-[0_8px_32px_rgba(0,0,0,0.8)] pointer-events-auto"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={handleNext}
        onMouseEnter={playHover}
        title="Next Landmark (Right Arrow)"
        className="absolute right-6 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-[#0d0e12]/80 hover:bg-amber-500 hover:text-slate-950 text-slate-200 border border-white/10 hover:border-amber-400 backdrop-blur-xl transition-all shadow-[0_8px_32px_rgba(0,0,0,0.8)] pointer-events-auto"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center bg-[#050608]/85 backdrop-blur-md transition-opacity duration-500">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
            <RotateCw className="w-6 h-6 text-amber-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
          </div>
          <div className="mt-4 font-mono text-xs text-amber-200 tracking-widest uppercase">
            CALIBRATING 360° PHOTOSPHERE MATRIX...
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            SPHERICAL EQUIRECTANGULAR PROJECTION • 60 FPS WEBGL
          </div>
        </div>
      )}

      {/* Bottom Quick-Teleport Landmark Carousel */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-5xl px-4 pointer-events-auto">
        <div className="bg-[#0c0d12]/90 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-2.5 shadow-[0_16px_50px_rgba(0,0,0,0.85)] flex items-center gap-3 overflow-x-auto scrollbar-thin">
          <div className="flex-shrink-0 px-2 font-mono text-[10px] uppercase tracking-wider text-amber-400 font-bold border-r border-white/10">
            360° WONDERS
          </div>

          {GEOGRAPHIC_CATALOG.map((item) => {
            const isCurrent = item.id === feature.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  playSelect();
                  playFlyTo();
                  onSelectFeature?.(item);
                }}
                onMouseEnter={playHover}
                className={`flex-shrink-0 flex items-center gap-2 p-1.5 pr-3 rounded-xl font-mono text-xs transition-all border ${
                  isCurrent
                    ? 'bg-amber-500/20 border-amber-400/70 text-amber-200 shadow-[0_0_16px_rgba(245,158,11,0.25)]'
                    : 'bg-white/[0.02] border-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-[11px] truncate max-w-[120px]">{item.name}</div>
                  <div className="text-[9px] text-slate-400 truncate max-w-[120px]">{item.country}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
