/**
 * Alert Service — Unified modular alert system for Garuda A.S.T.R.A
 *
 * Provides a single entry point for all incoming alerts, whether from:
 * - Backend WebSocket push (via socketManager → dutyManager)
 * - Local simulation / testing
 * - System-generated events
 *
 * All alerts follow the same AlertItem structure and are injected
 * uniformly into the app's state via registered callbacks.
 *
 * NOTE: WebSocket management has been moved to socketManager.ts.
 * This module only handles alert normalization, injection, and callbacks.
 */

import { AlertItem } from './mockState';

// ---------- Types ----------

/** Minimal payload the backend sends over WebSocket */
export interface BackendAlertPayload {
  id?: string;
  title: string;
  subtitle?: string;
  threatLevel?: 'HIGH' | 'MODERATE' | 'LOW';
  matchPercentage?: number;
  fileNo?: string;
  lastSeenLocation?: string;
  lastSeenTime?: string;
  mugshotUrl?: string;
  latitude?: number;
  longitude?: number;
  assignedOfficer?: {
    name: string;
    unitId: string;
    rank: string;
  };
  telemetry?: {
    azimuth: string;
    zoom: string;
    lens: string;
    signal: string;
  };
}

/** Callback types the App registers to handle incoming alerts */
export interface AlertServiceCallbacks {
  onNewAlert: (alert: AlertItem) => void;
  onTacticalPopup: (alert: AlertItem) => void;
}

// ---------- State ----------

let callbacks: AlertServiceCallbacks | null = null;

const FALLBACK_LAT = 18.9431;
const FALLBACK_LON = 72.8246;

// ---------- Core: Normalize + Inject ----------

/**
 * Converts a backend payload (or partial data) into a full AlertItem.
 * Missing fields get sensible defaults so the UI never breaks.
 */
export function normalizeAlert(payload: BackendAlertPayload): AlertItem {
  return {
    id: payload.id || `alert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: payload.title,
    subtitle: payload.subtitle || 'Incoming Alert',
    threatLevel: payload.threatLevel || 'HIGH',
    matchPercentage: payload.matchPercentage,
    fileNo: payload.fileNo || `#AUTO-${Date.now().toString().slice(-5)}`,
    lastSeenLocation: payload.lastSeenLocation || 'Location Pending',
    lastSeenTime: payload.lastSeenTime || 'Just Now',
    mugshotUrl: payload.mugshotUrl || '',
    latitude: payload.latitude || FALLBACK_LAT,
    longitude: payload.longitude || FALLBACK_LON,
    status: 'ALERT',
    assignedOfficer: payload.assignedOfficer,
    telemetry: payload.telemetry,
  };
}

import * as Notifications from 'expo-notifications';

// Set up notification handler so it shows up even when app is foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Universal alert injection point.
 * Call this from WebSocket handler, local simulation, or any source.
 * It normalizes the payload and triggers both the feed insert and the tactical popup.
 */
export function injectAlert(payload: BackendAlertPayload): AlertItem | null {
  if (!callbacks) {
    console.warn('⚠️ [ALERT SERVICE] No callbacks registered. Call registerAlertCallbacks() first.');
    return null;
  }

  const alert = normalizeAlert(payload);

  // Inject into alert feed
  callbacks.onNewAlert(alert);

  // Trigger full-screen tactical popup + audio
  callbacks.onTacticalPopup(alert);

  // Send local push notification
  Notifications.scheduleNotificationAsync({
    content: {
      title: `🚨 ${alert.threatLevel} THREAT DETECTED`,
      body: `Match for ${alert.title} at ${alert.lastSeenLocation}`,
      data: { alertId: alert.id },
    },
    trigger: null, // trigger immediately
  }).catch((err) => {
    console.warn('⚠️ [ALERT SERVICE] Failed to send push notification:', err);
  });

  console.log(`
🚨 ============ INCOMING ALERT ============
🚨 ID              : ${alert.id}
🚨 TITLE           : ${alert.title}
🚨 THREAT LEVEL    : ${alert.threatLevel}
🚨 LOCATION        : ${alert.lastSeenLocation}
🚨 FILE NO         : ${alert.fileNo}
🚨 ==========================================
`);

  return alert;
}

// ---------- Callback Registration ----------

/**
 * Register the App's alert handlers. Must be called once at app startup.
 */
export function registerAlertCallbacks(cbs: AlertServiceCallbacks) {
  callbacks = cbs;
  console.log('✅ [ALERT SERVICE] Callbacks registered.');
}

/**
 * Unregister callbacks (e.g., on logout).
 */
export function unregisterAlertCallbacks() {
  callbacks = null;
}

// ---------- Simulation Helpers ----------

/**
 * Simulate an incoming backend alert after a delay.
 * Useful for demos and testing the full pipeline without a live backend.
 */
export function simulateIncomingAlert(payload: BackendAlertPayload, delayMs: number = 0): NodeJS.Timeout {
  return setTimeout(() => {
    injectAlert(payload);
  }, delayMs);
}
