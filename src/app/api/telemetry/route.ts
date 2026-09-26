import { NextResponse } from 'next/server';

export async function GET() {
  const telemetryStatus = {
    systemStatus: 'OPERATIONAL',
    timestamp: new Date().toISOString(),
    utcEpoch: Date.now(),
    sources: {
      usgs: {
        endpoint: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson',
        status: 'UP',
        rateLimit: 'unmetered',
      },
      iss: {
        endpoint: 'https://api.wheretheiss.at/v1/satellites/25544',
        status: 'UP',
        rateLimit: '1req/sec',
      },
      meteo: {
        endpoint: 'https://api.open-meteo.com/v1/forecast',
        status: 'UP',
      },
      restCountries: {
        endpoint: 'https://restcountries.com/v3.1/',
        status: 'UP',
      },
    },
  };

  return NextResponse.json(telemetryStatus, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
