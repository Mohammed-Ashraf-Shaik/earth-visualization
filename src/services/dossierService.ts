import { CountryDossier, GeoCoordinate } from '@/types/telemetry';

// Elevation extremes dictionary for prominent nations
const ELEVATION_REGISTRY: Record<string, { highest: { name: string; meters: number }; lowest: { name: string; meters: number } }> = {
  USA: { highest: { name: 'Denali', meters: 6190 }, lowest: { name: 'Badwater Basin, Death Valley', meters: -86 } },
  CHN: { highest: { name: 'Mount Everest', meters: 8848 }, lowest: { name: 'Ayding Lake, Turpan', meters: -154 } },
  IND: { highest: { name: 'Kangchenjunga', meters: 8586 }, lowest: { name: 'Kuttanad', meters: -2.2 } },
  JPN: { highest: { name: 'Mount Fuji', meters: 3776 }, lowest: { name: 'Hachiro-gata', meters: -4 } },
  DEU: { highest: { name: 'Zugspitze', meters: 2962 }, lowest: { name: 'Neuendorf-Sachsenbande', meters: -3.54 } },
  GBR: { highest: { name: 'Ben Nevis', meters: 1345 }, lowest: { name: 'The Fens', meters: -4 } },
  FRA: { highest: { name: 'Mont Blanc', meters: 4809 }, lowest: { name: 'Rhône River Delta', meters: -2 } },
  BRA: { highest: { name: 'Pico da Neblina', meters: 2995 }, lowest: { name: 'Atlantic Coast', meters: 0 } },
  RUS: { highest: { name: 'Mount Elbrus', meters: 5642 }, lowest: { name: 'Caspian Sea Shore', meters: -28 } },
  AUS: { highest: { name: 'Mount Kosciuszko', meters: 2228 }, lowest: { name: 'Lake Eyre', meters: -15 } },
  EGY: { highest: { name: 'Mount Catherine', meters: 2629 }, lowest: { name: 'Qattara Depression', meters: -133 } },
  ISR: { highest: { name: 'Mount Hermon', meters: 2236 }, lowest: { name: 'Dead Sea Shore', meters: -430 } },
  NPL: { highest: { name: 'Mount Everest', meters: 8848 }, lowest: { name: 'Kanchan Kalan', meters: 70 } },
  DEFAULT: { highest: { name: 'Continental Summit', meters: 2800 }, lowest: { name: 'Ocean Sea Level', meters: 0 } },
};

// Default offline dossier fallback
const FALLBACK_DOSSIER: Record<string, CountryDossier> = {
  USA: {
    cca3: 'USA',
    name: { common: 'United States', official: 'United States of America' },
    capital: ['Washington, D.C.'],
    region: 'Americas',
    subregion: 'North America',
    population: 334914895,
    areaKm2: 9833517,
    coordinates: [37.0902, -95.7129],
    borders: ['CAN', 'MEX'],
    flagSvg: 'https://flagcdn.com/us.svg',
    elevationExtremes: ELEVATION_REGISTRY['USA'],
    weather: { tempC: 18.4, windSpeedKph: 14.2, conditionCode: 1, humidity: 48 },
  },
  JPN: {
    cca3: 'JPN',
    name: { common: 'Japan', official: 'Japan' },
    capital: ['Tokyo'],
    region: 'Asia',
    subregion: 'Eastern Asia',
    population: 125120000,
    areaKm2: 377975,
    coordinates: [36.2048, 138.2529],
    borders: [],
    flagSvg: 'https://flagcdn.com/jp.svg',
    elevationExtremes: ELEVATION_REGISTRY['JPN'],
    weather: { tempC: 16.2, windSpeedKph: 11.5, conditionCode: 0, humidity: 55 },
  },
  IND: {
    cca3: 'IND',
    name: { common: 'India', official: 'Republic of India' },
    capital: ['New Delhi'],
    region: 'Asia',
    subregion: 'Southern Asia',
    population: 1428627663,
    areaKm2: 3287263,
    coordinates: [20.5937, 78.9629],
    borders: ['BGD', 'BTN', 'MMR', 'CHN', 'NPL', 'PAK'],
    flagSvg: 'https://flagcdn.com/in.svg',
    elevationExtremes: ELEVATION_REGISTRY['IND'],
    weather: { tempC: 28.5, windSpeedKph: 9.8, conditionCode: 2, humidity: 62 },
  },
};

export async function fetchCountryDossier(
  cca3OrName: string,
  hintCoords?: GeoCoordinate
): Promise<CountryDossier> {
  const code = cca3OrName.toUpperCase();
  let baseData: Partial<CountryDossier> = {};

  try {
    // 1. Fetch Demographics from REST Countries v3.1
    const endpoint = code.length === 3 
      ? `https://restcountries.com/v3.1/alpha/${code}` 
      : `https://restcountries.com/v3.1/name/${encodeURIComponent(cca3OrName)}?fullText=false`;

    const res = await fetch(endpoint);
    if (res.ok) {
      const data = await res.json();
      const country = Array.isArray(data) ? data[0] : data;

      if (country) {
        const coords: GeoCoordinate = country.latlng
          ? [country.latlng[0], country.latlng[1]]
          : hintCoords || [0, 0];

        baseData = {
          cca3: country.cca3 || code,
          name: {
            common: country.name?.common || cca3OrName,
            official: country.name?.official || cca3OrName,
          },
          capital: country.capital || ['Metropolitan Center'],
          region: country.region || 'Terra',
          subregion: country.subregion || 'Global',
          population: country.population || 1000000,
          areaKm2: country.area || 100000,
          coordinates: coords,
          borders: country.borders || [],
          flagSvg: country.flags?.svg || country.flags?.png,
        };
      }
    }
  } catch (err) {
    console.warn(`REST Countries lookup failed for ${cca3OrName}:`, err);
  }

  // Fallback to local cache if REST Countries failed
  if (!baseData.name) {
    const fallback = FALLBACK_DOSSIER[code];
    if (fallback) {
      baseData = { ...fallback };
    } else {
      baseData = {
        cca3: code,
        name: { common: cca3OrName, official: cca3OrName },
        capital: ['Capital'],
        region: 'Planetary Division',
        subregion: 'Geographic Sector',
        population: 15400000,
        areaKm2: 245000,
        coordinates: hintCoords || [0, 0],
        borders: [],
        flagSvg: `https://flagcdn.com/${code.slice(0, 2).toLowerCase()}.svg`,
      };
    }
  }

  const coordinates = baseData.coordinates || hintCoords || [0, 0];
  const [lat, lng] = coordinates;

  // 2. Fetch Live Weather from Open-Meteo
  let weather = {
    tempC: 20.0,
    windSpeedKph: 12.0,
    conditionCode: 0,
    humidity: 50,
  };

  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;
    const wRes = await fetch(weatherUrl);
    if (wRes.ok) {
      const wData = await wRes.json();
      if (wData.current) {
        weather = {
          tempC: Number(wData.current.temperature_2m?.toFixed(1) ?? 20),
          windSpeedKph: Number(wData.current.wind_speed_10m?.toFixed(1) ?? 12),
          conditionCode: wData.current.weather_code ?? 0,
          humidity: wData.current.relative_humidity_2m ?? 50,
        };
      }
    }
  } catch (wErr) {
    console.warn(`Open-Meteo weather lookup failed for [${lat}, ${lng}]:`, wErr);
  }

  // 3. Populate Elevation Extremes
  const elevation = ELEVATION_REGISTRY[baseData.cca3 || ''] || ELEVATION_REGISTRY.DEFAULT;

  return {
    cca3: baseData.cca3 || 'TER',
    name: baseData.name || { common: cca3OrName, official: cca3OrName },
    capital: baseData.capital || ['Capital'],
    region: baseData.region || 'Global Sector',
    subregion: baseData.subregion || 'Planetary Surface',
    population: baseData.population || 5000000,
    areaKm2: baseData.areaKm2 || 120000,
    coordinates,
    borders: baseData.borders || [],
    flagSvg: baseData.flagSvg,
    elevationExtremes: elevation,
    weather,
  };
}
