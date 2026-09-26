'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { NavigationBar } from '@/components/hud/NavigationBar';
import { TelemetryReticle } from '@/components/hud/TelemetryReticle';
import { LayerControl } from '@/components/hud/LayerControl';
import { CountrySheet } from '@/components/hud/CountrySheet';
import { Omnibox } from '@/components/hud/Omnibox';

// Dynamic import for Full-DOM 3D Satellite Globe (Deep Zoom & 3D Terrain, like earth3dmap.com)
const SatelliteGlobe = dynamic(
  () => import('@/components/canvas/SatelliteGlobe').then((mod) => mod.SatelliteGlobe),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-[#020408] flex flex-col items-center justify-center font-mono text-cyan-400 gap-4">
        <div className="w-12 h-12 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        <div className="text-xs tracking-widest uppercase animate-pulse">
          INITIALIZING 3D SATELLITE GLOBE ENGINE...
        </div>
      </div>
    ),
  }
);

// Dynamic import for WebGL Telemetry Scene (USGS Earthquakes & ISS tracker)
const TelemetryScene = dynamic(
  () => import('@/components/canvas/Scene').then((mod) => mod.Scene),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-[#020408] flex flex-col items-center justify-center font-mono text-cyan-400 gap-4">
        <div className="w-12 h-12 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        <div className="text-xs tracking-widest uppercase animate-pulse">
          INITIALIZING PLANETARY TELEMETRY ENGINE...
        </div>
      </div>
    ),
  }
);

export default function Home() {
  const [activeMode, setActiveMode] = useState<'satellite' | 'telemetry'>('satellite');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global Cmd+K / Ctrl+K hotkey handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#020408] select-none">
      {/* Primary 3D Earth Viewport — 100% DOM Focused, Zero Ads, Zero Sidebars */}
      {activeMode === 'satellite' ? (
        <SatelliteGlobe />
      ) : (
        <>
          <TelemetryScene />
          {/* Tactical screen-space reticle and layer control in telemetry mode */}
          <TelemetryReticle />
          <LayerControl />
        </>
      )}

      {/* Spatial HUD: Top Navigation & Mode Switcher Bar */}
      <NavigationBar
        activeMode={activeMode}
        onModeChange={setActiveMode}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Slide-over Country Dossier Sheet */}
      <CountrySheet />

      {/* Cmd+K Omnibox Search Palette */}
      <Omnibox isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </main>
  );
}
