// Maitri Digital Twin - Canonical Telemetry & Station Constants
// All simulated prototype values are explicitly tagged source: "SIMULATED" per KB §2.

export type SystemHealthState = "NORMAL" | "WATCH" | "MAINTENANCE_DUE" | "DEGRADED" | "CRITICAL";
export type SyncState = "LIVE" | "DELAYED" | "BUFFERING" | "SYNCING" | "OFFLINE" | "PARTIALLY_SYNCED";

export interface TelemetryReading<T = number> {
  value: T;
  unit: string;
  timestamp: string;
  source: "SIMULATED" | "SENSOR" | "INFERRED";
  status: SystemHealthState;
  thresholdMin?: number;
  thresholdMax?: number;
}

export interface StationVitals {
  coordinates: {
    lat: string;
    lng: string;
    elevationM: number;
    region: string;
    subRegion: string;
  };
  commissionYear: number;
  winterCapacity: number;
  summerCapacity: number;
  currentOccupancy: number;
  externalTemp: TelemetryReading;
  windSpeed: TelemetryReading;
  atmosphericPressure: TelemetryReading;
  windChill: TelemetryReading;
  generatorOutput: TelemetryReading;
  totalPowerDemand: TelemetryReading;
  fuelAutonomyDays: TelemetryReading;
  fuelStorageTotalLiters: TelemetryReading;
  fuelStorageCurrentLiters: TelemetryReading;
  lakePriyadarshiniTemp: TelemetryReading;
  waterIntakeRateLph: TelemetryReading;
  waterStorageLiters: TelemetryReading;
  blackwaterDigesterTemp: TelemetryReading;
  incineratorAshWeightKg: TelemetryReading;
  satcomBandwidthKbps: TelemetryReading;
  satcomLatencyMs: TelemetryReading;
  syncState: SyncState;
  generators: {
    id: string;
    name: "Ravi" | "Surya" | "Aditya";
    status: "ONLINE" | "STANDBY" | "MAINTENANCE";
    loadPercent: number;
    hoursSinceOverhaul: number;
    fuelRateLph: number;
    oilPressureKpa: number;
    coolantTempC: number;
    vibrationMmSec: number;
  }[];
  lifeSupportAlerts: {
    id: string;
    subsystem: string;
    severity: "CRITICAL" | "WARNING" | "INFO";
    message: string;
    actionRequired: string;
    timestamp: string;
  }[];
}

export const STATION_CONSTANTS = {
  STATION_NAME: "Maitri",
  STATION_CODE: "IND-AQ-02",
  COORDINATES_DISPLAY: "70°45′57″S 11°44′09″E",
  LOCATION: "Schirmacher Oasis, Queen Maud Land, East Antarctica",
  ESTABLISHED: 1989,
  ELEVATION: "117 m",
  LAKE_SOURCE: "Lake Priyadarshini",
  GENERATOR_NAMES: ["Ravi", "Surya", "Aditya"] as const,
  FUEL_TYPE: "Jet A-1 (Aviation Turbine Fuel - Polar Blend)",
  MIN_FUEL_RESERVE_DAYS: 30,
  FREEZE_PROTECTION_TEMP_C: 2.0,
};

export const INITIAL_VITALS: StationVitals = {
  coordinates: {
    lat: "70°45′57″S",
    lng: "11°44′09″E",
    elevationM: 117,
    region: "Queen Maud Land",
    subRegion: "Schirmacher Oasis",
  },
  commissionYear: 1989,
  winterCapacity: 25,
  summerCapacity: 65,
  currentOccupancy: 23,
  externalTemp: {
    value: -28.4,
    unit: "°C",
    timestamp: new Date().toISOString(),
    source: "SIMULATED",
    status: "NORMAL",
    thresholdMin: -55.0,
    thresholdMax: 8.0,
  },
  windSpeed: {
    value: 48.6,
    unit: "knots",
    timestamp: new Date().toISOString(),
    source: "SIMULATED",
    status: "WATCH",
    thresholdMin: 0,
    thresholdMax: 95.0,
  },
  atmosphericPressure: {
    value: 986.2,
    unit: "hPa",
    timestamp: new Date().toISOString(),
    source: "SIMULATED",
    status: "NORMAL",
  },
  windChill: {
    value: -46.8,
    unit: "°C",
    timestamp: new Date().toISOString(),
    source: "SIMULATED",
    status: "WATCH",
  },
  generatorOutput: {
    value: 58.2,
    unit: "kVA",
    timestamp: new Date().toISOString(),
    source: "SIMULATED",
    status: "NORMAL",
  },
  totalPowerDemand: {
    value: 44.8,
    unit: "kW",
    timestamp: new Date().toISOString(),
    source: "SIMULATED",
    status: "NORMAL",
  },
  fuelAutonomyDays: {
    value: 142,
    unit: "days",
    timestamp: new Date().toISOString(),
    source: "SIMULATED",
    status: "NORMAL",
    thresholdMin: 45,
  },
  fuelStorageTotalLiters: {
    value: 120000,
    unit: "L",
    timestamp: new Date().toISOString(),
    source: "SIMULATED",
    status: "NORMAL",
  },
  fuelStorageCurrentLiters: {
    value: 84620,
    unit: "L",
    timestamp: new Date().toISOString(),
    source: "SIMULATED",
    status: "NORMAL",
  },
  lakePriyadarshiniTemp: {
    value: 1.4,
    unit: "°C",
    timestamp: new Date().toISOString(),
    source: "SIMULATED",
    status: "NORMAL",
  },
  waterIntakeRateLph: {
    value: 620,
    unit: "L/h",
    timestamp: new Date().toISOString(),
    source: "SIMULATED",
    status: "NORMAL",
  },
  waterStorageLiters: {
    value: 8400,
    unit: "L",
    timestamp: new Date().toISOString(),
    source: "SIMULATED",
    status: "NORMAL",
  },
  blackwaterDigesterTemp: {
    value: 36.8,
    unit: "°C",
    timestamp: new Date().toISOString(),
    source: "SIMULATED",
    status: "NORMAL",
  },
  incineratorAshWeightKg: {
    value: 42.5,
    unit: "kg",
    timestamp: new Date().toISOString(),
    source: "SIMULATED",
    status: "NORMAL",
  },
  satcomBandwidthKbps: {
    value: 512,
    unit: "kbps",
    timestamp: new Date().toISOString(),
    source: "SIMULATED",
    status: "WATCH",
  },
  satcomLatencyMs: {
    value: 780,
    unit: "ms",
    timestamp: new Date().toISOString(),
    source: "SIMULATED",
    status: "NORMAL",
  },
  syncState: "LIVE",
  generators: [
    {
      id: "gen-01",
      name: "Ravi",
      status: "ONLINE",
      loadPercent: 74,
      hoursSinceOverhaul: 2840,
      fuelRateLph: 16.4,
      oilPressureKpa: 395,
      coolantTempC: 84.5,
      vibrationMmSec: 1.8,
    },
    {
      id: "gen-02",
      name: "Surya",
      status: "STANDBY",
      loadPercent: 0,
      hoursSinceOverhaul: 120,
      fuelRateLph: 0,
      oilPressureKpa: 0,
      coolantTempC: 38.0,
      vibrationMmSec: 0.1,
    },
    {
      id: "gen-03",
      name: "Aditya",
      status: "STANDBY",
      loadPercent: 0,
      hoursSinceOverhaul: 4190,
      fuelRateLph: 0,
      oilPressureKpa: 0,
      coolantTempC: 22.0,
      vibrationMmSec: 0.0,
    },
  ],
  lifeSupportAlerts: [
    {
      id: "alt-01",
      subsystem: "TRACE-HEATING // LINE-B",
      severity: "WARNING",
      message: "Pipeline heat-trace circuit #2 current draw lower than baseline (6.2A vs 8.0A nominal)",
      actionRequired: "Inspect junction box BJ-04 for snow ingress before gale peak",
      timestamp: "14m ago",
    },
    {
      id: "alt-02",
      subsystem: "FUEL // DAY-TANK-01",
      severity: "INFO",
      message: "Automated pump cycle completed: 420 L transfer from Bulk Tank #3 to Day Tank #1",
      actionRequired: "Routine log entry confirmed",
      timestamp: "48m ago",
    },
  ],
};
