import { DELHI_WARDS } from '../constants';
import { fetchDelhiAirQuality, getNearestAQI, AQIDataPoint } from './openaqService';

export interface AQICategory {
  min: number;
  max: number;
  label: string;
  color: string;
}

export const AQI_CATEGORIES: AQICategory[] = [
  { min: 0, max: 50, label: 'Good', color: '#00b050' },
  { min: 51, max: 100, label: 'Satisfactory', color: '#ffff00' },
  { min: 101, max: 200, label: 'Moderately Polluted', color: '#ff7f00' },
  { min: 201, max: 300, label: 'Poor', color: '#ff0000' },
  { min: 301, max: Infinity, label: 'Severe', color: '#8b0000' },
];

export interface EnrichedWardGeoJSON {
  type: 'Feature';
  properties: {
    ward_id: string;
    ward_name: string;
    aqi: number;
    aqi_category: string;
    pm2_5?: number;
    source: 'sensor' | 'estimated';
    last_updated: string;
    color: string;
    priority_score: number;
    population_density: string;
  };
  geometry: {
    type: string;
    coordinates: any[];
  };
}

interface RawGeoJSON {
  type: 'FeatureCollection' | 'Feature';
  features?: any[];
  properties?: any;
  geometry?: any;
}

/**
 * Get AQI category from numeric AQI value
 */
export function getAQICategory(aqi: number): AQICategory {
  return AQI_CATEGORIES.find(cat => aqi >= cat.min && aqi <= cat.max) || AQI_CATEGORIES[AQI_CATEGORIES.length - 1];
}

/**
 * Calculate centroid of a polygon geometry
 */
function getPolygonCentroid(coordinates: any[]): { lat: number; lng: number } | null {
  try {
    const ring = coordinates[0];
    if (!ring || ring.length === 0) return null;

    let latSum = 0;
    let lngSum = 0;
    let count = 0;

    for (const point of ring) {
      if (point && point.length >= 2) {
        lngSum += point[0];
        latSum += point[1];
        count++;
      }
    }

    if (count === 0) return null;

    return {
      lat: latSum / count,
      lng: lngSum / count,
    };
  } catch (error) {
    console.error('Error calculating centroid:', error);
    return null;
  }
}

/**
 * Point-in-polygon check using ray casting algorithm
 */
function isPointInPolygon(lng: number, lat: number, coordinates: any[]): boolean {
  try {
    // Handles Polygon and MultiPolygon GeoJSON structures
    const polygons = Array.isArray(coordinates?.[0]?.[0]?.[0])
      ? coordinates // MultiPolygon: array of polygons
      : [coordinates]; // Polygon: single polygon

    const pointInRing = (ring: any[]): boolean => {
      if (!ring || ring.length < 3) return false;
      let inside = false;
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const xi = ring[i][0], yi = ring[i][1];
        const xj = ring[j][0], yj = ring[j][1];
        const intersect = ((yi > lat) !== (yj > lat)) && (lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }
      return inside;
    };

    return polygons.some(poly => pointInRing(poly[0]));
  } catch (error) {
    return false;
  }
}

/**
 * Calculate Haversine distance between two points (in km)
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
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
 * Enrich ward GeoJSON features with real-time AQI data from OpenAQ
 * Falls back to DELHI_WARDS constant if OpenAQ data unavailable
 */
export async function enrichWardGeoJSON(geojsonData: RawGeoJSON): Promise<EnrichedWardGeoJSON[]> {
  console.log('🌍 Fetching live air quality data from OpenAQ...');
  const openaqData = await fetchDelhiAirQuality();
  console.log(`📊 Loaded ${openaqData.length} AQI stations`);

  const features = geojsonData.type === 'FeatureCollection' 
    ? (geojsonData.features || [])
    : geojsonData.type === 'Feature' 
    ? [geojsonData]
    : [];

  const wardAQIMap = new Map(
    DELHI_WARDS.map(ward => [ward.name.toUpperCase(), ward])
  );

  // STEP 1: Assign stations to wards using point-in-polygon
  const wardStations = new Map<number, AQIDataPoint[]>();
  
  if (openaqData.length > 0) {
    features.forEach((feature, index) => {
      const coords = feature.geometry?.coordinates;
      if (!coords) return;

      const stationsInWard = openaqData.filter(station =>
        isPointInPolygon(station.lng, station.lat, coords)
      );

      if (stationsInWard.length > 0) {
        wardStations.set(index, stationsInWard);
      }
    });
    
    console.log(`🎯 Assigned stations to ${wardStations.size} wards via point-in-polygon`);
  }

  // STEP 2: Enrich each ward with computed AQI
  return features.map((feature, index): EnrichedWardGeoJSON => {
    const properties = feature.properties || {};
    const wardName = (properties.Ward_Name || properties.name || properties.Ward || properties.ward_name || '').toUpperCase();
    const wardData = wardAQIMap.get(wardName);
    const coords = feature.geometry?.coordinates || [];

    let aqi: number;
    let source: 'sensor' | 'estimated';
    let pm2_5: number | undefined;

    // Check if this ward has stations inside it
    const stationsInside = wardStations.get(index);

    if (stationsInside && stationsInside.length > 0) {
      // CASE 1: Ward has sensor(s) inside - use average
      const avgAQI = stationsInside.reduce((sum, s) => sum + s.aqi, 0) / stationsInside.length;
      const avgPM25 = stationsInside.reduce((sum, s) => sum + s.pm25, 0) / stationsInside.length;
      
      aqi = Math.round(avgAQI);
      pm2_5 = avgPM25;
      source = 'sensor';
      
      console.log(`✓ Ward "${wardName}": ${stationsInside.length} station(s), AQI=${aqi}`);
    } else if (openaqData.length > 0) {
      // CASE 2: No stations inside - use distance-weighted interpolation
      const centroid = getPolygonCentroid(coords);
      
      if (centroid) {
        // Find 3 nearest stations
        const stationsWithDistance = openaqData.map(s => ({
          ...s,
          distance: calculateDistance(centroid.lat, centroid.lng, s.lat, s.lng),
        })).sort((a, b) => a.distance - b.distance);

        const nearest = stationsWithDistance.slice(0, 3);
        
        // Inverse distance weighting
        const weights = nearest.map(s => 1 / Math.max(s.distance, 0.1));
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        
        aqi = Math.round(
          nearest.reduce((sum, s, i) => sum + s.aqi * (weights[i] / totalWeight), 0)
        );
        
        pm2_5 = nearest.reduce((sum, s, i) => sum + s.pm25 * (weights[i] / totalWeight), 0);
        source = 'estimated';
        
        console.log(`≈ Ward "${wardName}": interpolated from ${nearest.length} stations, AQI=${aqi}`);
      } else {
        // Fallback if centroid calculation fails
        aqi = 150;
        source = 'estimated';
        pm2_5 = undefined;
      }
    } else {
      // CASE 3: No OpenAQ data available - use fallback
      aqi = wardData?.aqi || 150;
      source = 'estimated';
      pm2_5 = undefined;
    }

    const category = getAQICategory(aqi);

    return {
      type: 'Feature',
      properties: {
        ward_id: properties.Ward_No || wardData?.id || properties.id || '',
        ward_name: wardName,
        aqi,
        aqi_category: category.label,
        pm2_5,
        source,
        last_updated: new Date().toISOString(),
        color: category.color,
        priority_score: Math.round(aqi / 5),
        population_density: wardData?.populationDensity || 'Unknown',
      },
      geometry: feature.geometry || { type: 'Polygon', coordinates: [] },
    };
  });
}

/**
 * Estimate AQI for a location using distance-weighted average of nearest 3 wards
 */
export function estimateAQIByNearestWards(lat: number, lng: number, k = 3): number {
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
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
  };

  // Get approximate center lat/lng for each ward (simplified)
  const wardDistances = DELHI_WARDS.map(ward => ({
    ward,
    distance: calculateDistance(lat, lng, 28.6139, 77.2090), // Delhi center as proxy
  })).sort((a, b) => a.distance - b.distance);

  const nearestK = wardDistances.slice(0, k);
  const totalDistance = nearestK.reduce((sum, item) => sum + item.distance, 0);

  if (totalDistance === 0) return nearestK[0].ward.aqi;

  const weightedAQI = nearestK.reduce((sum, item) => {
    const weight = 1 / (item.distance || 0.1);
    return sum + (item.ward.aqi * weight) / (totalDistance || 1);
  }, 0);

  return Math.round(weightedAQI);
}

/**
 * Get all enriched wards as GeoJSON features
 * Useful for frontend map rendering
 */
export async function getAllWardsGeoJSON(): Promise<EnrichedWardGeoJSON[]> {
  // Placeholder: In a real scenario, this would load from delhi_wards.geojson
  // For now, return mock features based on DELHI_WARDS
  return DELHI_WARDS.map(ward => {
    const category = getAQICategory(ward.aqi);
    return {
      type: 'Feature',
      properties: {
        ward_id: ward.id,
        ward_name: ward.name,
        aqi: ward.aqi,
        aqi_category: category.label,
        pm2_5: undefined,
        source: 'sensor' as const,
        last_updated: new Date().toISOString(),
        color: category.color,
        priority_score: ward.priorityScore,
        population_density: ward.populationDensity,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [], // Geometry will come from GeoJSON file
      },
    };
  });
}
