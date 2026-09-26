'use client';

import React, { useEffect, useState } from 'react';
import { useGlobeStore } from '@/stores/useGlobeStore';

export function TelemetryReticle() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);
  const hoveredEntity = useGlobeStore((s) => s.hoveredEntity);
  const cursorLat = useGlobeStore((s) => s.cursorLat);
  const cursorLng = useGlobeStore((s) => s.cursorLng);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed pointer-events-none z-30 transition-transform duration-75 ease-out will-change-transform"
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
      }}
    >
      {/* Tactical Center Crosshair */}
      <div className="relative -top-3 -left-3 w-6 h-6">
        {/* Corner Brackets */}
        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-cyan-400" />
        <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-cyan-400" />
        <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-cyan-400" />
        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-cyan-400" />
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-cyan-400/80 rounded-full" />
      </div>

      {/* Floating HUD Badge when hovering sovereign territory or landmark */}
      {hoveredEntity && (
        <div className="absolute left-6 -top-3 min-w-[160px] bg-slate-950/85 backdrop-blur-xl border border-cyan-500/40 rounded-lg p-2.5 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1 mb-1.5">
            <span className="font-extrabold text-xs text-white uppercase tracking-wider truncate">
              {hoveredEntity.name}
            </span>
            {hoveredEntity.code && (
              <span className="font-mono text-[9px] bg-cyan-500/20 text-cyan-300 px-1 py-0.5 rounded border border-cyan-500/30">
                {hoveredEntity.code}
              </span>
            )}
          </div>

          <div className="font-mono text-[10px] space-y-0.5 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">COORDINATES:</span>
              <span className="text-cyan-300">
                {hoveredEntity.lat >= 0 ? `${hoveredEntity.lat.toFixed(1)}°N` : `${Math.abs(hoveredEntity.lat).toFixed(1)}°S`},{' '}
                {hoveredEntity.lng >= 0 ? `${hoveredEntity.lng.toFixed(1)}°E` : `${Math.abs(hoveredEntity.lng).toFixed(1)}°W`}
              </span>
            </div>
            {hoveredEntity.elevationM !== undefined && (
              <div className="flex justify-between">
                <span className="text-slate-400">ELEVATION:</span>
                <span className="text-emerald-400">{hoveredEntity.elevationM}m</span>
              </div>
            )}
            <div className="text-[9px] text-cyan-400/70 pt-1 tracking-wider uppercase">
              CLICK TO INSPECT DOSSIER
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
