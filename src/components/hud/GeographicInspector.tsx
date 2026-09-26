'use client';

import React, { useState, useEffect } from 'react';
import { GeographicFeature } from '@/data/geographicCatalog';
import { useAudio } from '@/hooks/useAudioSynth';
import {
  X,
  Mountain,
  Flame,
  Waves,
  Sparkles,
  MapPin,
  Eye,
  Compass,
  CloudSun,
  Wind,
  Droplets,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

interface GeographicInspectorProps {
  feature: GeographicFeature | null;
  onClose: () => void;
  onSelectViewpoint: (viewpoint: string) => void;
}

export function GeographicInspector({
  feature,
  onClose,
  onSelectViewpoint,
}: GeographicInspectorProps) {
  const { playHover, playSelect, playFlyTo } = useAudio();
  const [copied, setCopied] = useState(false);
  const [weather, setWeather] = useState<{
    tempC?: number;
    windSpeedKph?: number;
    weatherCode?: number;
    loading: boolean;
  }>({ loading: true });

  // Fetch live weather from Open-Meteo for the feature coordinates
  useEffect(() => {
    if (!feature) return;

    setWeather({ loading: true });
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${feature.lat}&longitude=${feature.lng}&current=temperature_2m,wind_speed_10m,weather_code`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.current) {
          setWeather({
            tempC: Number(data.current.temperature_2m?.toFixed(1) ?? 0),
            windSpeedKph: Number(data.current.wind_speed_10m?.toFixed(1) ?? 0),
            weatherCode: data.current.weather_code,
            loading: false,
          });
        }
      })
      .catch(() => setWeather({ loading: false }));
  }, [feature]);

  if (!feature) return null;

  const handleCopyCoords = () => {
    playSelect();
    const str = `${feature.lat.toFixed(4)}, ${feature.lng.toFixed(4)}`;
    navigator.clipboard.writeText(str);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'volcano':
        return <Flame className="w-5 h-5 text-amber-400" />;
      case 'mountain':
        return <Mountain className="w-5 h-5 text-cyan-400" />;
      case 'river':
        return <Waves className="w-5 h-5 text-sky-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <aside className="fixed top-20 right-6 z-40 w-full max-w-sm bg-slate-950/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 pointer-events-auto">
      {/* Top Header */}
      <div className="flex items-start justify-between p-4 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/5 border border-white/10">
            {getCategoryIcon(feature.category)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 uppercase">
                {feature.categoryLabel}
              </span>
            </div>
            <h2 className="text-sm font-extrabold text-white tracking-wide uppercase mt-1">
              {feature.name}
            </h2>
            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 mt-0.5">
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>{feature.country}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            playSelect();
            onClose();
          }}
          onMouseEnter={playHover}
          className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="p-4 space-y-3 font-mono text-xs max-h-[70vh] overflow-y-auto scrollbar-thin">
        {/* Status or Type Banner */}
        <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 text-[11px] flex items-center justify-between">
          <span className="font-semibold">{feature.statusOrType}</span>
        </div>

        {/* Live Weather Widget */}
        <div className="p-3 rounded-xl bg-slate-900/70 border border-white/5 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <CloudSun className="w-3.5 h-3.5 text-amber-400" />
              <span>LIVE SUMMIT WEATHER</span>
            </span>
            <span className="text-amber-400 text-[9px] uppercase">OPEN-METEO</span>
          </div>

          {weather.loading ? (
            <div className="text-[10px] text-slate-500 animate-pulse">Querying satellite telemetry...</div>
          ) : (
            <div className="flex items-center justify-between pt-1">
              <div className="text-xl font-extrabold text-white">
                {weather.tempC !== undefined ? `${weather.tempC}°C` : '--'}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                <span>{weather.windSpeedKph ?? '--'} km/h wind</span>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-[11px] font-sans text-slate-300 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/5">
          {feature.description}
        </p>

        {/* Fast Geological Facts Table */}
        <div className="space-y-1 rounded-xl bg-slate-900/60 p-3 border border-white/5 text-[11px]">
          <div className="text-[10px] text-slate-400 pb-1 font-bold tracking-wider">
            GEOLOGICAL TELEMETRY
          </div>
          {feature.facts.map((fact, idx) => (
            <div key={idx} className="flex justify-between py-0.5 border-b border-white/[0.03]">
              <span className="text-slate-400">{fact.label}:</span>
              <span className="text-cyan-200 font-semibold text-right max-w-[170px] truncate">
                {fact.value}
              </span>
            </div>
          ))}
        </div>

        {/* 3D Camera Angles */}
        <div className="pt-1 space-y-2">
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            3D CAMERA VIEWPOINTS
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                playSelect();
                playFlyTo();
                onSelectViewpoint(feature.viewpointCloseUp);
              }}
              onMouseEnter={playHover}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 hover:text-white transition-all text-[11px] font-semibold"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>3D TILT CLOSE-UP</span>
            </button>

            <button
              onClick={() => {
                playSelect();
                playFlyTo();
                onSelectViewpoint(feature.viewpointOverview);
              }}
              onMouseEnter={playHover}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all text-[11px]"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>AERIAL OVERVIEW</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="p-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-[11px] font-mono">
        <span className="text-slate-400">
          {feature.lat.toFixed(2)}°, {feature.lng.toFixed(2)}°
        </span>
        <button
          onClick={handleCopyCoords}
          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'COPIED' : 'COPY COORDS'}</span>
        </button>
      </div>
    </aside>
  );
}
