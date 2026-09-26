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
  Navigation,
  MapPin,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { GEOGRAPHIC_CATALOG, GeographicFeature, GeoCategory } from '@/data/geographicCatalog';
import { GeographicInspector } from '@/components/hud/GeographicInspector';
import { useAudio } from '@/hooks/useAudioSynth';

export function SatelliteGlobe() {
  const baseWebsceneId = '6682f70b89c4483f88e8df839a011c1e';
  const [activeViewpoint, setActiveViewpoint] = useState<string>('');
  const [selectedFeature, setSelectedFeature] = useState<GeographicFeature | null>(null);
  const [activeCategory, setActiveCategory] = useState<GeoCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRibbonOpen, setIsRibbonOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

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
    setActiveViewpoint(feat.viewpointCloseUp);
    setIsLoading(true);
  };

  const handleResetView = () => {
    playSelect();
    setSelectedFeature(null);
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'volcano':
        return <Flame className="w-3.5 h-3.5 text-amber-400" />;
      case 'mountain':
        return <Mountain className="w-3.5 h-3.5 text-cyan-400" />;
      case 'river':
        return <Waves className="w-3.5 h-3.5 text-sky-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

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
            STREAMING 3D SATELLITE TILES & ELEVATION...
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            WORLD IMAGERY HYBRID • GLOBAL 3D TERRAIN MESH
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
        className="w-full h-full border-0 absolute inset-0 block bg-[#020408]"
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
          className="flex items-center gap-2 bg-slate-950/80 hover:bg-slate-900 text-slate-200 hover:text-white px-3.5 py-2 rounded-xl backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.65)] font-mono text-xs transition-all duration-200 group"
        >
          <Compass className="w-4 h-4 text-cyan-400 group-hover:rotate-45 transition-transform" />
          <span className="hidden sm:inline">GLOBAL ORBIT</span>
        </button>

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

      {/* Geographic Feature Inspector Card (when feature is active) */}
      <GeographicInspector
        feature={selectedFeature}
        onClose={() => setSelectedFeature(null)}
        onSelectViewpoint={(vp) => {
          setActiveViewpoint(vp);
          setIsLoading(true);
        }}
      />

      {/* Bottom Geographical Teleporters & Category Discovery Ribbon */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-5xl px-4 pointer-events-auto">
        <div className="bg-slate-950/85 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_12px_40px_0_rgba(0,0,0,0.85)] p-3 transition-all duration-300">
          {/* Header Bar with Category Tabs and Search */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 mb-2 border-b border-white/10 px-1">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none font-mono text-xs">
              <button
                onClick={() => {
                  setActiveCategory('all');
                  playSelect();
                }}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeCategory === 'all'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                ALL
              </button>
              <button
                onClick={() => {
                  setActiveCategory('mountain');
                  playSelect();
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                  activeCategory === 'mountain'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Mountain className="w-3 h-3" />
                <span>MOUNTAINS</span>
              </button>
              <button
                onClick={() => {
                  setActiveCategory('volcano');
                  playSelect();
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                  activeCategory === 'volcano'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>VOLCANOES</span>
              </button>
              <button
                onClick={() => {
                  setActiveCategory('river');
                  playSelect();
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                  activeCategory === 'river'
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Waves className="w-3 h-3" />
                <span>RIVERS & FALLS</span>
              </button>
              <button
                onClick={() => {
                  setActiveCategory('wonder');
                  playSelect();
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                  activeCategory === 'wonder'
                    ? 'bg-purple-500 text-slate-950 font-bold'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>GEOLOGIC WONDERS</span>
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
                  placeholder="Filter mountains, rivers, volcanoes..."
                  className="bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 w-44 md:w-56"
                />
              </div>

              <button
                onClick={() => {
                  setIsRibbonOpen(!isRibbonOpen);
                  playSelect();
                }}
                className="text-slate-400 hover:text-white text-xs font-mono p-1 rounded hover:bg-white/5 transition-colors"
                title={isRibbonOpen ? 'Collapse list' : 'Expand list'}
              >
                {isRibbonOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Feature Teleporter Cards Ribbon */}
          {isRibbonOpen && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {filteredFeatures.length === 0 ? (
                <div className="text-xs font-mono text-slate-500 py-3 px-2">
                  No features matching current filters.
                </div>
              ) : (
                filteredFeatures.map((feat) => {
                  const isSelected = selectedFeature?.id === feat.id;
                  return (
                    <button
                      key={feat.id}
                      onClick={() => handleSelectFeature(feat)}
                      onMouseEnter={playHover}
                      className={`flex-shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-xl font-mono text-xs transition-all duration-200 border text-left ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                          : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/10 hover:border-cyan-500/40 hover:text-white'
                      }`}
                    >
                      <div className="p-1 rounded-lg bg-white/5">
                        {getCategoryIcon(feat.category)}
                      </div>
                      <div className="min-w-0 max-w-[150px]">
                        <div className="font-bold text-[11px] leading-tight truncate">
                          {feat.name}
                        </div>
                        <div className="text-[9px] text-slate-400 leading-tight truncate">
                          {feat.country}
                        </div>
                      </div>
                    </button>
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
