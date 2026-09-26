export type RiskStage = "NORMAL" | "WATCH" | "WARNING" | "CRITICAL";

export type RiskFactors = {
  A: number;
  Q: number;
  T: number;
  S: number;
  P: number;
  C: number;
  H: number;
};

export type SensorNode = {
  deviceId: string;
  lat: number;
  lon: number;
  alt?: number;
  trust: number;
  anomaly: number;
  signature: "valid" | "pqc" | "queued";
  lastSeen: string;
  structureId?: string | null;
  stage: RiskStage;
};

export type StructureAsset = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  heightM: number;
  radiusM: number;
  kind: string;
  stage: RiskStage;
  score: number;
  twinConfidence: number;
  verifiedSensorCount: number;
  lastUpdate: string | null;
  factors?: RiskFactors | null;
};

export type VerifiedEvent = {
  eventId: string;
  deviceId: string;
  timestamp: string;
  finalRiskScore: string | number;
  twinCorrelation?: string | number;
  ledgerHash?: string;
  status: RiskStage | string;
  latitude: number;
  longitude: number;
  structureId?: string | null;
  localDeviceCount?: number;
  localDevices?: unknown[];
  factors?: RiskFactors;
  signatureStatus?: string;
};

export type CorrelationLink = {
  eventId: string;
  fromDeviceId: string;
  toDeviceId: string;
  from: { lat: number; lon: number };
  to: { lat: number; lon: number };
};

export type CameraSite = {
  id: string;
  name: string;
  lat: number;
  lon: number;
};

export type CommandState = {
  generatedAt: string;
  sensors: SensorNode[];
  structures: StructureAsset[];
  events: VerifiedEvent[];
  correlations: CorrelationLink[];
  cameras: CameraSite[];
  stats: {
    eventCount: number;
    sensorCount: number;
    criticalCount: number;
  };
};

export type LayerId =
  | "sensors"
  | "heatmap"
  | "structures"
  | "events"
  | "cameras"
  | "satellites"
  | "correlations";

export const DEFAULT_LAYERS: Record<LayerId, boolean> = {
  sensors: true,
  heatmap: true,
  structures: true,
  events: true,
  cameras: false,
  satellites: true,
  correlations: true,
};

export const STAGE_COLOR: Record<RiskStage, string> = {
  NORMAL: "#22c55e",
  WATCH: "#eab308",
  WARNING: "#f97316",
  CRITICAL: "#ef4444",
};

export const FALLBACK_STRUCTURES: StructureAsset[] = [
  {
    id: "downtown_bridge_01",
    name: "Downtown Bridge 01",
    lat: 28.6139,
    lon: 77.209,
    heightM: 42,
    radiusM: 220,
    kind: "bridge",
    stage: "NORMAL",
    score: 0,
    twinConfidence: 0.82,
    verifiedSensorCount: 0,
    lastUpdate: null,
  },
  {
    id: "residential_tower_7b",
    name: "Sector 7 Residential",
    lat: 19.076,
    lon: 72.8777,
    heightM: 96,
    radiusM: 90,
    kind: "tower",
    stage: "NORMAL",
    score: 0,
    twinConfidence: 0.8,
    verifiedSensorCount: 0,
    lastUpdate: null,
  },
  {
    id: "metro_line_b",
    name: "Metro Line B Tunnel",
    lat: 28.6304,
    lon: 77.2177,
    heightM: 16,
    radiusM: 140,
    kind: "tunnel",
    stage: "NORMAL",
    score: 0,
    twinConfidence: 0.7,
    verifiedSensorCount: 0,
    lastUpdate: null,
  },
  {
    id: "city_hall",
    name: "City Hall Foundation",
    lat: 28.6328,
    lon: 77.2197,
    heightM: 58,
    radiusM: 80,
    kind: "building",
    stage: "NORMAL",
    score: 0,
    twinConfidence: 0.74,
    verifiedSensorCount: 0,
    lastUpdate: null,
  },
];

export const FALLBACK_CAMERAS: CameraSite[] = [
  { id: "cam-rajpath-01", name: "Rajpath West Cam", lat: 28.6129, lon: 77.2195 },
  { id: "cam-ig-02", name: "India Gate Perimeter", lat: 28.6127, lon: 77.2295 },
  { id: "cam-bridge-03", name: "Bridge 01 Underside", lat: 28.6146, lon: 77.2082 },
];
