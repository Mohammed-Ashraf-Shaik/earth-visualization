'use client';

import React, { useState } from 'react';
import { useLayerStore } from '@/stores/useLayerStore';
import { useAudio } from '@/hooks/useAudioSynth';
import {
  Layers,
  Activity,
  Satellite,
  Globe,
  SunMoon,
  Sparkles,
  RotateCw,
  Wind,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export function LayerControl() {
  const [isExpanded, setIsExpanded] = useState(true);
  const layers = useLayerStore((s) => s.layers);
  const toggleLayer = useLayerStore((s) => s.toggleLayer);
  const { playHover, playSelect } = useAudio();

  const layerItems = [
    {
      key: 'atmosphere' as const,
      label: 'Atmosphere Limb Glow',
      icon: Wind,
      color: 'text-sky-400',
    },
    {
      key: 'seismic' as const,
      label: 'USGS Seismic Live Feed',
      icon: Activity,
      color: 'text-amber-400',
    },
    {
      key: 'satellites' as const,
      label: 'ISS Orbital Telemetry',
      icon: Satellite,
      color: 'text-cyan-400',
    },
    {
      key: 'boundaries' as const,
      label: 'Sovereign Vector Borders',
      icon: Globe,
      color: 'text-emerald-400',
    },
    {
      key: 'terminator' as const,
      label: 'Day / Night Solar Terminator',
      icon: SunMoon,
      color: 'text-yellow-400',
    },
    {
      key: 'bloom' as const,
      label: 'UnrealBloom Optics',
      icon: Sparkles,
      color: 'text-purple-400',
    },
    {
      key: 'autoRotate' as const,
      label: 'Planetary Auto-Orbit',
      icon: RotateCw,
      color: 'text-blue-400',
    },
  ];

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <div className="bg-slate-950/75 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.65)] overflow-hidden transition-all duration-300 w-72">
        {/* Header Accordion Bar */}
        <button
          onClick={() => {
            setIsExpanded(!isExpanded);
            playSelect();
          }}
          onMouseEnter={playHover}
          className="w-full flex items-center justify-between px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-xs font-bold text-white tracking-wider uppercase">
              DATA LAYERS & OPTICS
            </span>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Layer Switches */}
        {isExpanded && (
          <div className="p-3 space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
            {layerItems.map((item) => {
              const Icon = item.icon;
              const isActive = layers[item.key];

              return (
                <button
                  key={item.key}
                  onClick={() => {
                    toggleLayer(item.key);
                    playSelect();
                  }}
                  onMouseEnter={playHover}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all duration-150 ${
                    isActive
                      ? 'bg-cyan-500/10 border border-cyan-500/30 text-white'
                      : 'bg-white/[0.02] border border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-3.5 h-3.5 ${isActive ? item.color : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {/* Switch Pill */}
                  <div
                    className={`w-7 h-4 rounded-full transition-colors relative flex items-center px-0.5 ${
                      isActive ? 'bg-cyan-500' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full bg-white transition-transform ${
                        isActive ? 'translate-x-3' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
