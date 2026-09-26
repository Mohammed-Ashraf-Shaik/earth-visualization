import { NextResponse } from 'next/server';

// Standard high-quality GeoJSON countries source from datasets/geo-boundaries or natural-earth
const REMOTE_GEOJSON_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';
const FALLBACK_GEOJSON_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

let cachedGeoJson: any = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

export async function GET() {
  const now = Date.now();
  if (cachedGeoJson && now - cacheTimestamp < CACHE_TTL_MS) {
    return NextResponse.json(cachedGeoJson, {
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  }

  try {
    const res = await fetch(REMOTE_GEOJSON_URL, {
      next: { revalidate: 86400 },
      headers: { 'User-Agent': 'TERRA-3D-Atlas/1.0' },
    });

    if (res.ok) {
      const data = await res.json();
      cachedGeoJson = data;
      cacheTimestamp = now;
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        },
      });
    }
  } catch (err: any) {
    console.warn('Remote GeoJSON fetch failed, checking fallback:', err.message);
  }

  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'public', 'data', 'world-110m.json');
    const localContent = await fs.readFile(filePath, 'utf-8');
    const localJson = JSON.parse(localContent);
    return NextResponse.json(localJson, {
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (readErr) {
    return NextResponse.json(
      { type: 'FeatureCollection', features: [] },
      { status: 200 }
    );
  }
}
