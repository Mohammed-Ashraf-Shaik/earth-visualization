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
  Landmark,
  MapPin,
  Eye,
  Compass,
  CloudSun,
  Wind,
  Copy,
  Check,
} from 'lucide-react';

interface GeographicInspectorProps {
  feature: GeographicFeature | null;
  onClose: () => void;
  onSelectViewpoint: (viewpoint: string) => void;
  onOpen360?: () => void;
}

export function GeographicInspector({
  feature,
  onClose,
  onSelectViewpoint,
  onOpen360,
}: GeographicInspectorProps) {
  const { playHover, playSelect, playFlyTo } = useAudio();
  const [copied, setCopied] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [weather, setWeather] = useState<{
    tempC?: number;
    windSpeedKph?: number;
    weatherCode?: number;
    loading: boolean;
  }>({ loading: true });

  useEffect(() => {
    if (!feature) return;

    setImgLoaded(false);
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

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'wonders7':
        return {
          icon: <Landmark className="w-4 h-4 text-amber-300" />,
          badgeBg: 'bg-amber-500/15 border-amber-400/30 text-amber-200',
          accentText: 'text-amber-300',
        };
      case 'volcano':
        return {
          icon: <Flame className="w-4 h-4 text-rose-400" />,
          badgeBg: 'bg-rose-500/15 border-rose-400/30 text-rose-200',
          accentText: 'text-rose-400',
        };
      case 'mountain':
        return {
          icon: <Mountain className="w-4 h-4 text-slate-200" />,
          badgeBg: 'bg-slate-200/15 border-slate-300/30 text-slate-100',
          accentText: 'text-slate-200',
        };
      case 'river':
        return {
          icon: <Waves className="w-4 h-4 text-emerald-400" />,
          badgeBg: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-200',
          accentText: 'text-emerald-400',
        };
      default:
        return {
          icon: <Sparkles className="w-4 h-4 text-amber-300" />,
          badgeBg: 'bg-amber-500/15 border-amber-400/30 text-amber-200',
          accentText: 'text-amber-300',
        };
    }
  };

  const theme = getCategoryTheme(feature.category);

  return (
    <aside className="fixed top-20 right-6 z-40 w-full max-w-sm bg-[#0d0e12]/90 backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 pointer-events-auto">
      {/* Real High-Resolution Photographic Hero Header */}
      <div className="relative w-full h-48 bg-slate-900 overflow-hidden group">
        <img
          src={feature.imageUrl}
          alt={feature.name}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {/* Editorial Vignette & Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e12] via-[#0d0e12]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0e12]/60 via-transparent to-transparent" />

        {/* Close Button */}
        <button
          onClick={() => {
            playSelect();
            onClose();
          }}
          onMouseEnter={playHover}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white/80 hover:text-white border border-white/10 backdrop-blur-md transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Category Pill Tag on Image */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-mono tracking-wider uppercase text-amber-200">
          {theme.icon}
          <span>{feature.categoryLabel}</span>
        </div>

        {/* Title Overlay at bottom of photo */}
        <div className="absolute bottom-3 left-4 right-4">
          <h2 className="text-lg font-bold text-white tracking-tight leading-snug drop-shadow-md">
            {feature.name}
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-amber-100/80 font-mono mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate">{feature.country}</span>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 space-y-3 font-mono text-xs max-h-[58vh] overflow-y-auto scrollbar-thin">
        {/* Prominent 360 Immersive View Action Button */}
        {onOpen360 && (
          <button
            onClick={() => {
              playSelect();
              onOpen360();
            }}
            onMouseEnter={playHover}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs shadow-[0_0_24px_rgba(245,158,11,0.4)] transition-all active:scale-[0.98] group"
          >
            <Eye className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
            <span>ENTER 360° IMMERSIVE VIEW</span>
          </button>
        )}

        {/* Status / Heritage Banner */}
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] flex items-center justify-between">
          <span className="font-semibold leading-tight">{feature.statusOrType}</span>
        </div>

        {/* Live Weather Widget */}
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <CloudSun className="w-3.5 h-3.5 text-amber-400" />
              <span>LIVE LOCAL CLIMATE</span>
            </span>
            <span className="text-amber-400 text-[9px] uppercase tracking-wider font-semibold">
              OPEN-METEO
            </span>
          </div>

          {weather.loading ? (
            <div className="text-[10px] text-slate-400 animate-pulse pt-1">
              Synchronizing atmospheric sensors...
            </div>
          ) : (
            <div className="flex items-baseline justify-between pt-1">
              <div className="text-xl font-bold text-white tracking-tight">
                {weather.tempC !== undefined ? `${weather.tempC}°C` : '--'}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-amber-300" />
                <span>{weather.windSpeedKph ?? '--'} km/h wind</span>
              </div>
            </div>
          )}
        </div>

        {/* Editorial Description */}
        <p className="text-[11px] font-sans text-slate-300 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
          {feature.description}
        </p>

        {/* Fast Facts Registry */}
        <div className="space-y-1.5 rounded-xl bg-white/[0.02] p-3 border border-white/[0.06] text-[11px]">
          <div className="text-[10px] text-amber-300/80 pb-0.5 font-bold tracking-wider uppercase">
            GEOLOGICAL & HISTORICAL DOSSIER
          </div>
          {feature.facts.map((fact, idx) => (
            <div
              key={idx}
              className="flex justify-between items-baseline py-1 border-b border-white/[0.04] last:border-0"
            >
              <span className="text-slate-400">{fact.label}:</span>
              <span className="text-slate-100 font-semibold text-right max-w-[190px] truncate">
                {fact.value}
              </span>
            </div>
          ))}
        </div>

        {/* 3D Camera Angles */}
        <div className="pt-1 space-y-2">
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            3D PERSPECTIVE (RELIEF ANGLE)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                playSelect();
                playFlyTo();
                onSelectViewpoint(feature.viewpointCloseUp);
              }}
              onMouseEnter={playHover}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 hover:text-white transition-all text-[11px] font-bold shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>3D GROUND (80° TILT)</span>
            </button>

            <button
              onClick={() => {
                playSelect();
                playFlyTo();
                onSelectViewpoint(feature.viewpointOverview);
              }}
              onMouseEnter={playHover}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-200 hover:text-white transition-all text-[11px] font-medium"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>3D AERIAL (55° TILT)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="p-3 border-t border-white/[0.06] bg-black/40 flex items-center justify-between text-[11px] font-mono">
        <span className="text-slate-400">
          GPS: {feature.lat.toFixed(4)}°, {feature.lng.toFixed(4)}°
        </span>
        <button
          onClick={handleCopyCoords}
          className="flex items-center gap-1 text-amber-300 hover:text-amber-200 transition-colors font-semibold"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'COPIED' : 'COPY GPS'}</span>
        </button>
      </div>
    </aside>
  );
}
