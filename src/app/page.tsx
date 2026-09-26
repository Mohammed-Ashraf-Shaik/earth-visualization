'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { NavigationBar } from '@/components/hud/NavigationBar';
import { TelemetryReticle } from '@/components/hud/TelemetryReticle';
import { LayerControl } from '@/components/hud/LayerControl';
import { CountrySheet } from '@/components/hud/CountrySheet';
import { Omnibox } from '@/components/hud/Omnibox';

// Dynamic import for WebGL Scene to disable SSR and guarantee clean canvas mount
const Scene = dynamic(() => import('@/components/canvas/Scene').then((mod) => mod.Scene), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-void flex flex-col items-center justify-center font-mono text-cyan-400 gap-4">
      <div className="w-12 h-12 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
      <div className="text-xs tracking-widest uppercase animate-pulse">
        INITIALIZING TERRA WEBGL ENGINE...
      </div>
    </div>
  ),
});

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
    <main className="relative w-screen h-screen overflow-hidden bg-void select-none">
      {/* 3D WebGL Canvas Layer */}
      <Scene />

      {/* Screen-space dynamic cursor crosshair & territorial badge */}
      <TelemetryReticle />

      {/* Spatial Telemetry HUD: Top Navigation Bar */}
      <NavigationBar onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Spatial Telemetry HUD: Floating Visual Layer Controller */}
      <LayerControl />

      {/* Slide-over Country Dossier Sheet */}
      <CountrySheet />

      {/* Cmd+K Omnibox Search Palette */}
      <Omnibox isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Subtle Aerospace CRT Optical Scanline Overlay */}
      <div className="pointer-events-none fixed inset-0 z-10 crt-overlay opacity-25" />
    </main>
  );
}
