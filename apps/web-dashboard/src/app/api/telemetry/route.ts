import { NextResponse } from 'next/server';

// In-memory global store to hold the telemetry data for units.
// Using a global variable for simple live mock/demonstration server state.
const globalStore = global as typeof globalThis & {
  telemetryStore?: Record<string, any>;
};

if (!globalStore.telemetryStore) {
  globalStore.telemetryStore = {
    'P-09': {
      unitId: 'P-09',
      latitude: 12.9784,
      longitude: 77.6408,
      batteryLevel: 88,
      latencyMs: 12,
      timestamp: Date.now(),
      lastSeen: new Date().toISOString()
    },
    'P-04': {
      unitId: 'P-04',
      latitude: 12.9744,
      longitude: 77.6094,
      batteryLevel: 92,
      latencyMs: 24,
      timestamp: Date.now(),
      lastSeen: new Date().toISOString()
    },
    'P-12': {
      unitId: 'P-12',
      latitude: 12.9348,
      longitude: 77.6189,
      batteryLevel: 45,
      latencyMs: 18,
      timestamp: Date.now(),
      lastSeen: new Date().toISOString()
    },
    'P-22': {
      unitId: 'P-22',
      latitude: 12.9698,
      longitude: 77.7500,
      batteryLevel: 76,
      latencyMs: 42,
      timestamp: Date.now(),
      lastSeen: new Date().toISOString()
    },
    'P-31': {
      unitId: 'P-31',
      latitude: 12.9250,
      longitude: 77.5938,
      batteryLevel: 98,
      latencyMs: 8,
      timestamp: Date.now(),
      lastSeen: new Date().toISOString()
    },
    'P-15': {
      unitId: 'P-15',
      latitude: 13.0358,
      longitude: 77.5970,
      batteryLevel: 62,
      latencyMs: 56,
      timestamp: Date.now(),
      lastSeen: new Date().toISOString()
    }
  };
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { unitId, latitude, longitude, batteryLevel, latencyMs, timestamp } = data;

    if (!unitId) {
      return NextResponse.json({ error: 'Missing unitId' }, { status: 400 });
    }

    globalStore.telemetryStore![unitId] = {
      unitId,
      latitude: latitude ?? 12.9784,
      longitude: longitude ?? 77.6408,
      batteryLevel: batteryLevel ?? 100,
      latencyMs: latencyMs ?? 0,
      timestamp: timestamp ?? Date.now(),
      lastSeen: new Date().toISOString()
    };

    return NextResponse.json({ success: true, stored: globalStore.telemetryStore![unitId] });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json(Object.values(globalStore.telemetryStore!));
}
