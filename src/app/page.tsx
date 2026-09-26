'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { NavigationBar } from '@/components/hud/NavigationBar';
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
        <div className="text-[10px] text-slate-500 uppercase">
          SUB-METER IMAGERY • 3D ELEVATION TERRAIN • RIVERS, MOUNTAINS & VOLCANOES
        </div>
      </div>
    ),
  }
);

export default function Home() {
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
      {/* 100% Full-DOM 3D Earth Globe with Deep Satellite Zoom & 3D Elevation */}
      <SatelliteGlobe />

      {/* Spatial HUD: Top Navigation Bar */}
      <NavigationBar onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Cmd+K Omnibox Search Palette */}
      <Omnibox isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </main>
  );
}
