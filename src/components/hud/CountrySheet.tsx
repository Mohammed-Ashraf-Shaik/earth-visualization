'use client';

import React, { useState } from 'react';
import { useGlobeStore } from '@/stores/useGlobeStore';
import { useAudio } from '@/hooks/useAudioSynth';
import {
  X,
  Users,
  Maximize2,
  CloudSun,
  Mountain,
  Anchor,
  Compass,
  Copy,
  Check,
  RotateCw,
  Wind,
  Droplets,
  ExternalLink,
} from 'lucide-react';

export function CountrySheet() {
  const selectedCountry = useGlobeStore((s) => s.selectedCountry);
  const isDossierOpen = useGlobeStore((s) => s.isDossierOpen);
  const setIsDossierOpen = useGlobeStore((s) => s.setIsDossierOpen);
  const isOrbitLocked = useGlobeStore((s) => s.isOrbitLocked);
  const toggleOrbitLock = useGlobeStore((s) => s.toggleOrbitLock);

  const { playHover, playSelect } = useAudio();
  const [copied, setCopied] = useState(false);

  if (!isDossierOpen || !selectedCountry) return null;

  const density =
    selectedCountry.areaKm2 > 0
      ? Math.round(selectedCountry.population / selectedCountry.areaKm2)
      : 'N/A';

  const [lat, lng] = selectedCountry.coordinates;

  const handleCopyCoords = () => {
    playSelect();
    const str = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    navigator.clipboard.writeText(str);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getWeatherConditionName = (code: number) => {
    if (code === 0) return 'Clear Sky';
    if (code === 1 || code === 2) return 'Partly Cloudy';
    if (code === 3) return 'Overcast';
    if (code >= 45 && code <= 48) return 'Foggy';
    if (code >= 51 && code <= 67) return 'Rain / Drizzle';
    if (code >= 71 && code <= 77) return 'Snow Flurries';
    if (code >= 80 && code <= 82) return 'Rain Showers';
    if (code >= 95) return 'Thunderstorms';
    return 'Atmospheric Haze';
  };

  return (
    <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950/85 backdrop-blur-2xl border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.85)] flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          {selectedCountry.flagSvg ? (
            <img
              src={selectedCountry.flagSvg}
              alt={selectedCountry.name.common}
              className="w-8 h-6 object-cover rounded shadow-md border border-white/10"
            />
          ) : (
            <div className="w-8 h-6 bg-cyan-950 border border-cyan-500/30 rounded flex items-center justify-center font-mono text-[10px] text-cyan-400">
              {selectedCountry.cca3}
            </div>
          )}
          <div>
            <h2 className="text-base font-extrabold text-white tracking-wide uppercase">
              {selectedCountry.name.common}
            </h2>
            <p className="text-[11px] font-mono text-cyan-400 truncate max-w-[220px]">
              CAPITAL: {selectedCountry.capital.join(', ') || 'N/A'} • {selectedCountry.region}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            playSelect();
            setIsDossierOpen(false);
          }}
          onMouseEnter={playHover}
          className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Bento Metrics Grid */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 font-mono text-xs">
        {/* Metric 1: Demographics */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>POPULATION DEMOGRAPHICS</span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight tabular-nums">
            {selectedCountry.population.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>OFFICIAL NAME:</span>
            <span className="text-slate-200 truncate max-w-[200px]">
              {selectedCountry.name.official}
            </span>
          </div>
        </div>

        {/* Metric 2: Surface Area & Density */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Maximize2 className="w-4 h-4 text-emerald-400" />
            <span>TERRITORIAL GEOGRAPHY</span>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <div className="text-[10px] text-slate-400">SURFACE AREA</div>
              <div className="text-base font-bold text-emerald-300">
                {selectedCountry.areaKm2.toLocaleString()} km²
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">POPULATION DENSITY</div>
              <div className="text-base font-bold text-emerald-300">
                {density} /km²
              </div>
            </div>
          </div>
        </div>

        {/* Metric 3: Live Weather (Open-Meteo) */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <CloudSun className="w-4 h-4 text-amber-400" />
              <span>LIVE METEOROLOGY (OPEN-METEO)</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              REAL-TIME
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-white">
              {selectedCountry.weather.tempC}°C
            </div>
            <div className="text-xs text-amber-300 font-semibold">
              {getWeatherConditionName(selectedCountry.weather.conditionCode)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              <span>{selectedCountry.weather.windSpeedKph} km/h wind</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              <span>{selectedCountry.weather.humidity ?? 50}% humidity</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Elevation Extremes */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Mountain className="w-4 h-4 text-purple-400" />
            <span>ELEVATION EXTREMES</span>
          </div>
          <div className="space-y-1.5 pt-1 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">HIGHEST PEAK:</span>
              <span className="text-purple-300 font-semibold">
                {selectedCountry.elevationExtremes.highest.name} ({selectedCountry.elevationExtremes.highest.meters}m)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">LOWEST POINT:</span>
              <span className="text-purple-300 font-semibold">
                {selectedCountry.elevationExtremes.lowest.name} ({selectedCountry.elevationExtremes.lowest.meters}m)
              </span>
            </div>
          </div>
        </div>

        {/* Bordering Nations Tags */}
        {selectedCountry.borders && selectedCountry.borders.length > 0 && (
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
            <div className="text-[11px] text-slate-400">BORDERING NATIONS</div>
            <div className="flex flex-wrap gap-1.5">
              {selectedCountry.borders.map((b) => (
                <span
                  key={b}
                  className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-300 text-[10px]"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Controls Footer */}
      <div className="p-5 border-t border-white/10 bg-white/[0.02] flex items-center gap-3">
        <button
          onClick={() => {
            toggleOrbitLock();
            playSelect();
          }}
          onMouseEnter={playHover}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs transition-all duration-200 border ${
            isOrbitLocked
              ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.4)]'
              : 'bg-slate-900/80 hover:bg-slate-800 text-white border-white/10 hover:border-cyan-500/40'
          }`}
        >
          <RotateCw className={`w-3.5 h-3.5 ${isOrbitLocked ? 'animate-spin' : ''}`} />
          <span>{isOrbitLocked ? 'ORBIT LOCKED' : 'LOCK ORBIT'}</span>
        </button>

        <button
          onClick={handleCopyCoords}
          onMouseEnter={playHover}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 hover:border-cyan-500/40 transition-all duration-200"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'COPIED!' : 'COPY COORDS'}</span>
        </button>
      </div>
    </aside>
  );
}
