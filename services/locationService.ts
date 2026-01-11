import { DELHI_WARDS } from '../constants';
import { WardData } from '../types';

interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Check if a point is inside a polygon using ray-casting algorithm
 */
function isPointInPolygon(lat: number, lng: number, polygon: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];

    const intersect = ((yi > lat) !== (yj > lat))
      && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Calculate distance between two points using Haversine formula (km)
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
 * Find ward from coordinates by checking GeoJSON data
 */
async function findWardFromGeoJSON(lat: number, lng: number): Promise<WardData | null> {
  try {
    const response = await fetch('/delhi_wards.geojson');
    const geojson = await response.json();

    const features = geojson.type === 'FeatureCollection' ? geojson.features : [geojson];

    for (const feature of features) {
      const coords = feature.geometry?.coordinates;
      if (!coords) continue;

      // Handle both Polygon and MultiPolygon
      const polygons = Array.isArray(coords[0]?.[0]?.[0]) ? coords : [coords];

      for (const polygon of polygons) {
        const ring = polygon[0];
        if (ring && ring.length > 0) {
          // Convert from [lng, lat] to comparison format
          const points = ring.map((p: number[]) => [p[0], p[1]]);
          if (isPointInPolygon(lat, lng, points)) {
            const wardName = (feature.properties?.Ward_Name || feature.properties?.name || '').toUpperCase();
            const matchedWard = DELHI_WARDS.find(w => w.name.toUpperCase() === wardName);
            if (matchedWard) return matchedWard;
          }
        }
      }
    }
  } catch (error) {
    console.error('Error loading GeoJSON:', error);
  }

  return null;
}

/**
 * Find nearest ward by distance if point-in-polygon fails
 */
function findNearestWard(lat: number, lng: number): WardData {
  let nearest = DELHI_WARDS[0];
  let minDistance = Infinity;

  // Approximate ward centers (can be improved with actual centroid data)
  const wardCenters: Record<string, Coordinates> = {
    'ANAND VIHAR': { lat: 28.6469, lng: 77.3160 },
    'DWARKA': { lat: 28.5921, lng: 77.0460 },
    'ROHINI': { lat: 28.7496, lng: 77.0672 },
  };

  for (const ward of DELHI_WARDS) {
    const center = wardCenters[ward.name] || { lat: 28.6139, lng: 77.209 };
    const distance = calculateDistance(lat, lng, center.lat, center.lng);

    if (distance < minDistance) {
      minDistance = distance;
      nearest = ward;
    }
  }

  return nearest;
}

/**
 * Get user's current location and detect their ward (hardcoded to Delhi Civic Center)
 */
export async function detectUserWard(): Promise<WardData | null> {
  // Hardcoded to Delhi Civic Center
  const hardcodedWard = DELHI_WARDS.find(ward => ward.name === 'Delhi Civic Center');
  console.log(`🏘️ Hardcoded ward: ${hardcodedWard?.name}`);
  return hardcodedWard || null;
}

/**
 * Store detected ward in localStorage
 */
export function storeUserWard(ward: WardData): void {
  try {
    localStorage.setItem('user_ward', JSON.stringify(ward));
  } catch (e) {
    console.error('Failed to store ward:', e);
  }
}

/**
 * Retrieve stored ward from localStorage
 */
export function getStoredWard(): WardData | null {
  try {
    const stored = localStorage.getItem('user_ward');
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.error('Failed to retrieve ward:', e);
    return null;
  }
}
