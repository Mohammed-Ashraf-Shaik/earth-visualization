'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Fuse from 'fuse.js';
import { SEARCH_CATALOG } from '@/data/searchCatalog';
import { SearchItem } from '@/types/telemetry';
import { useAudio } from '@/hooks/useAudioSynth';
import { Search, Globe, Building2, Mountain, Landmark, Flame, Waves, X, CornerDownLeft } from 'lucide-react';

interface OmniboxProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Omnibox({ isOpen, onClose }: OmniboxProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleSelect = (item: SearchItem) => {
    playSelect();
    playFlyTo();
    onClose();

    // Trigger URL hash or event if needed
    const iframe = document.querySelector('iframe');
    if (iframe) {
      const baseWebsceneId = '6682f70b89c4483f88e8df839a011c1e';
      const viewpoint = `cam:${item.lng},${item.lat},6000;0,65`;
      iframe.src = `https://www.arcgis.com/home/webscene/viewer.html?webscene=${baseWebsceneId}&ui=min&viewpoint=${encodeURIComponent(
        viewpoint
      )}`;
    }
  };

  if (!isOpen) return null;

  const getItemIcon = (item: SearchItem) => {
    if (item.id.startsWith('w7-')) return <Landmark className="w-4 h-4 text-amber-300" />;
    if (item.id.startsWith('volc-')) return <Flame className="w-4 h-4 text-rose-400" />;
    if (item.id.startsWith('mount-')) return <Mountain className="w-4 h-4 text-slate-200" />;
    if (item.id.startsWith('riv-')) return <Waves className="w-4 h-4 text-emerald-400" />;
    if (item.type === 'country') return <Globe className="w-4 h-4 text-amber-400" />;
    if (item.type === 'city') return <Building2 className="w-4 h-4 text-slate-300" />;
    return <Mountain className="w-4 h-4 text-amber-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#0c0d12]/95 border border-white/[0.08] rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/[0.06] gap-3">
          <Search className="w-5 h-5 text-amber-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search 7 Wonders, volcanoes, rivers, mountain summits, nations..."
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
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {results.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-slate-500">
              NO GEOGRAPHICAL TARGETS FOUND FOR "{query.toUpperCase()}"
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;

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
                      ? 'bg-amber-500/15 border border-amber-400/40 text-white shadow-lg'
                      : 'border border-transparent text-slate-300 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected ? 'bg-amber-500/20 text-amber-200' : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      {getItemIcon(item)}
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
                    <span className="text-[10px] font-mono text-slate-400 hidden sm:inline-block">
                      {item.lat.toFixed(2)}°, {item.lng.toFixed(2)}°
                    </span>
                    {isSelected && (
                      <CornerDownLeft className="w-4 h-4 text-amber-400 animate-pulse" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-black/40 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-4">
            <span>↑↓ NAVIGATE</span>
            <span>↵ SELECT TARGET</span>
          </div>
          <span className="text-amber-400/80 font-medium">TERRA PLANETARY EXPEDITION</span>
        </div>
      </div>
    </div>
  );
}
