'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Fuse from 'fuse.js';
import { SEARCH_CATALOG } from '@/data/searchCatalog';
import { SearchItem } from '@/types/telemetry';
import { useGlobeStore } from '@/stores/useGlobeStore';
import { useAudio } from '@/hooks/useAudioSynth';
import { fetchCountryDossier } from '@/services/dossierService';
import { Search, Globe, Building2, Mountain, X, ArrowRight, CornerDownLeft } from 'lucide-react';

interface OmniboxProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Omnibox({ isOpen, onClose }: OmniboxProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const flyTo = useGlobeStore((s) => s.flyTo);
  const setSelectedCountry = useGlobeStore((s) => s.setSelectedCountry);
  const { playHover, playSelect, playFlyTo } = useAudio();

  // Configure Fuse.js index
  const fuse = useMemo(() => {
    return new Fuse(SEARCH_CATALOG, {
      keys: ['name', 'subtitle', 'cca3', 'type'],
      threshold: 0.35,
      ignoreLocation: true,
    });
  }, []);

  const results: SearchItem[] = useMemo(() => {
    if (!query.trim()) {
      return SEARCH_CATALOG.slice(0, 10);
    }
    return fuse.search(query).map((res) => res.item).slice(0, 12);
  }, [query, fuse]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation & global Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
        playHover();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
        playHover();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  const handleSelect = async (item: SearchItem) => {
    playSelect();
    playFlyTo();
    onClose();

    // Trigger camera fly-to transition
    flyTo({
      lat: item.lat,
      lng: item.lng,
      altitude: item.type === 'country' ? 2.2 : 1.6,
      duration: 2400,
    });

    // If country, hydrate and open dossier
    if (item.type === 'country' && item.cca3) {
      const dossier = await fetchCountryDossier(item.cca3, [item.lat, item.lng]);
      setSelectedCountry(dossier);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-slate-950/90 border border-white/15 rounded-2xl shadow-[0_16px_70px_rgba(0,240,255,0.15)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
          <Search className="w-5 h-5 text-cyan-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search 195+ nations, megacities, mountain peaks, oceanic trenches..."
            className="flex-1 bg-transparent text-sm font-mono text-white placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
            ESC TO CLOSE
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {results.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-slate-500">
              NO GEOGRAPHICAL TARGETS MATCHING "{query.toUpperCase()}"
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon =
                item.type === 'country'
                  ? Globe
                  : item.type === 'city'
                  ? Building2
                  : Mountain;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => {
                    setSelectedIndex(idx);
                    playHover();
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-cyan-500/15 border border-cyan-500/40 text-white shadow-lg'
                      : 'border border-transparent text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-xs uppercase tracking-wide text-white truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-cyan-400/80 hidden sm:inline-block">
                      {item.lat.toFixed(2)}°, {item.lng.toFixed(2)}°
                    </span>
                    {isSelected && (
                      <CornerDownLeft className="w-4 h-4 text-cyan-400 animate-pulse" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-4">
            <span>↑↓ NAVIGATE</span>
            <span>↵ SELECT TARGET</span>
          </div>
          <span className="text-cyan-400/70">TERRA PLANETARY INDEX</span>
        </div>
      </div>
    </div>
  );
}
