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
let latestLiveLocation: GpsCoordinates | null = null;
let locationWatcher: Location.LocationSubscription | null = null;

export async function startGpsTracking() {
  if (locationWatcher) return;
  const servicesEnabled = await Location.hasServicesEnabledAsync();
  if (!servicesEnabled) return;

  try {
    locationWatcher = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 2000, // OS pushes updates every ~2 seconds
        distanceInterval: 1, // Or when moved by 1 meter
      },
      (loc) => {
        latestLiveLocation = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          accuracy: loc.coords.accuracy,
          source: 'live',
        };
      }
    );
    console.log('✅ [GPS SERVICE] Native GPS watcher started.');
  } catch (err) {
    console.error('❌ [GPS SERVICE] Failed to start watcher:', err);
  }
}

export function stopGpsTracking() {
  if (locationWatcher) {
    locationWatcher.remove();
    locationWatcher = null;
    console.log('🛑 [GPS SERVICE] Native GPS watcher stopped.');
  }
  latestLiveLocation = null;
}

export async function getCurrentPosition(): Promise<GpsCoordinates> {
  try {
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      return getFallback();
    }

    // Active GPS fix (Highest accuracy for live tracking)
    const current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    });

    return {
      latitude: current.coords.latitude,
      longitude: current.coords.longitude,
      accuracy: current.coords.accuracy,
      source: 'live',
    };
  } catch {
    // If live fix fails, fallback to cached
    const cached = await getLastPosition();
    if (cached) return cached;
    return getFallback();
  }
}

/**
 * Best-effort position for background telemetry.
 * Instantly returns the freshest background-watched GPS location.
 */
export async function getBestEffortPosition(): Promise<GpsCoordinates> {
  // O(1) instant return of the freshest background coordinate
  if (latestLiveLocation) return latestLiveLocation;
  
  // If watcher hasn't fired yet, try cached
  const cached = await getLastPosition();
  if (cached) return cached;
  
  // Absolute fallback: block and force a one-off fetch
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
