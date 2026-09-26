'use client';

import React, { useState, useEffect } from 'react';
import { useLayerStore } from '@/stores/useLayerStore';
import { useAudio } from '@/hooks/useAudioSynth';
import { Radio, Search, Volume2, VolumeX, Globe2, Landmark, Mountain, Flame } from 'lucide-react';

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
        {/* Left: Luxury Editorial Branding */}
        <div className="flex items-center gap-3 bg-[#0d0e12]/85 backdrop-blur-xl border border-white/[0.08] px-4 py-2.5 rounded-full shadow-[0_8px_32px_0_rgba(0,0,0,0.7)]">
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '35s' }} />
            <span className="font-extrabold tracking-widest text-sm text-white uppercase bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400 bg-clip-text text-transparent">
              TERRA ATLAS
            </span>
          </div>

          <div className="h-3 w-[1px] bg-white/15" />

          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-mono text-emerald-400/90 font-medium hidden sm:inline">
              SUB-METER 3D TERRAIN ONLINE
            </span>
          </div>
        </div>

        {/* Center: Live UTC Atomic Clock & Heritage Badges */}
        <div className="hidden lg:flex items-center gap-4 bg-[#0d0e12]/85 backdrop-blur-xl border border-white/[0.08] px-5 py-2.5 rounded-full shadow-[0_8px_32px_0_rgba(0,0,0,0.7)] font-mono text-xs tabular-nums text-slate-300">
          <div className="flex items-center gap-2 text-amber-300 font-semibold">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{utcTime || 'SYNCHRONIZING UTC...'}</span>
          </div>

          <div className="h-3 w-[1px] bg-white/15" />

          <div className="flex items-center gap-3 text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5 text-amber-200">
              <Landmark className="w-3.5 h-3.5 text-amber-400" /> 7 Wonders
            </span>
            <span className="text-white/20">•</span>
            <span className="flex items-center gap-1.5 text-slate-200">
              <Mountain className="w-3.5 h-3.5 text-slate-300" /> Mountains
            </span>
            <span className="text-white/20">•</span>
            <span className="flex items-center gap-1.5 text-rose-200">
              <Flame className="w-3.5 h-3.5 text-rose-400" /> Volcanoes
            </span>
          </div>
        </div>

        {/* Right: Search & Audio Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playSelect();
              onOpenSearch();
            }}
            onMouseEnter={playHover}
            className="flex items-center gap-2.5 bg-[#0d0e12]/85 hover:bg-[#161820] text-slate-200 hover:text-white backdrop-blur-xl border border-white/[0.08] hover:border-amber-400/40 px-4 py-2.5 rounded-full transition-all duration-200 shadow-[0_8px_32px_0_rgba(0,0,0,0.7)] group font-mono text-xs"
          >
            <Search className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline">SEARCH ATLAS</span>
            <kbd className="hidden sm:inline-flex items-center text-[10px] font-mono bg-white/10 text-amber-200 px-1.5 py-0.5 rounded border border-white/10">
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
            className="p-2.5 bg-[#0d0e12]/85 hover:bg-[#161820] text-slate-300 hover:text-amber-300 backdrop-blur-xl border border-white/[0.08] hover:border-amber-400/40 rounded-full transition-all duration-200 shadow-[0_8px_32px_0_rgba(0,0,0,0.7)]"
          >
            {isAudioEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
