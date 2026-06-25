/**
 * Foreground Service — Persistent background loop for Garuda A.S.T.R.A
 *
 * Wraps react-native-background-actions to provide a persistent Android
 * foreground service. The loop runs every 15s.
 * 
 * CRITICAL FIX: Removed dynamic updates to ensure the notification remains 
 * strictly non-clearable and permanently sticky on Android 13+.
 */

import BackgroundService from 'react-native-background-actions';
import * as SocketManager from './socketManager';
import { getBestEffortPosition } from './gpsService';
import { getBatteryInfo } from './batteryService';
import { ensureCriticalPermissions } from './permissionService';

// ---------- Types ----------

export interface ServiceConfig {
  officerId: string;
  officerName: string;
  wsUrl: string;
  delayMs?: number; 
}

export interface TelemetryPayload {
  officer_id: string;
  officer_name: string;
  gps: { lat: number; lng: number } | null;
  battery: number;
  charging: boolean;
  status: string;
  socket_connected: boolean;
  timestamp: string;
  event_type: 'PERIODIC' | 'DUTY_ON' | 'DUTY_OFF' | 'LOGIN' | 'LOGOUT' | 'SOS';
}

// ---------- Internal State ----------

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------- Background Loop ----------

async function operationalLoop(taskDataArguments?: { delay: number; officerId: string; officerName: string; wsUrl: string }) {
  const delay = taskDataArguments?.delay || 15000;
  const officerId = taskDataArguments?.officerId || 'UNKNOWN';
  const officerName = taskDataArguments?.officerName || 'UNKNOWN';

  console.log(`🟢 [FOREGROUND SERVICE] Started for Officer: ${officerName}`);

  while (BackgroundService.isRunning()) {
    try {
      // 1. Ensure WebSocket is alive
      SocketManager.ensureConnected();

      // 2. Collect GPS with native exception catch
      let gpsData = null;
      try {
        const gps = await getBestEffortPosition();
        gpsData = { lat: gps.latitude, lng: gps.longitude, source: gps.source };
      } catch (gpsError) {
        console.error('[FOREGROUND SERVICE] GPS Acquisition Failed:', gpsError);
      }

      // 3. Collect battery with native exception catch
      let batteryData = { level: 0, charging: false };
      try {
        batteryData = await getBatteryInfo();
      } catch (batteryError) {
        console.error('[FOREGROUND SERVICE] Battery Read Failed:', batteryError);
      }

      // 4. Build telemetry payload
      const telemetry: TelemetryPayload = {
        officer_id: officerId,
        officer_name: officerName,
        gps: gpsData ? { lat: gpsData.lat, lng: gpsData.lng } : null,
        battery: batteryData.level,
        charging: batteryData.charging,
        status: 'on_duty',
        socket_connected: SocketManager.isConnected(),
        timestamp: new Date().toISOString(),
        event_type: 'PERIODIC',
      };

      // 5. Send telemetry via WebSocket
      SocketManager.send({
        type: 'telemetry',
        payload: {
          ...telemetry,
          lat: gpsData ? gpsData.lat : null,
          lng: gpsData ? gpsData.lng : null,
        },
      });

      // ==========================================
      // CRITICAL FIX: STEP 6 REMOVED ENTIRELY
      // We no longer call BackgroundService.updateNotification() here.
      // This prevents the OS from stripping out the ongoing/sticky nature.
      // ==========================================

      // 7. Tactical logs
      console.log(`📡 Telemetry streamed at ${new Date().toLocaleTimeString()} • GPS: ${gpsData ? 'OK' : 'FAIL'}`);
    } catch (err) {
      console.error('[FOREGROUND SERVICE] Unexpected loop error:', err);
    }

    await sleep(delay);
  }

  console.log('🛑 [FOREGROUND SERVICE] Loop exited.');
}

// ---------- Public API ----------

export async function startService(config: ServiceConfig): Promise<boolean> {
  if (BackgroundService.isRunning()) {
    console.log('ℹ️ [FOREGROUND SERVICE] Already running.');
    return true;
  }

  const permissionsOk = await ensureCriticalPermissions();
  if (!permissionsOk) {
    console.warn('⚠️ [FOREGROUND SERVICE] Permissions missing.');
    return false;
  }

  const delayMs = config.delayMs || 15000;

  // The static configuration applied here locks the notification layout natively
  const options = {
    taskName: 'GarudaASTRADutyService',
    taskTitle: 'GARUDA A.S.T.R.A: Active Duty',
    taskDesc: 'Secure tracking & encryption link active.',
    taskIcon: {
      name: 'ic_launcher_foreground',
      type: 'mipmap',
    },
    color: '#F6BE39',
    parameters: {
      delay: delayMs,
      officerId: config.officerId,
      officerName: config.officerName,
      wsUrl: config.wsUrl,
    },
    foregroundServiceType: ['location'] as ('location')[],
    
    // ADDITIONAL NATIVE FORCE OVERRIDES
    linkingURI: 'garudaastra://', // Pressing the locked panel safely launches the thread context
  };

  try {
    await BackgroundService.start(operationalLoop, options);
    console.log('✅ [FOREGROUND SERVICE] Started successfully.');
    return true;
  } catch (error) {
    console.error('❌ [FOREGROUND SERVICE] Failed to start:', error);
    return false;
  }
}

export async function stopService(): Promise<void> {
  try {
    if (BackgroundService.isRunning()) {
      await BackgroundService.stop();
      console.log('🛑 [FOREGROUND SERVICE] Stopped.');
    }
  } catch (error) {
    console.error('❌ [FOREGROUND SERVICE] Failed to stop:', error);
  }
}

export function isServiceRunning(): boolean {
  return BackgroundService.isRunning();
}

export async function sendImmediateTelemetry(
  eventType: TelemetryPayload['event_type'],
  officerId: string,
  officerName: string,
  customStatus?: string
): Promise<void> {
  const timestamp = new Date().toISOString();
  
  let gpsData = null;
  let batteryLevel = 0;
  let batteryCharging = false;

  try {
    const gps = await getBestEffortPosition();
    gpsData = { lat: gps.latitude, lng: gps.longitude };
    const battery = await getBatteryInfo();
    batteryLevel = battery.level;
    batteryCharging = battery.charging;
  } catch {
    // Fail silently
  }

  SocketManager.send({
    type: 'telemetry',
    payload: {
      officer_id: officerId,
      officer_name: officerName,
      gps: gpsData,
      lat: gpsData ? gpsData.lat : null,
      lng: gpsData ? gpsData.lng : null,
      battery: batteryLevel,
      charging: batteryCharging,
      status: customStatus || 'on_duty',
      event_type: eventType,
      timestamp,
      socket_connected: SocketManager.isConnected(),
    },
  });
}
