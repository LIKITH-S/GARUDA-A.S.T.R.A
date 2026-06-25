/**
 * Battery Service — Battery level and charging state for Garuda A.S.T.R.A
 *
 * Provides battery percentage and charging status.
 * Never throws — returns safe defaults on failure.
 */

import * as Battery from 'expo-battery';

export interface BatteryInfo {
  level: number;       // 0–100 percentage
  charging: boolean;
}

/**
 * Get current battery level and charging state.
 * Returns { level: 100, charging: false } on failure.
 */
export async function getBatteryInfo(): Promise<BatteryInfo> {
  try {
    const [batteryLevel, batteryState] = await Promise.all([
      Battery.getBatteryLevelAsync(),
      Battery.getBatteryStateAsync(),
    ]);

    const level = batteryLevel >= 0 ? Math.round(batteryLevel * 100) : 100;
    const charging = batteryState === Battery.BatteryState.CHARGING
      || batteryState === Battery.BatteryState.FULL;

    return { level, charging };
  } catch {
    return { level: 100, charging: false };
  }
}
