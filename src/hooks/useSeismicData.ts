'use client';

import { useState, useEffect, useCallback } from 'react';
import { SeismicEvent } from '@/types/telemetry';

const USGS_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson';
const POLL_INTERVAL_MS = 60000;

// High-fidelity fallback events in case USGS is offline or rate-limited
const FALLBACK_SEISMIC_DATA: SeismicEvent[] = [
  {
    id: 'us7000fallback1',
    magnitude: 6.8,
    place: '124 km E of Kimbe, Papua New Guinea',
    time: Date.now() - 3600000 * 2,
    coordinates: [151.35, -5.55, 45.2],
    tsunamiAlert: true,
  },
  {
    id: 'us7000fallback2',
    magnitude: 5.4,
    place: '78 km SSW of Hualien City, Taiwan',
    time: Date.now() - 3600000 * 4,
    coordinates: [121.32, 23.41, 18.5],
    tsunamiAlert: false,
  },
  {
    id: 'us7000fallback3',
    magnitude: 4.7,
    place: 'Near the coast of Central Chile',
    time: Date.now() - 3600000 * 6,
    coordinates: [-71.55, -31.42, 32.0],
    tsunamiAlert: false,
  },
  {
    id: 'us7000fallback4',
    magnitude: 5.9,
    place: 'Izu Islands, Japan region',
    time: Date.now() - 3600000 * 1,
    coordinates: [140.12, 31.85, 12.0],
    tsunamiAlert: false,
  },
  {
    id: 'us7000fallback5',
    magnitude: 4.2,
    place: '14 km N of Ridgecrest, California, USA',
    time: Date.now() - 3600000 * 8,
    coordinates: [-117.65, 35.75, 8.4],
    tsunamiAlert: false,
  },
  {
    id: 'us7000fallback6',
    magnitude: 6.2,
    place: 'South of the Kermadec Islands',
    time: Date.now() - 3600000 * 3,
    coordinates: [-178.4, -33.2, 38.0],
    tsunamiAlert: false,
  },
  {
    id: 'us7000fallback7',
    magnitude: 5.1,
    place: 'Southern Xinjiang, China',
    time: Date.now() - 3600000 * 5,
    coordinates: [78.6, 41.2, 10.0],
    tsunamiAlert: false,
  },
  {
    id: 'us7000fallback8',
    magnitude: 4.6,
    place: 'Reykjanes Ridge, Iceland',
    time: Date.now() - 3600000 * 7,
    coordinates: [-22.5, 63.9, 5.0],
    tsunamiAlert: false,
  }
];

export function useSeismicData() {
  const [data, setData] = useState<SeismicEvent[]>(FALLBACK_SEISMIC_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchSeismic = useCallback(async () => {
    try {
      const res = await fetch(USGS_URL, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`USGS HTTP Error: ${res.status}`);

      const json = await res.json();
      if (json && Array.isArray(json.features)) {
        const events: SeismicEvent[] = json.features
          .filter((f: any) => f.properties && f.properties.mag >= 2.5 && f.geometry && f.geometry.coordinates)
          .map((f: any) => ({
            id: f.id || `${f.properties.time}`,
            magnitude: Number(f.properties.mag.toFixed(1)),
            place: f.properties.place || 'Unknown Location',
            time: f.properties.time,
            coordinates: [
              f.geometry.coordinates[0], // lng
              f.geometry.coordinates[1], // lat
              f.geometry.coordinates[2] || 10, // depthKm
            ] as [number, number, number],
            tsunamiAlert: f.properties.tsunami === 1,
          }));

        if (events.length > 0) {
          setData(events);
          setLastUpdated(new Date());
          setError(null);
        }
      }
    } catch (err: any) {
      console.warn('USGS feed fetch fallback triggered:', err.message);
      setError(err.message);
      // Retain existing or fallback data
      setData((prev) => (prev.length > 0 ? prev : FALLBACK_SEISMIC_DATA));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeismic();
    const interval = setInterval(fetchSeismic, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchSeismic]);

  return {
    events: data,
    loading,
    error,
    lastUpdated,
    refresh: fetchSeismic,
  };
}
