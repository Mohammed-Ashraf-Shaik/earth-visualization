import { SearchItem } from '@/types/telemetry';
import { GEOGRAPHIC_CATALOG } from './geographicCatalog';

const GEOGRAPHIC_SEARCH_ITEMS: SearchItem[] = GEOGRAPHIC_CATALOG.map((g) => ({
  id: g.id,
  type: 'landmark',
  name: g.name,
  subtitle: `${g.categoryLabel} • ${g.country} • ${g.elevationMeters ? `${g.elevationMeters}m` : `${g.lengthKm}km`}`,
  lat: g.lat,
  lng: g.lng,
}));

export const SEARCH_CATALOG: SearchItem[] = [
  ...GEOGRAPHIC_SEARCH_ITEMS,

  // --- SOVEREIGN NATIONS ---
  { id: 'cnt-usa', type: 'country', name: 'United States', subtitle: 'North America • Capital: Washington, D.C.', lat: 37.0902, lng: -95.7129, cca3: 'USA' },
  { id: 'cnt-chn', type: 'country', name: 'China', subtitle: 'Asia • Capital: Beijing', lat: 35.8617, lng: 104.1954, cca3: 'CHN' },
  { id: 'cnt-ind', type: 'country', name: 'India', subtitle: 'Asia • Capital: New Delhi', lat: 20.5937, lng: 78.9629, cca3: 'IND' },
  { id: 'cnt-jpn', type: 'country', name: 'Japan', subtitle: 'Asia • Capital: Tokyo', lat: 36.2048, lng: 138.2529, cca3: 'JPN' },
  { id: 'cnt-deu', type: 'country', name: 'Germany', subtitle: 'Europe • Capital: Berlin', lat: 51.1657, lng: 10.4515, cca3: 'DEU' },
  { id: 'cnt-gbr', type: 'country', name: 'United Kingdom', subtitle: 'Europe • Capital: London', lat: 55.3781, lng: -3.436, cca3: 'GBR' },
  { id: 'cnt-fra', type: 'country', name: 'France', subtitle: 'Europe • Capital: Paris', lat: 46.2276, lng: 2.2137, cca3: 'FRA' },
  { id: 'cnt-bra', type: 'country', name: 'Brazil', subtitle: 'South America • Capital: Brasília', lat: -14.235, lng: -51.9253, cca3: 'BRA' },
  { id: 'cnt-can', type: 'country', name: 'Canada', subtitle: 'North America • Capital: Ottawa', lat: 56.1304, lng: -106.3468, cca3: 'CAN' },
  { id: 'cnt-rus', type: 'country', name: 'Russia', subtitle: 'Eurasia • Capital: Moscow', lat: 61.524, lng: 105.3188, cca3: 'RUS' },
  { id: 'cnt-aus', type: 'country', name: 'Australia', subtitle: 'Oceania • Capital: Canberra', lat: -25.2744, lng: 133.7751, cca3: 'AUS' },
  { id: 'cnt-kor', type: 'country', name: 'South Korea', subtitle: 'Asia • Capital: Seoul', lat: 35.9078, lng: 127.7669, cca3: 'KOR' },
  { id: 'cnt-ita', type: 'country', name: 'Italy', subtitle: 'Europe • Capital: Rome', lat: 41.8719, lng: 12.5674, cca3: 'ITA' },
  { id: 'cnt-esp', type: 'country', name: 'Spain', subtitle: 'Europe • Capital: Madrid', lat: 40.4637, lng: -3.7492, cca3: 'ESP' },
  { id: 'cnt-mex', type: 'country', name: 'Mexico', subtitle: 'North America • Capital: Mexico City', lat: 23.6345, lng: -102.5528, cca3: 'MEX' },
  { id: 'cnt-idn', type: 'country', name: 'Indonesia', subtitle: 'Asia • Capital: Jakarta', lat: -0.7893, lng: 113.9213, cca3: 'IDN' },
  { id: 'cnt-sau', type: 'country', name: 'Saudi Arabia', subtitle: 'Middle East • Capital: Riyadh', lat: 23.8859, lng: 45.0792, cca3: 'SAU' },
  { id: 'cnt-tur', type: 'country', name: 'Turkey', subtitle: 'Eurasia • Capital: Ankara', lat: 38.9637, lng: 35.2433, cca3: 'TUR' },
  { id: 'cnt-che', type: 'country', name: 'Switzerland', subtitle: 'Europe • Capital: Bern', lat: 46.8182, lng: 8.2275, cca3: 'CHE' },
  { id: 'cnt-arg', type: 'country', name: 'Argentina', subtitle: 'South America • Capital: Buenos Aires', lat: -38.4161, lng: -63.6167, cca3: 'ARG' },
  { id: 'cnt-egy', type: 'country', name: 'Egypt', subtitle: 'Africa • Capital: Cairo', lat: 26.8206, lng: 30.8025, cca3: 'EGY' },
  { id: 'cnt-isl', type: 'country', name: 'Iceland', subtitle: 'Europe • Capital: Reykjavik', lat: 64.9631, lng: -19.0208, cca3: 'ISL' },

  // --- MEGACITIES ---
  { id: 'city-tokyo', type: 'city', name: 'Tokyo', subtitle: 'Megacity • Japan • Pop: ~37.4M', lat: 35.6762, lng: 139.6503, cca3: 'JPN' },
  { id: 'city-delhi', type: 'city', name: 'Delhi', subtitle: 'Megacity • India • Pop: ~32.9M', lat: 28.6139, lng: 77.209, cca3: 'IND' },
  { id: 'city-newyork', type: 'city', name: 'New York City', subtitle: 'Megacity • USA • Pop: ~18.9M', lat: 40.7128, lng: -74.006, cca3: 'USA' },
  { id: 'city-london', type: 'city', name: 'London', subtitle: 'Metropolis • UK • Pop: ~9.7M', lat: 51.5074, lng: -0.1278, cca3: 'GBR' },
  { id: 'city-paris', type: 'city', name: 'Paris', subtitle: 'Metropolis • France • Pop: ~11.2M', lat: 48.8566, lng: 2.3522, cca3: 'FRA' },
  { id: 'city-dubai', type: 'city', name: 'Dubai', subtitle: 'Metropolis • UAE • Pop: ~3.6M', lat: 25.2048, lng: 55.2708, cca3: 'ARE' },
];
