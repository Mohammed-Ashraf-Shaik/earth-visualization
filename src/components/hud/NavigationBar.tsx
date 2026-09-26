'use client';

import React, { useState, useEffect } from 'react';
import { useGlobeStore } from '@/stores/useGlobeStore';
import { useLayerStore } from '@/stores/useLayerStore';
import { useAudio } from '@/hooks/useAudioSynth';
import { Radio, Search, Volume2, VolumeX, Compass, Globe2 } from 'lucide-react';

interface NavigationBarProps {
  onOpenSearch: () => void;
}

export function NavigationBar({ onOpenSearch }: NavigationBarProps) {
  const [utcTime, setUtcTime] = useState<string>('');
  const cursorLat = useGlobeStore((s) => s.cursorLat);
  const cursorLng = useGlobeStore((s) => s.cursorLng);
  const cameraAltitudeKm = useGlobeStore((s) => s.cameraAltitudeKm);
  const fps = useGlobeStore((s) => s.fps);

  const isAudioEnabled = useLayerStore((s) => s.layers.audio);
  const toggleLayer = useLayerStore((s) => s.toggleLayer);
  const { playHover, playSelect } = useAudio();

  // Update UTC clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const year = now.getUTCFullYear();
      const month = pad(now.getUTCMonth() + 1);
      const day = pad(now.getUTCDate());
      const hours = pad(now.getUTCHours());
      const mins = pad(now.getUTCMinutes());
      const secs = pad(now.getUTCSeconds());
      setUtcTime(`${year}-${month}-${day} ${hours}:${mins}:${secs} UTC`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatLat = (lat: number) => {
    const dir = lat >= 0 ? 'N' : 'S';
    return `${Math.abs(lat).toFixed(4)}° ${dir}`;
  };

  const formatLng = (lng: number) => {
    const dir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lng).toFixed(4)}° ${dir}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 pointer-events-none p-4 md:p-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 pointer-events-auto">
        {/* Left: Branding & Operational Status */}
        <div className="flex items-center gap-3 bg-slate-950/70 backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-full shadow-[0_8px_32px_0_rgba(0,0,0,0.65)]">
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: '30s' }} />
            <span className="font-extrabold tracking-widest text-sm text-white uppercase bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
              TERRA
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
              v1.0
            </span>
          </div>

          <div className="h-3 w-[1px] bg-white/20" />

          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-mono tracking-wider text-emerald-400 hidden sm:inline-block">
              SYSTEM OPERATIONAL: LIVE
            </span>
          </div>
        </div>

        {/* Center: Live UTC Atomic Clock & Orbital Telemetry */}
        <div className="hidden lg:flex items-center gap-5 bg-slate-950/70 backdrop-blur-xl border border-white/10 px-5 py-2.5 rounded-full shadow-[0_8px_32px_0_rgba(0,0,0,0.65)] font-mono text-xs tabular-nums text-slate-300">
          <div className="flex items-center gap-2 text-cyan-400">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>{utcTime || 'SYNCHRONIZING UTC...'}</span>
          </div>

          <div className="h-3 w-[1px] bg-white/20" />

          <div className="flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            <span>
              LAT: <span className="text-cyan-300">{formatLat(cursorLat)}</span> | LNG:{' '}
              <span className="text-cyan-300">{formatLng(cursorLng)}</span>
            </span>
          </div>

          <div className="h-3 w-[1px] bg-white/20" />

          <div>
            ALT: <span className="text-cyan-300">{Math.round(cameraAltitudeKm).toLocaleString()} KM</span>
          </div>

          <div className="h-3 w-[1px] bg-white/20" />

          <div>
            FPS: <span className="text-emerald-400">{Math.round(fps)}</span>
          </div>
        </div>

        {/* Right: Omnibox Trigger & Sound Controller */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playSelect();
              onOpenSearch();
            }}
            onMouseEnter={playHover}
            className="flex items-center gap-2.5 bg-slate-950/70 hover:bg-slate-900/90 text-slate-300 hover:text-white backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 px-4 py-2.5 rounded-full transition-all duration-200 shadow-[0_8px_32px_0_rgba(0,0,0,0.65)] group"
          >
            <Search className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-mono hidden md:inline">SEARCH ATLAS</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono bg-white/10 text-cyan-300 px-1.5 py-0.5 rounded border border-white/10">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>

          <button
            onClick={() => {
              toggleLayer('audio');
              playSelect();
            }}
            onMouseEnter={playHover}
            title={isAudioEnabled ? 'Mute Procedural Audio' : 'Enable Procedural Audio'}
            className="p-2.5 bg-slate-950/70 hover:bg-slate-900/90 text-slate-300 hover:text-cyan-400 backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 rounded-full transition-all duration-200 shadow-[0_8px_32px_0_rgba(0,0,0,0.65)]"
          >
            {isAudioEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
