'use client';

import React, { useState, useEffect } from 'react';
import { useLayerStore } from '@/stores/useLayerStore';
import { useAudio } from '@/hooks/useAudioSynth';
import { Radio, Search, Volume2, VolumeX, Globe2, Mountain, Flame, Waves } from 'lucide-react';

interface NavigationBarProps {
  onOpenSearch: () => void;
}

export function NavigationBar({ onOpenSearch }: NavigationBarProps) {
  const [utcTime, setUtcTime] = useState<string>('');

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

  return (
    <header className="fixed top-0 left-0 right-0 z-40 pointer-events-none p-4 md:p-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 pointer-events-auto">
        {/* Left: Branding & Operational Status */}
        <div className="flex items-center gap-3 bg-slate-950/80 backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-full shadow-[0_8px_32px_0_rgba(0,0,0,0.65)]">
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: '30s' }} />
            <span className="font-extrabold tracking-widest text-sm text-white uppercase bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
              TERRA 3D GLOBE
            </span>
          </div>

          <div className="h-3 w-[1px] bg-white/20" />

          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold hidden sm:inline">
              SUB-METER 3D TERRAIN LIVE
            </span>
          </div>
        </div>

        {/* Center: Live UTC Atomic Clock & Features Indicator */}
        <div className="hidden lg:flex items-center gap-4 bg-slate-950/80 backdrop-blur-xl border border-white/10 px-5 py-2.5 rounded-full shadow-[0_8px_32px_0_rgba(0,0,0,0.65)] font-mono text-xs tabular-nums text-slate-300">
          <div className="flex items-center gap-2 text-cyan-400">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>{utcTime || 'SYNCHRONIZING UTC...'}</span>
          </div>

          <div className="h-3 w-[1px] bg-white/20" />

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-cyan-300">
              <Mountain className="w-3.5 h-3.5 text-cyan-400" /> Mountains
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-amber-300">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> Volcanoes
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-sky-300">
              <Waves className="w-3.5 h-3.5 text-sky-400" /> Rivers & Canyons
            </span>
          </div>
        </div>

        {/* Right: Search & Sound Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playSelect();
              onOpenSearch();
            }}
            onMouseEnter={playHover}
            className="flex items-center gap-2 bg-slate-950/80 hover:bg-slate-900/90 text-slate-300 hover:text-white backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 px-4 py-2.5 rounded-full transition-all duration-200 shadow-[0_8px_32px_0_rgba(0,0,0,0.65)] group"
          >
            <Search className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-mono hidden md:inline">SEARCH ATLAS</span>
            <kbd className="hidden sm:inline-flex items-center text-[10px] font-mono bg-white/10 text-cyan-300 px-1.5 py-0.5 rounded border border-white/10">
              ⌘K
            </kbd>
          </button>

          <button
            onClick={() => {
              toggleLayer('audio');
              playSelect();
            }}
            onMouseEnter={playHover}
            title={isAudioEnabled ? 'Mute Procedural Audio' : 'Enable Procedural Audio'}
            className="p-2.5 bg-slate-950/80 hover:bg-slate-900/90 text-slate-300 hover:text-cyan-400 backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 rounded-full transition-all duration-200 shadow-[0_8px_32px_0_rgba(0,0,0,0.65)]"
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
