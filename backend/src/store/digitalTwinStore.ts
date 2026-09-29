export type StationId = "BHARATI" | "MAITRI";

export type SourceType =
  | "OFFICIAL"
  | "DOCUMENTARY"
  | "PROJECT_ASSUMPTION"
  | "INFERENCE"
  | "LIVE_SENSOR"
  | "SIMULATED";

export type HealthState = "NORMAL" | "WATCH" | "MAINTENANCE_DUE" | "DEGRADED" | "CRITICAL";

export interface Provenance {
  sourceType: SourceType;
  sourceName: string;
  sourceRef: string;
  confidence: "HIGH" | "MEDIUM" | "LOW" | "UNVERIFIED" | "SIMULATED";
  verificationStatus: string;
}

export interface StationIdentity {
  id: StationId;
  name: string;
  country: string;
  region: string;
  location: string;
  coordinates: { lat: number; lng: number; elevation: number };
  commissioningYear: number;
  capacity: { mainBuilding: number; summerShelter: number; totalMax: number };
  zones?: string[];
  waterSource: string;
  provenance: Provenance;
}

export interface GeneratorAsset {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
  ratedCapacityKw: number;
  currentOutputKw: number;
  loadPercentage: number;
  fuelType: string;
  fuelConsumptionLh: number;
  runtimeHours: number;
  temperatureC: number;
  freqHz: number;
  status: "ONLINE" | "STANDBY" | "MAINT" | "FAULT";
  lastServiceDate: string;
  nextServiceHours: number;
}

export interface InfrastructureAsset {
  id: string;
  name: string;
  category: "Building" | "Lab" | "Power" | "Water" | "Waste" | "Logistics" | "Science";
  location: string;
  conditionScore: number;
  conditionState: HealthState;
  pipelineCondition?: string;
  thermalStress?: string;
  wearIndicator?: number;
  lastInspection: string;
  provenance: Provenance;
}

export interface InventoryCategory {
  id: string;
  name: string;
  itemCount: number;
  currentStockUnits: number;
  dailyConsumptionUnits: number;
  daysRemaining: number;
  status: HealthState;
  storageLocation: string;
}

export interface NcporSeriesPoint {
  timestamp: number;
  value: number;
}

export interface NcporLiveFeed {
  isLive: boolean;
  stationName: string;
  sourceUrl: string;
  observationDate: string;
  lastSyncedAt: string;
  windKnots: number;
  windMps: number;
  stats?: {
    temperature: { avg: number | null; min: number | null; max: number | null };
    windSpeedMps: { avg: number | null; min: number | null; max: number | null };
    airPressureHpa: { avg: number | null; min: number | null; max: number | null };
    relativeHumidityPct: { avg: number | null; min: number | null; max: number | null };
  };
  series?: {
    temperature: NcporSeriesPoint[];
    windSpeed: NcporSeriesPoint[];
    airPressure: NcporSeriesPoint[];
    humidity: NcporSeriesPoint[];
  };
}

export interface EnvironmentalTelemetry {
  tempC: number;
  tempMinC: number;
  tempMaxC: number;
  windSpeedKmh: number;
  windDirectionDeg: number;
  windStatus: string;
  pressureHpa: number;
  humidityPct: number;
  blizzardHoursYtd: number;
  solarRadiationWm2: number;
  radiationGammaNgyh: number;
  blackCarbonUgM3: number;
  magneticFieldnT: number;
  seaIceThicknessM: number;
  resupplyWindowStatus: "OPEN" | "POSSIBLE" | "RESTRICTED" | "UNAVAILABLE";
  liveFeed?: NcporLiveFeed;
}

export interface SatelliteUplink {
  satelliteName: string;
  linkStatus: "LIVE" | "DEGRADED" | "OFFLINE" | "SYNCING";
  latencyMs: number;
  bandwidthMbps: number;
  edgeBufferUsedPct: number;
  queuedPriorityLogs: number;
  nextWindowMinutes: number;
}

export interface TelemetryLog {
  timestamp: string;
  level: "INFO" | "WARN" | "CRITICAL";
  source: string;
  message: string;
}

export interface SimulationResult {
  scenarioId: string;
  scenarioName: string;
  parameters: Record<string, any>;
  baseline: {
    powerDemandKw: number;
    fuelConsumptionDayL: number;
    fuelAutonomyDays: number;
    survivabilityScore: number;
    stationHealth: string;
  };
  simulated: {
    powerDemandKw: number;
    fuelConsumptionDayL: number;
    fuelAutonomyDays: number;
    survivabilityScore: number;
    stationHealth: string;
    criticalAlerts: string[];
    recommendedActions: string[];
  };
}

export const STATIONS: Record<StationId, StationIdentity> = {
  BHARATI: {
    id: "BHARATI",
    name: "Bharati Research Station",
    country: "India",
    region: "Larsemann Hills, Antarctica",
    location: "North Grovnes Island, Thala Fjord / Quilty Bay",
    coordinates: { lat: -69.4068, lng: 76.19525, elevation: 35 },
    commissioningYear: 2012,
    capacity: { mainBuilding: 47, summerShelter: 25, totalMax: 72 },
    zones: [
      "Zone 1: Infrastructure Development",
      "Zone 2: Magnetic Silence Zone (Atmospheric & Upper Sci)",
      "Zone 3: Reserved for Future Expansion",
      "Zone 4: Pristine Environmental Sanctuary",
      "Zone 5: ISRO Earth Station Antenna Field"
    ],
    waterSource: "Sea Water Pump House (Desalination & Treatment)",
    provenance: {
      sourceType: "OFFICIAL",
      sourceName: "NCPOR / Antarctic Treaty Inspection Report",
      sourceRef: "BMP-2012 / MoES Doc",
      confidence: "HIGH",
      verificationStatus: "VERIFIED"
    }
  },
  MAITRI: {
    id: "MAITRI",
    name: "Maitri Research Station",
    country: "India",
    region: "Schirmacher Oasis, Dronning Maud Land",
    location: "Schirmacher Oasis, Rocky Plateau near Lake Priyadarshini",
    coordinates: { lat: -70.766, lng: 11.733, elevation: 117 },
    commissioningYear: 1989,
    capacity: { mainBuilding: 25, summerShelter: 40, totalMax: 65 },
    waterSource: "Lake Priyadarshini Water Intake System",
    provenance: {
      sourceType: "OFFICIAL",
      sourceName: "NCPOR / MoES Gazette & Treaty Records",
      sourceRef: "Maitri-1989 / NCPOR Annual Report",
      confidence: "HIGH",
      verificationStatus: "VERIFIED"
    }
  }
};

export const GENERATORS_DATA: Record<StationId, GeneratorAsset[]> = {
  BHARATI: [
    {
      id: "BHARATI-CHP-01",
      name: "CHP Unit 01 (Primary)",
      type: "CHP (Combined Heat & Power)",
      manufacturer: "MAN",
      ratedCapacityKw: 135,
      currentOutputKw: 82.5,
      loadPercentage: 61,
      fuelType: "Jet A-1 / ATF (Polar Grade)",
      fuelConsumptionLh: 22.4,
      runtimeHours: 18450,
      temperatureC: 84,
      freqHz: 50.01,
      status: "ONLINE",
      lastServiceDate: "2025-02-15",
      nextServiceHours: 20000
    },
    {
      id: "BHARATI-CHP-02",
      name: "CHP Unit 02 (Secondary)",
      type: "CHP (Combined Heat & Power)",
      manufacturer: "MAN",
      ratedCapacityKw: 135,
      currentOutputKw: 65.0,
      loadPercentage: 48,
      fuelType: "Jet A-1 / ATF (Polar Grade)",
      fuelConsumptionLh: 18.2,
      runtimeHours: 17200,
      temperatureC: 81,
      freqHz: 50.02,
      status: "ONLINE",
      lastServiceDate: "2025-01-20",
      nextServiceHours: 20000
    },
    {
      id: "BHARATI-CHP-03",
      name: "CHP Unit 03 (Standby)",
      type: "CHP (Combined Heat & Power)",
      manufacturer: "MAN",
      ratedCapacityKw: 135,
      currentOutputKw: 0,
      loadPercentage: 0,
      fuelType: "Jet A-1 / ATF (Polar Grade)",
      fuelConsumptionLh: 0,
      runtimeHours: 14100,
      temperatureC: 18,
      freqHz: 0,
      status: "STANDBY",
      lastServiceDate: "2024-12-10",
      nextServiceHours: 20000
    }
  ],
  MAITRI: [
    {
      id: "MAITRI-GEN-RAVI",
      name: "Ravi Generator Group",
      type: "Diesel Generator Set",
      manufacturer: "Kirloskar / Cummins",
      ratedCapacityKw: 100,
      currentOutputKw: 78.0,
      loadPercentage: 78,
      fuelType: "High Speed Diesel (Polar)",
      fuelConsumptionLh: 21.0,
      runtimeHours: 32100,
      temperatureC: 85,
      freqHz: 50.01,
      status: "ONLINE",
      lastServiceDate: "2025-01-10",
      nextServiceHours: 35000
    },
    {
      id: "MAITRI-GEN-SURYA",
      name: "Surya Generator Group",
      type: "Diesel Generator Set",
      manufacturer: "Kirloskar / Cummins",
      ratedCapacityKw: 100,
      currentOutputKw: 64.0,
      loadPercentage: 64,
      fuelType: "High Speed Diesel (Polar)",
      fuelConsumptionLh: 17.5,
      runtimeHours: 29800,
      temperatureC: 82,
      freqHz: 50.02,
      status: "ONLINE",
      lastServiceDate: "2025-02-01",
      nextServiceHours: 35000
    },
    {
      id: "MAITRI-GEN-ADITYA",
      name: "Aditya Backup Group",
      type: "Diesel Generator Set",
      manufacturer: "Kirloskar",
      ratedCapacityKw: 100,
      currentOutputKw: 0,
      loadPercentage: 0,
      fuelType: "High Speed Diesel (Polar)",
      fuelConsumptionLh: 0,
      runtimeHours: 21400,
      temperatureC: 15,
      freqHz: 0,
      status: "STANDBY",
      lastServiceDate: "2024-11-15",
      nextServiceHours: 25000
    }
  ]
};

export const INFRASTRUCTURE_DATA: Record<StationId, InfrastructureAsset[]> = {
  BHARATI: [
    {
      id: "BH-INF-01",
      name: "Main Station Building (47-Bed Modular Block)",
      category: "Building",
      location: "Zone 1 Main Block",
      conditionScore: 94,
      conditionState: "NORMAL",
      thermalStress: "Low (Automated HVAC Active)",
      lastInspection: "2025-02-28",
      provenance: { sourceType: "OFFICIAL", sourceName: "NCPOR Inspection", sourceRef: "Inspection 2025", confidence: "HIGH", verificationStatus: "VERIFIED" }
    },
    {
      id: "BH-INF-02",
      name: "Sea Water Pump House",
      category: "Water",
      location: "Coastal Intake Line",
      conditionScore: 88,
      conditionState: "NORMAL",
      pipelineCondition: "Trace Heated & Insulated - Good",
      lastInspection: "2025-03-01",
      provenance: { sourceType: "OFFICIAL", sourceName: "Sea Water Pump House Records", sourceRef: "NCPOR Water Doc", confidence: "HIGH", verificationStatus: "VERIFIED" }
    },
    {
      id: "BH-INF-03",
      name: "Combined Heat & Power (CHP) Engine Room",
      category: "Power",
      location: "Zone 1 Utility Module",
      conditionScore: 91,
      conditionState: "NORMAL",
      wearIndicator: 12,
      lastInspection: "2025-02-15",
      provenance: { sourceType: "OFFICIAL", sourceName: "MAN Engine Logs", sourceRef: "CHP Maintenance 2020-2025", confidence: "HIGH", verificationStatus: "VERIFIED" }
    },
    {
      id: "BH-INF-04",
      name: "ISRO Ground Station Antenna Complex (C, X & S Band)",
      category: "Science",
      location: "Zone 5 Antenna Zone",
      conditionScore: 96,
      conditionState: "NORMAL",
      lastInspection: "2025-02-20",
      provenance: { sourceType: "OFFICIAL", sourceName: "NRSC / ISRO Data Link Log", sourceRef: "NRSC Shadnagar Link", confidence: "HIGH", verificationStatus: "VERIFIED" }
    },
    {
      id: "BH-INF-05",
      name: "Four Designated Laboratories (Elec, Life, Chem, Earth)",
      category: "Lab",
      location: "Main Building Ground Floor",
      conditionScore: 95,
      conditionState: "NORMAL",
      lastInspection: "2025-01-10",
      provenance: { sourceType: "OFFICIAL", sourceName: "NCPOR Lab Registry", sourceRef: "Bharati Science Wing", confidence: "HIGH", verificationStatus: "VERIFIED" }
    },
    {
      id: "BH-INF-06",
      name: "Wastewater Treatment & Incineration Module",
      category: "Waste",
      location: "Zone 1 Waste Bay",
      conditionScore: 82,
      conditionState: "WATCH",
      wearIndicator: 24,
      lastInspection: "2025-02-12",
      provenance: { sourceType: "OFFICIAL", sourceName: "Effluent Study 2015-2022", sourceRef: "Wastewater Baseline", confidence: "HIGH", verificationStatus: "VERIFIED" }
    }
  ],
  MAITRI: [
    {
      id: "MT-INF-01",
      name: "Maitri Main Station Building",
      category: "Building",
      location: "Schirmacher Oasis Center",
      conditionScore: 82,
      conditionState: "WATCH",
      thermalStress: "Moderate (Commissioned 1989)",
      lastInspection: "2025-01-15",
      provenance: { sourceType: "OFFICIAL", sourceName: "Antarctic Treaty Inspection", sourceRef: "Maitri Inspection 2024", confidence: "HIGH", verificationStatus: "VERIFIED" }
    },
    {
      id: "MT-INF-02",
      name: "Priyadarshini Lake Water Intake & Pump Station",
      category: "Water",
      location: "Lake Priyadarshini Shore",
      conditionScore: 85,
      conditionState: "NORMAL",
      pipelineCondition: "Trace Heating Active - 18kW",
      lastInspection: "2025-02-05",
      provenance: { sourceType: "OFFICIAL", sourceName: "Maitri Hydrology Log", sourceRef: "Priyadarshini Line", confidence: "HIGH", verificationStatus: "VERIFIED" }
    },
    {
      id: "MT-INF-03",
      name: "MARA Atmospheric Radar Station",
      category: "Science",
      location: "Outer Science Field",
      conditionScore: 90,
      conditionState: "NORMAL",
      lastInspection: "2025-01-25",
      provenance: { sourceType: "OFFICIAL", sourceName: "MARA Radar Log", sourceRef: "Atmospheric Science Wing", confidence: "HIGH", verificationStatus: "VERIFIED" }
    },
    {
      id: "MT-INF-04",
      name: "Power House (Ravi/Surya/Aditya Bay)",
      category: "Power",
      location: "Utility Annex",
      conditionScore: 80,
      conditionState: "WATCH",
      wearIndicator: 35,
      lastInspection: "2025-02-10",
      provenance: { sourceType: "OFFICIAL", sourceName: "Power House Logbook", sourceRef: "Generator Maintenance", confidence: "HIGH", verificationStatus: "VERIFIED" }
    }
  ]
};

export const LOGISTICS_INVENTORY: Record<StationId, InventoryCategory[]> = {
  BHARATI: [
    { id: "INV-BH-01", name: "Polar Jet A-1 Fuel Reserves", itemCount: 12, currentStockUnits: 285000, dailyConsumptionUnits: 980, daysRemaining: 290, status: "NORMAL", storageLocation: "Fuel Farm Tank Bay 1-4" },
    { id: "INV-BH-02", name: "Frozen & Refrigerated Provisions", itemCount: 145, currentStockUnits: 18500, dailyConsumptionUnits: 85, daysRemaining: 217, status: "NORMAL", storageLocation: "Cold Storage Module A" },
    { id: "INV-BH-03", name: "Dry Food & Staples", itemCount: 210, currentStockUnits: 24000, dailyConsumptionUnits: 95, daysRemaining: 252, status: "NORMAL", storageLocation: "Dry Cargo Bay B" },
    { id: "INV-BH-04", name: "Medical & Critical Pharmaceuticals", itemCount: 95, currentStockUnits: 3400, dailyConsumptionUnits: 8, daysRemaining: 425, status: "NORMAL", storageLocation: "Station Infirmary" },
    { id: "INV-BH-05", name: "MAN CHP Spares & Glycol Coolant (550L)", itemCount: 42, currentStockUnits: 650, dailyConsumptionUnits: 1.5, daysRemaining: 433, status: "NORMAL", storageLocation: "Workshop Module 2" },
    { id: "INV-BH-06", name: "Desalination & Pump House Replacement Spares", itemCount: 28, currentStockUnits: 140, dailyConsumptionUnits: 0.2, daysRemaining: 700, status: "NORMAL", storageLocation: "Pump House Utility Shed" }
  ],
  MAITRI: [
    { id: "INV-MT-01", name: "High Speed Diesel (Polar Grade)", itemCount: 8, currentStockUnits: 195000, dailyConsumptionUnits: 920, daysRemaining: 211, status: "WATCH", storageLocation: "Main Fuel Storage Tank Area" },
    { id: "INV-MT-02", name: "Frozen & Cold Storage Rations", itemCount: 120, currentStockUnits: 12400, dailyConsumptionUnits: 75, daysRemaining: 165, status: "NORMAL", storageLocation: "Cold Storage Container" },
    { id: "INV-MT-03", name: "Dry Rations & Pantry", itemCount: 180, currentStockUnits: 16800, dailyConsumptionUnits: 80, daysRemaining: 210, status: "NORMAL", storageLocation: "Main Kitchen Pantry" },
    { id: "INV-MT-04", name: "Emergency Trauma & Clinic Supplies", itemCount: 78, currentStockUnits: 2200, dailyConsumptionUnits: 6, daysRemaining: 366, status: "NORMAL", storageLocation: "Medical Room" },
    { id: "INV-MT-05", name: "Generator & Vehicle Spare Parts", itemCount: 65, currentStockUnits: 410, dailyConsumptionUnits: 1.2, daysRemaining: 341, status: "NORMAL", storageLocation: "Central Workshop Shed" }
  ]
};

export const ENVIRONMENT_DATA: Record<StationId, EnvironmentalTelemetry> = {
  BHARATI: {
    tempC: -22.4,
    tempMinC: -38.9,
    tempMaxC: 7.6,
    windSpeedKmh: 38.5,
    windDirectionDeg: 145,
    windStatus: "MODERATE_EASTERLY",
    pressureHpa: 988.4,
    humidityPct: 68,
    blizzardHoursYtd: 32.3,
    solarRadiationWm2: 120,
    radiationGammaNgyh: 125.0, // BARC IERMON 100-750 nGy/h
    blackCarbonUgM3: 0.14,
    magneticFieldnT: 54210,
    seaIceThicknessM: 1.4,
    resupplyWindowStatus: "OPEN"
  },
  MAITRI: {
    tempC: -24.8,
    tempMinC: -40.3,
    tempMaxC: 8.9,
    windSpeedKmh: 42.0,
    windDirectionDeg: 160,
    windStatus: "KATABATIC_SPIKE",
    pressureHpa: 982.1,
    humidityPct: 62,
    blizzardHoursYtd: 45.0,
    solarRadiationWm2: 95,
    radiationGammaNgyh: 110.0,
    blackCarbonUgM3: 0.18,
    magneticFieldnT: 51840,
    seaIceThicknessM: 1.8,
    resupplyWindowStatus: "POSSIBLE"
  }
};

export const SATELLITE_UPLINK: Record<StationId, SatelliteUplink> = {
  BHARATI: {
    satelliteName: "INSAT-3DR / NRSC C-Band (Shadnagar Link)",
    linkStatus: "LIVE",
    latencyMs: 42,
    bandwidthMbps: 45.0,
    edgeBufferUsedPct: 12,
    queuedPriorityLogs: 0,
    nextWindowMinutes: 0
  },
  MAITRI: {
    satelliteName: "INSAT-3DS / DROMLAN Satellite Mesh",
    linkStatus: "LIVE",
    latencyMs: 58,
    bandwidthMbps: 24.0,
    edgeBufferUsedPct: 18,
    queuedPriorityLogs: 2,
    nextWindowMinutes: 0
  }
};

export const TELEMETRY_LOGS: Record<StationId, TelemetryLog[]> = {
  BHARATI: [
    { timestamp: "12:44:02 UTC", level: "INFO", source: "SYS_CORE", message: "Telemetry sync established with INSAT-3DR." },
    { timestamp: "12:44:15 UTC", level: "INFO", source: "CHP_CTRL", message: "CHP Unit 1 auto-throttle engaged. Load balanced at 61%." },
    { timestamp: "12:45:01 UTC", level: "WARN", source: "ENV_MON", message: "Katabatic wind spike detected: Sector North-East." },
    { timestamp: "12:45:18 UTC", level: "INFO", source: "DESAL_SYS", message: "Sea Water intake pump cycle complete. Salinity nominal." },
    { timestamp: "12:46:05 UTC", level: "INFO", source: "ISRO_LINK", message: "C-band data burst transmitted to NRSC Shadnagar." }
  ],
  MAITRI: [
    { timestamp: "12:44:02 UTC", level: "INFO", source: "SYS_CORE", message: "Maitri Edge Gateway operational." },
    { timestamp: "12:44:15 UTC", level: "INFO", source: "GEN_RAVI", message: "Ravi generator output steady at 78 kW." },
    { timestamp: "12:45:01 UTC", level: "WARN", source: "ENV_MON", message: "Priyadarshini trace heat loop current active." },
    { timestamp: "12:45:18 UTC", level: "INFO", source: "MARA_RADAR", message: "MARA atmospheric wind profile scan complete." },
    { timestamp: "12:46:05 UTC", level: "INFO", source: "SAT_MESH", message: "DROMLAN satellite mesh heartbeat verified." }
  ]
};

export function runSimulation(stationId: StationId, scenarioId: string, params: Record<string, any> = {}): SimulationResult {
  const env = ENVIRONMENT_DATA[stationId];
  const generators = GENERATORS_DATA[stationId];
  const totalGenOutput = generators.reduce((acc, g) => acc + g.currentOutputKw, 0);
  const fuelReserves = LOGISTICS_INVENTORY[stationId][0].currentStockUnits;
  const currentDailyFuel = LOGISTICS_INVENTORY[stationId][0].dailyConsumptionUnits;
  const currentAutonomy = Math.round(fuelReserves / currentDailyFuel);

  const baseline = {
    powerDemandKw: totalGenOutput,
    fuelConsumptionDayL: currentDailyFuel,
    fuelAutonomyDays: currentAutonomy,
    survivabilityScore: 94,
    stationHealth: "OPTIMAL"
  };

  let simPowerKw = totalGenOutput;
  let simFuelDayL = currentDailyFuel;
  let criticalAlerts: string[] = [];
  let recommendedActions: string[] = [];
  let scenarioName = scenarioId;

  if (scenarioId === "EXTREME_WEATHER") {
    scenarioName = "Scenario A — Extreme Katabatic Storm & Temperature Drop (-40°C)";
    const tempDrop = params.tempC ? Math.abs(params.tempC - env.tempC) : 18;
    const heatingIncreasePct = tempDrop * 2.2;
    simPowerKw = Math.round(totalGenOutput * (1 + heatingIncreasePct / 100));
    simFuelDayL = Math.round(currentDailyFuel * (1 + heatingIncreasePct / 100));
    criticalAlerts.push(`Katabatic storm alert: Wind > 120 km/h detected.`);
    criticalAlerts.push(`Heating load increased by ${heatingIncreasePct.toFixed(1)}%. Thermal stress elevated.`);
    recommendedActions.push("Engage secondary trace heating circuit on intake line.");
    recommendedActions.push("Restrict outdoor movements and enable Zone 1 storm shutters.");
  } else if (scenarioId === "GENERATOR_FAILURE") {
    scenarioName = "Scenario B — Primary Generator Trip / Failure";
    const primaryGen = generators[0];
    const lostPower = primaryGen.currentOutputKw;
    simPowerKw = totalGenOutput - lostPower;
    simFuelDayL = Math.round(currentDailyFuel * 0.75);
    criticalAlerts.push(`CRITICAL: ${primaryGen.name} TRIPPED! Lost ${lostPower} kW generation.`);
    criticalAlerts.push(`UPS Battery auto-engaged. Instantaneous load shedding initiated.`);
    recommendedActions.push(`Spin up standby generator (${generators[2]?.name || 'Backup Unit'}).`);
    recommendedActions.push("Isolate non-critical scientific loads in Zone 2 & 4.");
  } else if (scenarioId === "INCREASED_ENERGY_DEMAND") {
    scenarioName = "Scenario C — Peak Scientific Campaign & Station Expansion (+40% Load)";
    simPowerKw = Math.round(totalGenOutput * 1.4);
    simFuelDayL = Math.round(currentDailyFuel * 1.38);
    criticalAlerts.push("Peak load threshold warning: Generation capacity at 88%.");
    recommendedActions.push("Monitor CHP oil temperature & glycol coolant flow.");
    recommendedActions.push("Schedule fuel transfer from Tank Module 3 to Day Tanks.");
  } else if (scenarioId === "SUPPLY_DELAY") {
    scenarioName = "Scenario D — Austral Summer Resupply Vessel Sea-Ice Blockade (60-day delay)";
    const delayDays = params.delayDays || 60;
    simPowerKw = totalGenOutput;
    simFuelDayL = currentDailyFuel;
    criticalAlerts.push(`Resupply vessel delayed by ${delayDays} days due to heavy sea-ice pack.`);
    criticalAlerts.push(`Predicted fuel autonomy drops from ${currentAutonomy} days to ${currentAutonomy - delayDays} days.`);
    recommendedActions.push("Implement eco-mode heating schedules in non-essential modules.");
    recommendedActions.push("Request DROMLAN air cargo emergency drop if autonomy drops below 100 days.");
  } else if (scenarioId === "COMMUNICATION_OUTAGE") {
    scenarioName = "Scenario E — Orbital Satellite Link Interruption (Store & Forward Test)";
    simPowerKw = totalGenOutput;
    simFuelDayL = currentDailyFuel;
    criticalAlerts.push("Satellite signal lost. Switched to Edge Gateway buffering mode.");
    criticalAlerts.push("P0 Emergency & P1 Critical Infra logs queued in NVMe storage.");
    recommendedActions.push("Verify edge store-and-forward buffer capacity.");
    recommendedActions.push("Re-orient dish backup toward contingency satellite.");
  }

  const simAutonomyDays = Math.round(fuelReserves / simFuelDayL);
  const scoreDrop = simAutonomyDays < 150 ? 25 : simAutonomyDays < 200 ? 12 : 5;
  const survivabilityScore = Math.max(30, 94 - scoreDrop - (scenarioId === "GENERATOR_FAILURE" ? 20 : 0));
  const stationHealth = survivabilityScore > 80 ? "NORMAL" : survivabilityScore > 60 ? "WATCH" : "CRITICAL";

  return {
    scenarioId,
    scenarioName,
    parameters: params,
    baseline,
    simulated: {
      powerDemandKw: simPowerKw,
      fuelConsumptionDayL: simFuelDayL,
      fuelAutonomyDays: simAutonomyDays,
      survivabilityScore,
      stationHealth,
      criticalAlerts,
      recommendedActions
    }
  };
}
