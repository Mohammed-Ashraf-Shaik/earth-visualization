'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Compass,
  Maximize2,
  Minimize2,
  Mountain,
  Flame,
  Waves,
  Sparkles,
  Landmark,
  Navigation,
  MapPin,
  Search,
  ChevronDown,
  ChevronUp,
  RotateCw,
  Eye,
  Play,
  Pause,
  Layers,
} from 'lucide-react';
import { GEOGRAPHIC_CATALOG, GeographicFeature, GeoCategory } from '@/data/geographicCatalog';
import { GeographicInspector } from '@/components/hud/GeographicInspector';
import { PanoramaViewer } from '@/components/canvas/PanoramaViewer';
import { useAudio } from '@/hooks/useAudioSynth';

export function SatelliteGlobe() {
  const baseWebsceneId = '6682f70b89c4483f88e8df839a011c1e';
  const [activeViewpoint, setActiveViewpoint] = useState<string>('');
  const [selectedFeature, setSelectedFeature] = useState<GeographicFeature | null>(null);
  const [active360Panorama, setActive360Panorama] = useState<GeographicFeature | null>(null);
  const [activeCategory, setActiveCategory] = useState<GeoCategory | 'all'>('wonders7'); // Default to 7 Wonders
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRibbonOpen, setIsRibbonOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // 360 Orbit & 3D Tilt Dynamics State
  const [isOrbiting, setIsOrbiting] = useState(false);
  const [orbitHeading, setOrbitHeading] = useState(0);
  const [tiltAngle, setTiltAngle] = useState(80); // Default to steep 80° for deep 3D ground relief
  const [altitudeMeters, setAltitudeMeters] = useState(800);

  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { playHover, playSelect, playFlyTo } = useAudio();

  // Filter features by category and search
  const filteredFeatures = useMemo(() => {
    return GEOGRAPHIC_CATALOG.filter((item) => {
      const matchesCat = activeCategory === 'all' || item.category === activeCategory;
      const matchesQuery =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.country.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

  const iframeSrc = activeViewpoint
    ? `https://www.arcgis.com/home/webscene/viewer.html?webscene=${baseWebsceneId}&ui=min&viewpoint=${encodeURIComponent(
        activeViewpoint
      )}`
    : `https://www.arcgis.com/home/webscene/viewer.html?webscene=${baseWebsceneId}&ui=min`;

  const handleSelectFeature = (feat: GeographicFeature) => {
    playSelect();
    playFlyTo();
    setSelectedFeature(feat);
    setIsOrbiting(false);
    setOrbitHeading(0);
    setTiltAngle(80); // Ensure steep 3D tilt (NOT flat!)
    setActiveViewpoint(feat.viewpointCloseUp);
    setIsLoading(true);
  };

  const handleResetView = () => {
    playSelect();
    setSelectedFeature(null);
    setIsOrbiting(false);
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

  // Continuous 360° Camera Orbit Animation
  useEffect(() => {
    if (!isOrbiting || !selectedFeature) return;

    const orbitInterval = setInterval(() => {
      setOrbitHeading((prev) => {
        const next = (prev + 45) % 360;
        const viewpointStr = `cam:${selectedFeature.lng},${selectedFeature.lat},${altitudeMeters};${next},${tiltAngle}`;
        setActiveViewpoint(viewpointStr);
        return next;
      });
    }, 4500);

    return () => clearInterval(orbitInterval);
  }, [isOrbiting, selectedFeature, altitudeMeters, tiltAngle]);

  const handleSetHeading = (heading: number) => {
    playSelect();
    setOrbitHeading(heading);
    if (selectedFeature) {
      setActiveViewpoint(
        `cam:${selectedFeature.lng},${selectedFeature.lat},${altitudeMeters};${heading},${tiltAngle}`
      );
    }
  };

  const handleSetTilt = (tilt: number) => {
    playSelect();
    setTiltAngle(tilt);
    if (selectedFeature) {
      setActiveViewpoint(
        `cam:${selectedFeature.lng},${selectedFeature.lat},${altitudeMeters};${orbitHeading},${tilt}`
      );
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'wonders7':
        return <Landmark className="w-3.5 h-3.5 text-amber-300" />;
      case 'volcano':
        return <Flame className="w-3.5 h-3.5 text-rose-400" />;
      case 'mountain':
        return <Mountain className="w-3.5 h-3.5 text-slate-200" />;
      case 'river':
        return <Waves className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-amber-300" />;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-[#07080a] select-none"
    >
      {/* 360° Photosphere Overlay (Mounts when active360Panorama is chosen) */}
      {active360Panorama && (
        <PanoramaViewer
          feature={active360Panorama}
          onClose={() => setActive360Panorama(null)}
          onSelectFeature={(feat) => {
            setSelectedFeature(feat);
            setActive360Panorama(feat);
            setActiveViewpoint(feat.viewpointCloseUp);
          }}
        />
      )}

      {/* Loading state indicator */}
      {isLoading && (
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center bg-[#07080a]/85 backdrop-blur-md transition-opacity duration-500">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
            <Navigation className="w-6 h-6 text-amber-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <div className="mt-4 font-mono text-xs text-amber-200 tracking-widest uppercase">
            CALIBRATING 3D SATELLITE TERRAIN TILES...
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            SUB-METER RESOLUTION • GLOBAL 3D ELEVATION MESH
          </div>
        </div>
      )}

      {/* 100% Full-DOM 3D Globe Viewport (Zero ads, zero side content) */}
      <iframe
        ref={iframeRef}
        src={iframeSrc}
        onLoad={() => setIsLoading(false)}
        title="3D Interactive Satellite Globe"
        allow="geolocation; camera; microphone; fullscreen; accelerometer"
        className="w-full h-full border-0 absolute inset-0 block bg-[#07080a]"
        style={{
          width: '100vw',
          height: '100vh',
        }}
      />

      {/* Floating Toolbar Controls (Top Right) */}
      <div className="absolute top-20 right-6 z-30 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={handleResetView}
          onMouseEnter={playHover}
          title="Reset to Full Planetary Orbit"
          className="flex items-center gap-2 bg-[#0d0e12]/85 hover:bg-[#161820] text-slate-200 hover:text-amber-200 px-3.5 py-2.5 rounded-xl backdrop-blur-xl border border-white/[0.08] hover:border-amber-400/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.7)] font-mono text-xs transition-all duration-200 group"
        >
          <Compass className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
          <span className="hidden sm:inline">GLOBAL ORBIT</span>
        </button>

        <button
          onClick={toggleFullscreen}
          onMouseEnter={playHover}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          className="flex items-center gap-2 bg-[#0d0e12]/85 hover:bg-[#161820] text-slate-200 hover:text-amber-200 px-3.5 py-2.5 rounded-xl backdrop-blur-xl border border-white/[0.08] hover:border-amber-400/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.7)] font-mono text-xs transition-all duration-200"
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-amber-400" />
          ) : (
            <Maximize2 className="w-4 h-4 text-amber-400" />
          )}
          <span className="hidden sm:inline">{isFullscreen ? 'EXIT FULL' : 'FULLSCREEN'}</span>
        </button>
      </div>

      {/* Floating 360° Orbit & 3D Tilt Dynamics Dock (Top Left) */}
      {selectedFeature && (
        <div className="absolute top-20 left-6 z-30 flex flex-col gap-2.5 max-w-xs bg-[#0c0d12]/90 backdrop-blur-2xl border border-white/[0.08] p-3.5 rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.85)] font-mono text-xs animate-in slide-in-from-left duration-200 pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] uppercase tracking-wider">
              <RotateCw className="w-3.5 h-3.5" />
              <span>360° CAMERA DYNAMICS</span>
            </div>
            <span className="text-[10px] text-amber-300/80 font-bold">{orbitHeading}° HDG</span>
          </div>

          {/* Primary Action: Launch 360 Photosphere */}
          <button
            onClick={() => {
              playSelect();
              setActive360Panorama(selectedFeature);
            }}
            onMouseEnter={playHover}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-[11px] shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all active:scale-95"
          >
            <Eye className="w-4 h-4" />
            <span>ENTER 360° GROUND VIEW</span>
          </button>

          {/* 360 Orbit Toggle Button */}
          <button
            onClick={() => {
              playSelect();
              setIsOrbiting((prev) => !prev);
            }}
            onMouseEnter={playHover}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-[11px] font-bold transition-all ${
              isOrbiting
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-[0_0_16px_rgba(245,158,11,0.25)]'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border-white/[0.08]'
            }`}
          >
            {isOrbiting ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isOrbiting ? 'PAUSE 360° ORBIT' : 'AUTO 360° 3D ORBIT'}</span>
          </button>

          {/* 3D Tilt Selector (Never Flat!) */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>3D PERSPECTIVE TILT:</span>
              <span className="text-amber-300 font-bold">{tiltAngle}°</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleSetTilt(80)}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold border transition-all ${
                  tiltAngle === 80
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-white/[0.03] text-slate-300 border-white/[0.06] hover:bg-white/[0.08]'
                }`}
                title="Ground Level 3D (Maximum Elevation Relief)"
              >
                80° GROUND
              </button>
              <button
                onClick={() => handleSetTilt(65)}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold border transition-all ${
                  tiltAngle === 65
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-white/[0.03] text-slate-300 border-white/[0.06] hover:bg-white/[0.08]'
                }`}
                title="Oblique 3D (Cinematic Angle)"
              >
                65° OBLIQUE
              </button>
              <button
                onClick={() => handleSetTilt(45)}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold border transition-all ${
                  tiltAngle === 45
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-white/[0.03] text-slate-300 border-white/[0.06] hover:bg-white/[0.08]'
                }`}
                title="Overhead 3D Angle"
              >
                45° AERIAL
              </button>
            </div>
          </div>

          {/* 360 Cardinal Direction Compass Buttons */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[10px] text-slate-400">CARDINAL 360° HEADING:</div>
            <div className="grid grid-cols-4 gap-1">
              {[
                { label: 'N 0°', val: 0 },
                { label: 'E 90°', val: 90 },
                { label: 'S 180°', val: 180 },
                { label: 'W 270°', val: 270 },
              ].map((c) => (
                <button
                  key={c.val}
                  onClick={() => handleSetHeading(c.val)}
                  className={`py-1 rounded-lg text-[10px] border transition-all ${
                    orbitHeading === c.val
                      ? 'bg-amber-400/20 text-amber-200 border-amber-400/40 font-bold'
                      : 'bg-white/[0.02] text-slate-400 border-white/[0.04] hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Geographic Feature Inspector Card (when feature is active) */}
      <GeographicInspector
        feature={selectedFeature}
        onClose={() => setSelectedFeature(null)}
        onOpen360={() => {
          if (selectedFeature) {
            setActive360Panorama(selectedFeature);
          }
        }}
        onSelectViewpoint={(vp) => {
          setActiveViewpoint(vp);
          setIsLoading(true);
        }}
      />

      {/* Bottom Geographical Teleporters & Category Discovery Ribbon */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-6xl px-4 pointer-events-auto">
        <div className="bg-[#0c0d12]/90 backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-[0_16px_50px_0_rgba(0,0,0,0.85)] p-3.5 transition-all duration-300">
          {/* Header Bar with Category Tabs and Search */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 mb-2.5 border-b border-white/[0.06] px-1">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none font-mono text-xs">
              <button
                onClick={() => {
                  setActiveCategory('wonders7');
                  playSelect();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeCategory === 'wonders7'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <Landmark className="w-3.5 h-3.5" />
                <span>7 WONDERS</span>
              </button>

              <button
                onClick={() => {
                  setActiveCategory('mountain');
                  playSelect();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeCategory === 'mountain'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <Mountain className="w-3.5 h-3.5" />
                <span>MOUNTAINS</span>
              </button>

              <button
                onClick={() => {
                  setActiveCategory('volcano');
                  playSelect();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeCategory === 'volcano'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>VOLCANOES</span>
              </button>

              <button
                onClick={() => {
                  setActiveCategory('river');
                  playSelect();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeCategory === 'river'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <Waves className="w-3.5 h-3.5" />
                <span>RIVERS & FALLS</span>
              </button>

              <button
                onClick={() => {
                  setActiveCategory('wonder');
                  playSelect();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeCategory === 'wonder'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>GEOLOGIC WONDERS</span>
              </button>

              <button
                onClick={() => {
                  setActiveCategory('all');
                  playSelect();
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeCategory === 'all'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                ALL
              </button>
            </div>

            {/* Search Input & Collapse Toggle */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by name, country..."
                  className="bg-white/[0.04] border border-white/[0.08] rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 w-44 md:w-56"
                />
              </div>

              <button
                onClick={() => {
                  setIsRibbonOpen(!isRibbonOpen);
                  playSelect();
                }}
                className="text-slate-400 hover:text-white text-xs font-mono p-1.5 rounded hover:bg-white/[0.06] transition-colors"
                title={isRibbonOpen ? 'Collapse list' : 'Expand list'}
              >
                {isRibbonOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Feature Cards Ribbon with Real Photography Thumbnails & Direct 360 Buttons */}
          {isRibbonOpen && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin">
              {filteredFeatures.length === 0 ? (
                <div className="text-xs font-mono text-slate-400 py-3 px-2">
                  No features matching current filters.
                </div>
              ) : (
                filteredFeatures.map((feat) => {
                  const isSelected = selectedFeature?.id === feat.id;
                  return (
                    <div
                      key={feat.id}
                      className={`flex-shrink-0 flex items-center gap-2.5 p-2 rounded-xl font-mono text-xs transition-all duration-200 border text-left group relative ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-400/60 shadow-[0_0_24px_rgba(245,158,11,0.2)]'
                          : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.06] hover:border-amber-400/30'
                      }`}
                    >
                      {/* Photo Thumbnail (Click to Fly To on 3D Globe) */}
                      <button
                        onClick={() => handleSelectFeature(feat)}
                        onMouseEnter={playHover}
                        className="flex items-center gap-3 text-left focus:outline-none"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 relative">
                          <img
                            src={feat.imageUrl}
                            alt={feat.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        </div>

                        {/* Text info */}
                        <div className="min-w-0 max-w-[130px] pr-1">
                          <div
                            className={`font-bold text-[12px] leading-tight truncate ${
                              isSelected ? 'text-amber-200' : 'text-slate-100 group-hover:text-white'
                            }`}
                          >
                            {feat.name}
                          </div>
                          <div className="text-[10px] text-slate-400 leading-tight truncate mt-0.5">
                            {feat.country}
                          </div>
                          <div className="text-[9px] text-amber-300/70 font-semibold leading-tight truncate mt-0.5">
                            {feat.categoryLabel}
                          </div>
                        </div>
                      </button>

                      {/* Direct 360 View Action Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playSelect();
                          setSelectedFeature(feat);
                          setActive360Panorama(feat);
                        }}
                        onMouseEnter={playHover}
                        title={`Open 360° Photosphere of ${feat.name}`}
                        className="p-2 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-400/30 hover:border-amber-400 transition-all flex flex-col items-center justify-center gap-0.5 self-stretch"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-bold">360°</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
