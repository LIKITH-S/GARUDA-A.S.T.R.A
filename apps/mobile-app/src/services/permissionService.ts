/**
 * Permission Service — Runtime permission checking for Garuda A.S.T.R.A
 *
 * Extracted from the old telemetryService.ts.
 * Provides status checks and on-demand permission requests.
 */

import * as Location from 'expo-location';
import { Platform, PermissionsAndroid } from 'react-native';

export interface PermissionStatus {
  foreground: boolean;
  background: boolean;
  notifications: boolean;
}

/**
 * Checks status of all required permissions dynamically.
 */
export async function checkAllPermissionsStatus(): Promise<PermissionStatus> {
  try {
    const { status: fgStatus } = await Location.getForegroundPermissionsAsync();
    const { status: bgStatus } = await Location.getBackgroundPermissionsAsync();
    let notif = true;
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      notif = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
    }
    return {
      foreground: fgStatus === 'granted',
      background: bgStatus === 'granted',
      notifications: notif,
    };
  } catch {
    return { foreground: false, background: false, notifications: false };
  }
}

/**
 * Requests a specific permission on-demand.
 */
export async function requestPermissionType(
  type: 'foreground' | 'background' | 'notifications'
): Promise<boolean> {
  try {
    if (type === 'foreground') {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } else if (type === 'background') {
      const { status } = await Location.requestBackgroundPermissionsAsync();
      return status === 'granted';
    } else if (type === 'notifications') {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Garuda A.S.T.R.A Terminal Active',
            message:
              'Notification permission is required to keep the tactical background telemetry service visible in your status bar.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensures all critical permissions for background tracking are granted.
 * Called before starting the foreground service.
 */
export async function ensureCriticalPermissions(): Promise<boolean> {
  // 1. Foreground location
  const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
  if (fgStatus !== 'granted') {
    console.warn('⚠️ [PERMISSIONS] Foreground location denied.');
    return false;
  }

  // 2. Background location
  const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
  if (bgStatus !== 'granted') {
    console.warn('⚠️ [PERMISSIONS] Background location denied.');
    return false;
  }

  // 3. Notification permission (Android 13+)
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    try {
      const hasNotif = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (!hasNotif) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Garuda A.S.T.R.A Terminal Active',
            message:
              'Notification permission is required to keep the tactical background telemetry service visible in your status bar.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.warn('⚠️ [PERMISSIONS] POST_NOTIFICATIONS denied. Service will run silently.');
        }
      }
    } catch (err) {
      console.warn('⚠️ [PERMISSIONS] Error requesting POST_NOTIFICATIONS:', err);
    }
  }

  return true;
}
