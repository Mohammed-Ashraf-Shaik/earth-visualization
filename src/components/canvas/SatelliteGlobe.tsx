'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  Maximize2,
  Minimize2,
  Mountain,
  Navigation,
  Sparkles,
  Layers,
  MapPin,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useAudio } from '@/hooks/useAudioSynth';

interface LandmarkDestination {
  id: string;
  name: string;
  category: string;
  altitudeMeters: number;
  viewpoint: string;
  image?: string;
}

const DESTINATIONS: LandmarkDestination[] = [
  {
    id: 'everest',
    name: 'Mount Everest',
    category: 'Highest Peak (8,848m)',
    altitudeMeters: 8848,
    viewpoint: 'cam:86.9250,27.9881,15000;0,70',
  },
  {
    id: 'grandcanyon',
    name: 'Grand Canyon',
    category: 'Geological Wonder (USA)',
    altitudeMeters: 2100,
    viewpoint: 'cam:-112.1129,36.1069,9000;45,72',
  },
  {
    id: 'matterhorn',
    name: 'Swiss Alps (Matterhorn)',
    category: 'Glacial Peak (4,478m)',
    altitudeMeters: 4478,
    viewpoint: 'cam:7.7584,45.9765,9500;30,68',
  },
  {
    id: 'nyc',
    name: 'Manhattan Skyline',
    category: 'Megacity 3D Buildings',
    altitudeMeters: 400,
    viewpoint: 'cam:-74.0060,40.7128,4500;25,65',
  },
  {
    id: 'tokyo',
    name: 'Tokyo Metropolis',
    category: 'Mount Fuji & Skyline',
    altitudeMeters: 634,
    viewpoint: 'cam:139.7500,35.6800,5500;15,60',
  },
  {
    id: 'dubai',
    name: 'Burj Khalifa & Palm',
    category: 'Modern Wonder (UAE)',
    altitudeMeters: 828,
    viewpoint: 'cam:55.2708,25.2048,4200;40,65',
  },
  {
    id: 'paris',
    name: 'Eiffel Tower',
    category: 'Historic Architecture',
    altitudeMeters: 330,
    viewpoint: 'cam:2.2945,48.8584,3800;20,62',
  },
  {
    id: 'fuji',
    name: 'Mount Fuji Stratovolcano',
    category: 'Sacred Volcano (3,776m)',
    altitudeMeters: 3776,
    viewpoint: 'cam:138.7274,35.3606,8500;40,65',
  },
  {
    id: 'hawaii',
    name: 'Mauna Kea Volcano',
    category: 'Oceanic Shield Volcano',
    altitudeMeters: 4207,
    viewpoint: 'cam:-155.4681,19.8206,12000;50,65',
  },
  {
    id: 'tajmahal',
    name: 'Taj Mahal',
    category: 'Monumental Heritage',
    altitudeMeters: 171,
    viewpoint: 'cam:78.0421,27.1751,2500;20,55',
  },
];

interface SatelliteGlobeProps {
  onCoordsChange?: (lat: number, lng: number, alt: number) => void;
}

export function SatelliteGlobe({ onCoordsChange }: SatelliteGlobeProps) {
  // Base 3D WebScene ID: 6682f70b89c4483f88e8df839a011c1e (same as earth3dmap.com)
  const baseWebsceneId = '6682f70b89c4483f88e8df839a011c1e';
  const [activeViewpoint, setActiveViewpoint] = useState<string>('');
  const [activeLandmark, setActiveLandmark] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRibbonOpen, setIsRibbonOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { playHover, playSelect, playFlyTo } = useAudio();

  const iframeSrc = activeViewpoint
    ? `https://www.arcgis.com/home/webscene/viewer.html?webscene=${baseWebsceneId}&ui=min&viewpoint=${encodeURIComponent(
        activeViewpoint
      )}`
    : `https://www.arcgis.com/home/webscene/viewer.html?webscene=${baseWebsceneId}&ui=min`;

  const handleSelectLandmark = (dest: LandmarkDestination) => {
    playSelect();
    playFlyTo();
    setActiveLandmark(dest.id);
    setActiveViewpoint(dest.viewpoint);
    setIsLoading(true);
  };

  const handleResetView = () => {
    playSelect();
    setActiveLandmark(null);
    setActiveViewpoint('');
    setIsLoading(true);
  };

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

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-[#020408] select-none"
    >
      {/* Loading state indicator */}
      {isLoading && (
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm transition-opacity duration-500">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
            <Navigation className="w-6 h-6 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <div className="mt-4 font-mono text-xs text-cyan-300 tracking-widest uppercase">
            STREAMING 3D SATELLITE TERRAIN TILES...
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            SUB-METER RESOLUTION • GLOBAL 3D ELEVATION MESH
          </div>
        </div>
      )}

      {/* 100% Full-DOM 3D Globe Iframe (Zero ads, zero sidebars) */}
      <iframe
        ref={iframeRef}
        src={iframeSrc}
        onLoad={() => setIsLoading(false)}
        title="3D Interactive Satellite Globe"
        allow="geolocation; camera; microphone; fullscreen; accelerometer"
        className="w-full h-full border-0 absolute inset-0 block bg-[#020408]"
        style={{
          width: '100vw',
          height: '100vh',
        }}
      />

      {/* Navigation Quick Controls Floating Toolbar (Top Right) */}
      <div className="absolute top-20 right-6 z-30 flex flex-col gap-2 pointer-events-auto">
        {/* Reset View Button */}
        <button
          onClick={handleResetView}
          onMouseEnter={playHover}
          title="Reset to Full Planetary Orbit"
          className="flex items-center gap-2 bg-slate-950/80 hover:bg-slate-900 text-slate-200 hover:text-white px-3.5 py-2 rounded-xl backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.65)] font-mono text-xs transition-all duration-200 group"
        >
          <Compass className="w-4 h-4 text-cyan-400 group-hover:rotate-45 transition-transform" />
          <span className="hidden sm:inline">GLOBAL ORBIT</span>
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          onMouseEnter={playHover}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          className="flex items-center gap-2 bg-slate-950/80 hover:bg-slate-900 text-slate-200 hover:text-white px-3.5 py-2 rounded-xl backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.65)] font-mono text-xs transition-all duration-200"
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-cyan-400" />
          ) : (
            <Maximize2 className="w-4 h-4 text-cyan-400" />
          )}
          <span className="hidden sm:inline">{isFullscreen ? 'EXIT FULL' : 'FULLSCREEN'}</span>
        </button>
      </div>

      {/* Quick Fly-To 3D Landmarks Floating Ribbon (Bottom Center) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-5xl px-4 pointer-events-auto">
        <div className="bg-slate-950/85 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_12px_40px_0_rgba(0,0,0,0.85)] p-3 transition-all duration-300">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 px-2">
            <div className="flex items-center gap-2">
              <Mountain className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-xs font-bold text-white tracking-wider uppercase">
                3D LANDMARK TELEPORTERS & DEEP ZOOM
              </span>
              <span className="hidden md:inline text-[10px] font-mono text-cyan-400/80 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                RIGHT-CLICK DRAG TO TILT 3D
              </span>
            </div>

            <button
              onClick={() => {
                setIsRibbonOpen(!isRibbonOpen);
                playSelect();
              }}
              className="text-slate-400 hover:text-white text-xs font-mono flex items-center gap-1 transition-colors"
            >
              <span>{isRibbonOpen ? 'HIDE' : 'SHOW'}</span>
            </button>
          </div>

          {isRibbonOpen && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {DESTINATIONS.map((dest) => {
                const isSelected = activeLandmark === dest.id;
                return (
                  <button
                    key={dest.id}
                    onClick={() => handleSelectLandmark(dest)}
                    onMouseEnter={playHover}
                    className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl font-mono text-xs transition-all duration-200 border ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                        : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/10 hover:border-cyan-500/40 hover:text-white'
                    }`}
                  >
                    <MapPin
                      className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`}
                    />
                    <div className="text-left">
                      <div className="font-bold text-[11px] leading-tight truncate">
                        {dest.name}
                      </div>
                      <div className="text-[9px] text-slate-400 leading-tight">
                        {dest.category}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
