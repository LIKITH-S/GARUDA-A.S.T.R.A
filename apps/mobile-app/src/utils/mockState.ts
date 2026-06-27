/**
 * mockState.ts — Centralized mock data for Garuda A.S.T.R.A
 *
 * All placeholder data lives here. When the backend is built,
 * replace each INITIAL_* export with API-fetched data.
 *
 * Current scope: Missing Person / Wanted Person detection via CCTV cameras.
 */

// ==================== INTERFACES ====================

export interface AlertItem {
  id: string;
  title: string;
  subtitle: string;
  matchPercentage?: number;
  threatLevel: 'HIGH' | 'MODERATE' | 'LOW';
  fileNo: string;
  lastSeenLocation: string;
  lastSeenTime: string;
  mugshotUrl: string;
  cameraName?: string;
  confidence?: string;
  latitude: number;
  longitude: number;
  status: 'ALERT' | 'EN-ROUTE' | 'INVESTIGATING' | 'FALSE ALARM' | 'TARGET LOST' | 'FOUND';
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

export interface AuditLogEntry {
  id: string;
  alertId: string;
  alertTitle: string;
  fileNo: string;
  officerName: string;
  unitId: string;
  previousStatus: AlertItem['status'] | 'NEW';
  newStatus: AlertItem['status'];
  timestamp: string;
  note?: string;
}

export interface CaseItem {
  id: string;
  name: string;
  age: number;
  gender: string;
  missingSince: string;
  lastSeen: string;
  photoUrl: string;
  status: 'ACTIVE' | 'RESOLVED';
  caseType: 'MISSING' | 'WANTED';
  description?: string;
}

export interface MessageItem {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isRadioChannel?: boolean;
}

export interface OfficerProfile {
  unitId: string;
  encryptionKey: string;
  name: string;
  rank: string;
  shift: string;
  status: string;
  commsLink: string;
}

// ==================== OFFICER ====================

export const INITIAL_OFFICER: OfficerProfile = {
  unitId: 'ALPHA-9-042',
  encryptionKey: 'AES-256',
  name: 'Surya Pratap',
  rank: 'Tactical Inspector',
  shift: 'Night Duty (18:00 - 06:00)',
  status: 'OFF DUTY',
  commsLink: 'MUN-HQ-SRV-04',
};

// ==================== ALERTS (Camera Detections) ====================
// Each alert = a CCTV camera matched a face against missing/wanted person DB

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'missing-aarav',
    title: 'Aarav Mehta',
    subtitle: 'Missing Person — Camera Match',
    matchPercentage: 94,
    threatLevel: 'HIGH',
    fileNo: '#MP-23854',
    lastSeenLocation: 'Marine Drive, Sector 1',
    lastSeenTime: '02:14 ago',
    mugshotUrl: 'https://lh3.googleusercontent.com/aida/ADBb0uizPUY6M_NlroyBqrX5XTPrN0cAjgzKywTPXwHQWwQ4zA06Po3-JnMNNdtOhOLMxSytUYg5li2uaxpYU5_NcwI4j50Fc_a_Knk4u9pQJfI_Nw3qg_hFLFpJ17aPM7YTx4fepcZP_0MqSsGWTIFlhK9po3Q-346m9vSIp_ykkX1HIQUXjLcBYlCnrevXWqEUOf5-bmLT45mAvS5-fMTWEjWIWwW5O2fW3CC71vV_fsIA0VH6rIzZDxlvPg',
    cameraName: 'CAM-224-B',
    confidence: '94.1%',
    latitude: 18.9431,
    longitude: 72.8246,
    status: 'ALERT',
    assignedOfficer: {
      name: 'Surya Pratap',
      unitId: 'UNIT-042',
      rank: 'Tactical Inspector',
    },
    telemetry: {
      azimuth: '244.18°',
      zoom: '4.5X',
      lens: '85MM',
      signal: '100%',
    },
  },
  {
    id: 'wanted-vikram',
    title: 'Vikram Singh',
    subtitle: 'Wanted Person — Camera Match',
    matchPercentage: 91,
    threatLevel: 'HIGH',
    fileNo: '#WP-11202',
    lastSeenLocation: 'CST Station, Platform 4',
    lastSeenTime: '08:22 ago',
    mugshotUrl: 'https://lh3.googleusercontent.com/aida/ADBb0uinW8y67YEK48-TdEQY-AJG8_ueBS_ohoH74aQpBE-NnZUMuuO3XSn-b-M18y7prXJq2iAbpLw1bkW2T_P-YboddcbqRBzmK3U5K9WbHkNn650YAf_dDkFhILF_Q1KmFljN0YdOrR6B98KpIAp8QJ8nUgIu-LXiF2v0fTDyu7Au_9T8wZFr_sZbATd3kx0YJoEdCbykGKA05bBbdWWkPzddOXow2DDEC-I4_M0L9-37JYIMmLtHvjUChA',
    cameraName: 'CAM-CST-07',
    confidence: '91.4%',
    latitude: 18.9398,
    longitude: 72.8355,
    status: 'ALERT',
    assignedOfficer: {
      name: 'Rohit Deshmukh',
      unitId: 'UNIT-075',
      rank: 'Senior Constable',
    },
    telemetry: {
      azimuth: '122.50°',
      zoom: '3.2X',
      lens: '50MM',
      signal: '98%',
    },
  },
  {
    id: 'missing-priya',
    title: 'Priya Sharma',
    subtitle: 'Missing Person — Camera Match',
    matchPercentage: 78,
    threatLevel: 'MODERATE',
    fileNo: '#MP-09432',
    lastSeenLocation: 'Bandra Station West',
    lastSeenTime: '12:40 ago',
    mugshotUrl: 'https://lh3.googleusercontent.com/aida/AB6AXuDv915T66OGD0yrX_nnf23c0n2XAnsWog4Lf6Ayi_mv3DRNxdvmRobdUBvVo1DKNUOxNHnXTwXU_4SJKokTsTjIyE27TF5ApxXTGLEiOfDgo3dsucHBj0nsqLokj1rCB72rvgEIOH2VEKvLoTFcyf8oawETOECywnanIHZfgwEqLlcaZhaKN3xX1dFaY-gRXYrN3c1h--MTfmFwvwGDr0ve92ZCsdgQR9rQK1OT1wE1d1SwvRqKZDDEBzsF0J2N-iHfHh9OJ504FvY',
    cameraName: 'CAM-BDR-15',
    confidence: '78.3%',
    latitude: 19.0544,
    longitude: 72.8404,
    status: 'ALERT',
    assignedOfficer: {
      name: 'Anita Verma',
      unitId: 'UNIT-088',
      rank: 'Sub-Inspector',
    },
    telemetry: {
      azimuth: '310.72°',
      zoom: '2.0X',
      lens: '35MM',
      signal: '95%',
    },
  },
];

// ==================== AUDIT LOGS ====================

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-001',
    alertId: 'missing-aarav',
    alertTitle: 'Aarav Mehta',
    fileNo: '#MP-23854',
    officerName: 'Surya Pratap',
    unitId: 'UNIT-042',
    previousStatus: 'NEW',
    newStatus: 'ALERT',
    timestamp: '14:02:15 UTC',
    note: 'Auto-generated — CCTV face match 94.1% at CAM-224-B (Marine Drive).',
  },
  {
    id: 'log-002',
    alertId: 'wanted-vikram',
    alertTitle: 'Vikram Singh',
    fileNo: '#WP-11202',
    officerName: 'Rohit Deshmukh',
    unitId: 'UNIT-075',
    previousStatus: 'NEW',
    newStatus: 'ALERT',
    timestamp: '14:10:42 UTC',
    note: 'Auto-generated — CCTV face match 91.4% at CAM-CST-07 (CST Station).',
  },
  {
    id: 'log-003',
    alertId: 'missing-priya',
    alertTitle: 'Priya Sharma',
    fileNo: '#MP-09432',
    officerName: 'Anita Verma',
    unitId: 'UNIT-088',
    previousStatus: 'NEW',
    newStatus: 'ALERT',
    timestamp: '12:30:08 UTC',
    note: 'Auto-generated — CCTV face match 78.3% at CAM-BDR-15 (Bandra Station).',
  },
  {
    id: 'log-004',
    alertId: 'resolved-case-884',
    alertTitle: 'Missing Child #884 — Ravi Kumar',
    fileNo: '#MP-00884',
    officerName: 'Surya Pratap',
    unitId: 'UNIT-042',
    previousStatus: 'INVESTIGATING',
    newStatus: 'COMPLETED',
    timestamp: '11:45:02 UTC',
    note: 'Child located at Dharavi transit camp via CAM-DHR-03. Reunited with family.',
  },
];

// ==================== CASES (Missing / Wanted Persons DB) ====================

export const INITIAL_CASES: CaseItem[] = [
  {
    id: 'case-01',
    name: 'Aarav Mehta',
    age: 12,
    gender: 'MALE',
    missingSince: 'May 20, 2026',
    lastSeen: 'Victoria Terminus (CST)',
    photoUrl: 'https://lh3.googleusercontent.com/aida/ADBb0uizPUY6M_NlroyBqrX5XTPrN0cAjgzKywTPXwHQWwQ4zA06Po3-JnMNNdtOhOLMxSytUYg5li2uaxpYU5_NcwI4j50Fc_a_Knk4u9pQJfI_Nw3qg_hFLFpJ17aPM7YTx4fepcZP_0MqSsGWTIFlhK9po3Q-346m9vSIp_ykkX1HIQUXjLcBYlCnrevXWqEUOf5-bmLT45mAvS5-fMTWEjWIWwW5O2fW3CC71vV_fsIA0VH6rIzZDxlvPg',
    status: 'ACTIVE',
    caseType: 'MISSING',
    description: 'Missing child. Last seen wearing blue school uniform near Platform 3.',
  },
  {
    id: 'case-02',
    name: 'Priya Sharma',
    age: 28,
    gender: 'FEMALE',
    missingSince: 'May 18, 2026',
    lastSeen: 'Bandra Promenade',
    photoUrl: 'https://lh3.googleusercontent.com/aida/AB6AXuDv915T66OGD0yrX_nnf23c0n2XAnsWog4Lf6Ayi_mv3DRNxdvmRobdUBvVo1DKNUOxNHnXTwXU_4SJKokTsTjIyE27TF5ApxXTGLEiOfDgo3dsucHBj0nsqLokj1rCB72rvgEIOH2VEKvLoTFcyf8oawETOECywnanIHZfgwEqLlcaZhaKN3xX1dFaY-gRXYrN3c1h--MTfmFwvwGDr0ve92ZCsdgQR9rQK1OT1wE1d1SwvRqKZDDEBzsF0J2N-iHfHh9OJ504FvY',
    status: 'ACTIVE',
    caseType: 'MISSING',
    description: 'Missing woman. Family reported last contact near Bandra station area.',
  },
  {
    id: 'case-03',
    name: 'Vikram Singh',
    age: 34,
    gender: 'MALE',
    missingSince: 'Jan 15, 2026',
    lastSeen: 'Andheri East',
    photoUrl: 'https://lh3.googleusercontent.com/aida/ADBb0uinW8y67YEK48-TdEQY-AJG8_ueBS_ohoH74aQpBE-NnZUMuuO3XSn-b-M18y7prXJq2iAbpLw1bkW2T_P-YboddcbqRBzmK3U5K9WbHkNn650YAf_dDkFhILF_Q1KmFljN0YdOrR6B98KpIAp8QJ8nUgIu-LXiF2v0fTDyu7Au_9T8wZFr_sZbATd3kx0YJoEdCbykGKA05bBbdWWkPzddOXow2DDEC-I4_M0L9-37JYIMmLtHvjUChA',
    status: 'ACTIVE',
    caseType: 'WANTED',
    description: 'Wanted suspect. Outstanding warrant for armed robbery. Approach with caution.',
  },
  {
    id: 'case-04',
    name: 'Ravi Kumar',
    age: 8,
    gender: 'MALE',
    missingSince: 'May 25, 2026',
    lastSeen: 'Dharavi Main Road',
    photoUrl: 'https://lh3.googleusercontent.com/aida/ADBb0uhW63cEw3-a3d24Fp_BwW3QG89H690hoSn14z2AbDDE4-87Wp_1Sn-B-99yXprXJq2iAbpL',
    status: 'RESOLVED',
    caseType: 'MISSING',
    description: 'Found via CAM-DHR-03. Reunited with family at Dharavi transit camp.',
  },
];

// ==================== MESSAGES ====================

export const INITIAL_MESSAGES: MessageItem[] = [
  {
    id: 'msg-01',
    sender: 'DISPATCH HQ',
    text: 'Patrol unit 042, CCTV camera at Marine Drive (CAM-224-B) detected a face match for missing child Aarav Mehta. Confidence 94%. Please verify.',
    timestamp: '18:02',
  },
  {
    id: 'msg-02',
    sender: 'PATROL UNIT-042',
    text: 'Copy that HQ. Moving towards Marine Drive. Will verify identity on location.',
    timestamp: '18:05',
  },
  {
    id: 'msg-03',
    sender: 'DISPATCH HQ',
    text: 'Unit 075 — additional match detected for wanted person Vikram Singh at CST Station. CAM-CST-07 confidence 91%. Proceed with caution.',
    timestamp: '18:12',
  },
];

// ==================== SIMULATED INCOMING ALERT (Demo Only) ====================
// This is the mock alert that gets pushed 8s after login to demo the alert system.
// In production this would come from the backend via WebSocket.

export const SIMULATED_DEMO_ALERT = {
  title: 'Ravi Kumar',
  subtitle: 'Missing Child — Camera Match',
  threatLevel: 'HIGH' as const,
  matchPercentage: 97,
  fileNo: '#MP-00884',
  lastSeenLocation: 'Dadar Station West, CAM-DDR-11',
  lastSeenTime: 'Just Now',
  mugshotUrl: 'https://lh3.googleusercontent.com/aida/ADBb0uhW63cEw3-a3d24Fp_BwW3QG89H690hoSn14z2AbDDE4-87Wp_1Sn-B-99yXprXJq2iAbpL',
  latitude: 19.0178,
  longitude: 72.8434,
};
