/**
 * Duty Manager — ON/OFF duty lifecycle controller for Garuda A.S.T.R.A
 *
 * Single entry point that App.tsx calls to control the entire
 * operational layer. Coordinates:
 *   - WebSocket connection (socketManager)
 *   - Foreground service (foregroundService)
 *   - Alert injection pipeline (alertService)
 *   - Immediate telemetry events
 *
 * This is the ONLY module App.tsx needs to import for service control.
 */

import * as SocketManager from './socketManager';
import * as ForegroundService from './foregroundService';
import { injectAlert, BackendAlertPayload } from '../utils/alertService';

// ---------- Types ----------

export interface DutyConfig {
  officerId: string;
  officerName: string;
  officerRank: string;
  wsUrl: string;
  telemetryIntervalMs?: number;  // Default: 15000
}

// ---------- Internal State ----------

let dutyActive = false;
let currentConfig: DutyConfig | null = null;
let messageUnsubscribe: (() => void) | null = null;
let connectionUnsubscribe: (() => void) | null = null;

// ---------- Public API ----------

/**
 * Go ON DUTY.
 *
 * Sequence:
 * 1. Connect WebSocket to command center
 * 2. Wire up incoming alert injection
 * 3. Start foreground service (background loop + sticky notification)
 * 4. Send immediate DUTY_ON telemetry event
 *
 * Safe to call multiple times — no-ops if already on duty.
 */
export async function goOnDuty(config: DutyConfig): Promise<boolean> {
  if (dutyActive) {
    console.log('ℹ️ [DUTY] Already ON DUTY.');
    return true;
  }

  currentConfig = config;

  console.log(`
🟢 ============ GOING ON DUTY ============
🟢 OFFICER : ${config.officerName} (${config.officerId})
🟢 RANK    : ${config.officerRank}
🟢 WS URL  : ${config.wsUrl}
🟢 ========================================
`);

  // 1. Connect WebSocket
  const SecureStore = require('expo-secure-store');
  const token = await SecureStore.getItemAsync('astra_token');
  const wsUrlWithToken = token ? `${config.wsUrl}?token=${token}` : config.wsUrl;
  SocketManager.connect(wsUrlWithToken);

  // 2. Wire up incoming alert messages from WebSocket → alertService
  messageUnsubscribe = SocketManager.onMessage((data: any) => {
    // Handle alerts from backend
    if (data.event === 'possible_match_detected' || data.type === 'assignment') {
      const isAssignment = data.type === 'assignment';
      const alertData = isAssignment ? data : data.data;
      
      const alertPayload: BackendAlertPayload = {
        id: alertData.alert_id || data.alert_id || String(Date.now()),
        title: isAssignment ? 'URGENT ASSIGNMENT' : 'POSSIBLE MATCH DETECTED',
        description: alertData.message || `Match Confidence: ${alertData.confidence}%`,
        severity: isAssignment ? 'CRITICAL' : 'HIGH',
        location: alertData.lat ? { lat: alertData.lat, lng: alertData.lng } : undefined,
        assignedOfficer: {
          name: config.officerName,
          unitId: config.officerId,
          rank: config.officerRank,
        },
      };
      injectAlert(alertPayload);
    }
  });

  // 3. Log connection state changes
  connectionUnsubscribe = SocketManager.onConnectionChange((connected) => {
    console.log(`🔌 [DUTY] WebSocket ${connected ? '🟢 CONNECTED' : '🔴 DISCONNECTED'}`);
  });

  // 4. Start foreground service
  const serviceStarted = await ForegroundService.startService({
    officerId: config.officerId,
    officerName: config.officerName,
    wsUrl: config.wsUrl,
    delayMs: config.telemetryIntervalMs || 15000,
  });

  if (!serviceStarted) {
    console.error('❌ [DUTY] Failed to start foreground service. Cleaning up...');
    await goOffDuty();
    return false;
  }

  // 5. Send immediate DUTY_ON telemetry
  ForegroundService.sendImmediateTelemetry(
    'DUTY_ON',
    config.officerId,
    config.officerName,
    'ACTIVE DUTY'
  );

  dutyActive = true;
  console.log('✅ [DUTY] Officer is now ON DUTY. All systems active.');
  return true;
}

/**
 * Go OFF DUTY.
 *
 * Sequence:
 * 1. Send immediate DUTY_OFF telemetry event
 * 2. Stop foreground service (removes notification, stops loop)
 * 3. Disconnect WebSocket
 * 4. Clean up event handlers
 *
 * Safe to call multiple times — no-ops if already off duty.
 */
export async function goOffDuty(): Promise<void> {
  if (!dutyActive && !ForegroundService.isServiceRunning()) {
    return;
  }

  console.log('🔴 [DUTY] Going OFF DUTY...');

  // 1. Send immediate DUTY_OFF telemetry (before disconnecting)
  if (currentConfig) {
    ForegroundService.sendImmediateTelemetry(
      'DUTY_OFF',
      currentConfig.officerId,
      currentConfig.officerName,
      'OFF DUTY'
    );
  }

  // 2. Stop foreground service
  await ForegroundService.stopService();

  // 3. Disconnect WebSocket
  SocketManager.disconnect();

  // 4. Clean up event handlers
  if (messageUnsubscribe) {
    messageUnsubscribe();
    messageUnsubscribe = null;
  }
  if (connectionUnsubscribe) {
    connectionUnsubscribe();
    connectionUnsubscribe = null;
  }

  dutyActive = false;
  currentConfig = null;
  console.log('🛑 [DUTY] Officer is now OFF DUTY. All systems stopped.');
}

/**
 * Check if duty is currently active.
 */
export function isDutyActive(): boolean {
  return dutyActive;
}

/**
 * Check if the WebSocket is connected (for UI status indicators).
 */
export function isSocketConnected(): boolean {
  return SocketManager.isConnected();
}

/**
 * Send an immediate telemetry event (LOGIN, LOGOUT, SOS).
 */
export function sendEvent(
  eventType: 'LOGIN' | 'LOGOUT' | 'SOS',
  officerId: string,
  officerName: string,
  customStatus?: string
): void {
  ForegroundService.sendImmediateTelemetry(eventType, officerId, officerName, customStatus);
}
