/**
 * WAQI API Integration Service
 * Fetches real-time air quality data from WAQI for Delhi
 */

const WAQI_TOKEN = '18e9b9e06ffad61705a33a6f4f3d10e0c21b3328';
const WAQI_BASE_URL = 'https://api.waqi.info';

// Delhi bounding box coordinates
const DELHI_BOUNDS = {
  north: 28.88,
  south: 28.40,
  east: 77.35,
  west: 76.84,
};

export interface AQIDataPoint {
  location: string;
  lat: number;
  lng: number;
  pm25: number;
  aqi: number;
  timestamp: string;
}

/**
 * Convert PM2.5 concentration (µg/m³) to AQI (Indian standard)
 * Based on Central Pollution Control Board (CPCB) guidelines
 */
export function pm25ToAQI(pm25: number): number {
  // Indian AQI breakpoints for PM2.5
  const breakpoints = [
    { cLow: 0, cHigh: 30, iLow: 0, iHigh: 50 },
    { cLow: 31, cHigh: 60, iLow: 51, iHigh: 100 },
    { cLow: 61, cHigh: 90, iLow: 101, iHigh: 200 },
    { cLow: 91, cHigh: 120, iLow: 201, iHigh: 300 },
    { cLow: 121, cHigh: 250, iLow: 301, iHigh: 400 },
    { cLow: 251, cHigh: 500, iLow: 401, iHigh: 500 },
  ];

  for (const bp of breakpoints) {
    if (pm25 >= bp.cLow && pm25 <= bp.cHigh) {
      const aqi = ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (pm25 - bp.cLow) + bp.iLow;
      return Math.round(aqi);
    }
  }

  // If PM2.5 exceeds highest breakpoint
  if (pm25 > 500) return 500;
  return 0;
}

interface WAQIStationSummary {
  uid: number;
  lat: number;
  lon: number;
  aqi?: string | number | null;
  name?: string;
}

interface WAQILatestResponse {
  aqi?: string | number | null;
  iaqi?: Record<string, { v?: number }>;
  time?: { iso?: string };
  city?: { name?: string };
}

function isWithinDelhiBounds(lat: number, lng: number): boolean {
  return lat <= DELHI_BOUNDS.north && lat >= DELHI_BOUNDS.south && lng <= DELHI_BOUNDS.east && lng >= DELHI_BOUNDS.west;
}

function parseAQI(raw: string | number | null | undefined): number | null {
  if (raw == null) return null;
  const n = typeof raw === 'number' ? raw : parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

async function fetchDelhiStations(): Promise<WAQIStationSummary[]> {
  const url = `${WAQI_BASE_URL}/map/bounds/?latlng=${DELHI_BOUNDS.south},${DELHI_BOUNDS.west},${DELHI_BOUNDS.north},${DELHI_BOUNDS.east}&token=${WAQI_TOKEN}`;
  const response = await fetch(url, { headers: { Accept: 'application/json' } });

  if (!response.ok) {
    throw new Error(`WAQI bounds error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const stations: any[] = data.data || [];

  return stations
    .map((s) => ({
      uid: s.uid,
      lat: s.lat,
      lon: s.lon,
      aqi: s.aqi,
      name: s.station?.name,
    }))
    .filter((s) => s.lat != null && s.lon != null);
}

async function fetchStationLatest(uid: number): Promise<{ aqi: number | null; pm25: number | null; timestamp: string } | null> {
  const url = `${WAQI_BASE_URL}/feed/@${uid}/?token=${WAQI_TOKEN}`;
  const response = await fetch(url, { headers: { Accept: 'application/json' } });

  if (!response.ok) {
    console.warn(`WAQI latest error for station ${uid}: ${response.status}`);
    return null;
  }

  const data = await response.json();
  if (data.status !== 'ok') return null;

  const payload: WAQILatestResponse = data.data || {};
  const pm25 = payload.iaqi?.pm25?.v ?? null;
  const aqi = parseAQI(payload.aqi);
  const timestamp = payload.time?.iso || new Date().toISOString();

  return { aqi, pm25, timestamp };
}

/**
 * Fetch latest PM2.5 measurements from WAQI for Delhi using map bounds + per-station latest
 */
export async function fetchDelhiAirQuality(): Promise<AQIDataPoint[]> {
  try {
    const stations = await fetchDelhiStations();
    console.log(`📍 Found ${stations.length} Delhi WAQI stations`);

    const CONCURRENCY = 10;
    const readings: AQIDataPoint[] = [];

    for (let i = 0; i < stations.length; i += CONCURRENCY) {
      const batch = stations.slice(i, i + CONCURRENCY);
      const batchResults = await Promise.all(
        batch.map(async (station) => {
          const latest = await fetchStationLatest(station.uid);
          if (!latest) return null;

          const aqiFromApi = parseAQI(latest.aqi);
          const pm25 = latest.pm25;
          const aqi = typeof aqiFromApi === 'number'
            ? aqiFromApi
            : (pm25 != null ? pm25ToAQI(pm25) : 150);

          return {
            location: station.name || `Station ${station.uid}`,
            lat: station.lat,
            lng: station.lon,
            pm25: pm25 ?? 0,
            aqi,
            timestamp: latest.timestamp,
          } as AQIDataPoint;
        })
      );

      batchResults.forEach((r) => {
        if (r) readings.push(r);
      });
    }

    if (readings.length === 0) {
      console.warn('⚠️ WAQI returned 0 PM2.5 readings; falling back to estimation');
    } else {
      console.log(`✅ Collected ${readings.length} live PM2.5 readings from WAQI`);
    }

    return readings;
  } catch (error) {
    console.error('❌ Error fetching WAQI data:', error);
    return [];
  }
}

/**
 * Calculate distance between two lat/lng coordinates (Haversine formula)
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find nearest sensor reading to given coordinates
 * Uses weighted average of k-nearest sensors
 */
export function getNearestAQI(
  lat: number,
  lng: number,
  sensorData: AQIDataPoint[],
  k: number = 3
): { aqi: number; source: 'sensor' | 'estimated'; distance: number } {
  if (sensorData.length === 0) {
    return { aqi: 150, source: 'estimated', distance: 0 }; // Fallback default
  }

  // Calculate distances to all sensors
  const distances = sensorData.map((sensor) => ({
    ...sensor,
    distance: calculateDistance(lat, lng, sensor.lat, sensor.lng),
  }));

  // Sort by distance
  distances.sort((a, b) => a.distance - b.distance);

  // Get k-nearest sensors
  const nearest = distances.slice(0, Math.min(k, distances.length));

  // If closest sensor is within 2km, use direct reading
  if (nearest[0].distance < 2) {
    return {
      aqi: nearest[0].aqi,
      source: 'sensor',
      distance: nearest[0].distance,
    };
  }

  // Otherwise, use inverse distance weighting
  const weights = nearest.map((n) => 1 / Math.max(n.distance, 0.1));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const weightedAQI = nearest.reduce(
    (sum, sensor, i) => sum + sensor.aqi * (weights[i] / totalWeight),
    0
  );

  return {
    aqi: Math.round(weightedAQI),
    source: nearest[0].distance < 5 ? 'sensor' : 'estimated',
    distance: nearest[0].distance,
  };
}
