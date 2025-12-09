export enum DeviceStatus {
  ONLINE = 'Online',
  OFFLINE = 'Offline',
  WARNING = 'Warning',
  CRITICAL = 'Critical'
}

export enum Zone {
  SERVER_ROOM = 'Server Room',
  LOBBY = 'Lobby',
  OFFICE_NORTH = 'Office North',
  OFFICE_SOUTH = 'Office South',
  WAREHOUSE = 'Warehouse',
  PARKING_LOT = 'Parking Lot',
  UNKNOWN = 'Unknown'
}

export interface Device {
  id: string;
  macAddress: string;
  ipAddress: string;
  name: string;
  manufacturer: string;
  type: string;
  status: DeviceStatus;
  zone: Zone;
  lastSeen: number; // Timestamp in ms
  firstSeen: number; // Timestamp in ms
  signalStrength: number; // -100 to 0 dBm
  latitude: number;
  longitude: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  notes: string;
}

export interface MacAnalysisResult {
  manufacturer: string;
  deviceType: string;
  securityRisk: string;
  likelyUsage: string;
}

export interface User {
  name: string;
  email: string;
  avatar: string;
}