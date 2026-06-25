/**
 * GPS Service — Background-safe location collection for Garuda A.S.T.R.A
 *
 * Provides GPS coordinates without requesting permissions (handled by PermissionGuardScreen).
 * Uses cached position first for zero battery cost, falls back to active GPS.
 * Never throws — returns fallback coordinates on failure.
 */

import * as Location from 'expo-location';

// Mysore, Karnataka — default fallback
const FALLBACK_LAT = 12.300679;
const FALLBACK_LON = 76.598564;

export interface GpsCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  source: 'cached' | 'live' | 'fallback';
}

/**
 * Get the last known (cached) position — instant, zero battery cost.
 * Returns null if no cached position is available.
 */
export async function getLastPosition(): Promise<GpsCoordinates | null> {
  try {
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) return null;

    const lastKnown = await Location.getLastKnownPositionAsync({});
    if (lastKnown) {
      return {
        latitude: lastKnown.coords.latitude,
        longitude: lastKnown.coords.longitude,
        accuracy: lastKnown.coords.accuracy,
        source: 'cached',
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get a fresh GPS fix — uses battery but provides accurate position.
 * Falls back to cached position or fallback coordinates on failure.
 */
export async function getCurrentPosition(): Promise<GpsCoordinates> {
  try {
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      return getFallback();
    }

    // Try cached first (instant)
    const cached = await getLastPosition();
    if (cached) return cached;

    // Active GPS fix
    const current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: current.coords.latitude,
      longitude: current.coords.longitude,
      accuracy: current.coords.accuracy,
      source: 'live',
    };
  } catch {
    return getFallback();
  }
}

/**
 * Best-effort position for background telemetry.
 * Prefers cached (zero cost), falls back to live, then fallback.
 */
export async function getBestEffortPosition(): Promise<GpsCoordinates> {
  const cached = await getLastPosition();
  if (cached) return cached;
  return getCurrentPosition();
}

function getFallback(): GpsCoordinates {
  return {
    latitude: FALLBACK_LAT,
    longitude: FALLBACK_LON,
    accuracy: null,
    source: 'fallback',
  };
}
