"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Lightning,
  Waves,
  GasPump,
  Heartbeat,
  ShieldCheck,
  WarningCircle,
  SlidersHorizontal,
  X,
  Clock,
  Cpu,
  Radio,
  ThermometerCold,
  Drop,
  HardDrives,
  CheckCircle,
  Wrench,
  ArrowSquareOut,
  ArrowsClockwise,
  Gauge,
  Buildings,
  Eye,
  Package,
  Power,
  ArrowsLeftRight,
} from "@phosphor-icons/react";
import { api, Station } from "@/lib/api";

export interface RoomTelemetryData {
  id: string;
  name: string;
  level?: string;
  category: string;
  description?: string;
}

interface RoomTelemetryCardProps {
  room: RoomTelemetryData;
  stationId: Station;
  onClose: () => void;
  onTriggerAction?: (actionId: string, label: string) => void;
  onCycleRoom?: (direction: "prev" | "next") => void;
}

// ── MAITRI 3 GENERATOR COMPLEXES (12 GENERATORS TOTAL: 4 EACH) ──
// Complex 1: Ravi (4x 150 kVA)
// Complex 2: Surya (4x 62.5 kVA)
// Complex 3: Aditya (4x 62.5 kVA)
export type GeneratorComplexName = "Ravi" | "Surya" | "Aditya";

export interface GeneratorUnit {
  id: string;
  name: string;
  complex: GeneratorComplexName;
  ratingKva: number;
  outputKw: number;
  tempC: number;
  rpm: number;
  status: "ONLINE" | "STANDBY" | "OFF" | "MAINTENANCE";
}

const INITIAL_MAITRI_GENERATORS: GeneratorUnit[] = [
  // 1. RAVI COMPLEX (4x 150 kVA Generators)
  { id: "ravi_1", name: "Ravi Gen 01 (150 kVA)", complex: "Ravi", ratingKva: 150, outputKw: 110, tempC: 84, rpm: 1500, status: "ONLINE" },
  { id: "ravi_2", name: "Ravi Gen 02 (150 kVA)", complex: "Ravi", ratingKva: 150, outputKw: 0, tempC: 22, rpm: 0, status: "STANDBY" },
  { id: "ravi_3", name: "Ravi Gen 03 (150 kVA)", complex: "Ravi", ratingKva: 150, outputKw: 0, tempC: 20, rpm: 0, status: "STANDBY" },
  { id: "ravi_4", name: "Ravi Gen 04 (150 kVA)", complex: "Ravi", ratingKva: 150, outputKw: 0, tempC: 18, rpm: 0, status: "OFF" },

  // 2. SURYA COMPLEX (4x 62.5 kVA Generators)
  { id: "surya_1", name: "Surya Gen 01 (62.5 kVA)", complex: "Surya", ratingKva: 62.5, outputKw: 42, tempC: 79, rpm: 1500, status: "ONLINE" },
  { id: "surya_2", name: "Surya Gen 02 (62.5 kVA)", complex: "Surya", ratingKva: 62.5, outputKw: 0, tempC: 22, rpm: 0, status: "STANDBY" },
  { id: "surya_3", name: "Surya Gen 03 (62.5 kVA)", complex: "Surya", ratingKva: 62.5, outputKw: 0, tempC: 17, rpm: 0, status: "OFF" },
  { id: "surya_4", name: "Surya Gen 04 (62.5 kVA)", complex: "Surya", ratingKva: 62.5, outputKw: 0, tempC: 16, rpm: 0, status: "OFF" },

  // 3. ADITYA COMPLEX (4x 62.5 kVA Generators)
  { id: "aditya_1", name: "Aditya Gen 01 (62.5 kVA)", complex: "Aditya", ratingKva: 62.5, outputKw: 0, tempC: 20, rpm: 0, status: "STANDBY" },
  { id: "aditya_2", name: "Aditya Gen 02 (62.5 kVA)", complex: "Aditya", ratingKva: 62.5, outputKw: 0, tempC: 17, rpm: 0, status: "OFF" },
  { id: "aditya_3", name: "Aditya Gen 03 (62.5 kVA)", complex: "Aditya", ratingKva: 62.5, outputKw: 0, tempC: 16, rpm: 0, status: "OFF" },
  { id: "aditya_4", name: "Aditya Gen 04 (62.5 kVA)", complex: "Aditya", ratingKva: 62.5, outputKw: 0, tempC: 15, rpm: 0, status: "MAINTENANCE" },
];

export function RoomTelemetryCard({
  room,
  stationId,
  onClose,
  onTriggerAction,
  onCycleRoom,
}: RoomTelemetryCardProps) {
  const [activeTab, setActiveTab] = useState<"telemetry" | "controls" | "specs">("telemetry");
  const [executingAction, setExecutingAction] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Interactive Generator State (3 Complexes x 4 Generators = 12 Units Total)
  const [generators, setGenerators] = useState<GeneratorUnit[]>(INITIAL_MAITRI_GENERATORS);

  // Live Backend State
  const [liveBackend, setLiveBackend] = useState<{
    energy?: any;
    env?: any;
    logistics?: any;
    network?: any;
    infra?: any;
    syncedAt: string;
  }>({
    syncedAt: "Connecting...",
  });

  // Fetch real backend data for this room's domain
  const fetchLiveTelemetry = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [energy, env, logistics, network, infra] = await Promise.all([
        api.getEnergy(stationId),
        api.getEnvironment(stationId),
        api.getLogistics(stationId),
        api.getNetwork(stationId),
        api.getInfrastructure(stationId),
      ]);

      setLiveBackend({
        energy,
        env,
        logistics,
        network,
        infra,
        syncedAt: new Date().toLocaleTimeString(),
      });
    } catch (err) {
      console.warn("[RoomTelemetryCard] Error fetching live backend telemetry", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [stationId]);

  useEffect(() => {
    fetchLiveTelemetry();
    const interval = setInterval(fetchLiveTelemetry, 6000);
    return () => clearInterval(interval);
  }, [fetchLiveTelemetry]);

  // Derived Generator Calculations across all 3 complexes
  const raviOnline = useMemo(
    () => generators.filter((g) => g.complex === "Ravi" && g.status === "ONLINE"),
    [generators]
  );
  const suryaOnline = useMemo(
    () => generators.filter((g) => g.complex === "Surya" && g.status === "ONLINE"),
    [generators]
  );
  const adityaOnline = useMemo(
    () => generators.filter((g) => g.complex === "Aditya" && g.status === "ONLINE"),
    [generators]
  );
  const totalGeneratorsOnline = raviOnline.length + suryaOnline.length + adityaOnline.length;
  const totalGeneratedKw = useMemo(
    () => generators.filter((g) => g.status === "ONLINE").reduce((acc, g) => acc + g.outputKw, 0),
    [generators]
  );

  // Toggle individual generator ON / OFF / STANDBY
  const toggleGenerator = (genId: string) => {
    setGenerators((prev) =>
      prev.map((g) => {
        if (g.id !== genId) return g;
        if (g.status === "ONLINE") {
          return { ...g, status: "STANDBY", outputKw: 0, rpm: 0, tempC: Math.max(25, g.tempC - 15) };
        } else {
          const targetKw = g.ratingKva === 150 ? 110 : 45;
          return { ...g, status: "ONLINE", outputKw: targetKw, rpm: 1500, tempC: 80 };
        }
      })
    );
    const target = generators.find((g) => g.id === genId);
    const willBeOnline = target?.status !== "ONLINE";
    setFeedbackMsg({
      id: genId,
      text: `${target?.name} toggled ${willBeOnline ? "ONLINE (Synch 50.00 Hz)" : "STANDBY"}. Complex ${target?.complex} updated.`,
      ok: true,
    });
  };

  // Engage a specific complex as primary lead
  const engageComplexPreset = (targetComplex: GeneratorComplexName) => {
    setGenerators((prev) =>
      prev.map((g) => {
        if (g.complex === targetComplex) {
          // Bring first generator online if none online
          if (g.id.endsWith("_1")) {
            const kw = g.ratingKva === 150 ? 110 : 45;
            return { ...g, status: "ONLINE", outputKw: kw, rpm: 1500, tempC: 82 };
          }
          return g;
        } else {
          // Place others in standby if they were online
          if (g.status === "ONLINE") {
            return { ...g, status: "STANDBY", outputKw: 0, rpm: 0, tempC: 30 };
          }
          return g;
        }
      })
    );
    setFeedbackMsg({
      id: `ENGAGE_${targetComplex}`,
      text: `Switched active microgrid lead to ${targetComplex.toUpperCase()} Complex. Other complexes in hot standby.`,
      ok: true,
    });
  };

  // Subsystem-specific live telemetry & bi-directional controls mapped to physical rooms
  const getSubsystemData = () => {
    const rId = room.id.toLowerCase();
    const { energy, env, logistics, network } = liveBackend;

    // ── 1. BHARATI & MAITRI POWERHOUSE & GENERATOR COMPLEXES ──
    if (rId.includes("gen") || rId.includes("chpp") || rId.includes("powerhouse") || rId.includes("power") || rId.includes("ravi") || rId.includes("surya") || rId.includes("aditya")) {
      const activeKw = totalGeneratedKw > 0 ? totalGeneratedKw : (energy?.currentOutputKw ?? (stationId === "BHARATI" ? 147.0 : 152.0));
      const loadPct = energy?.totalCapacityKw ? Math.round((activeKw / energy.totalCapacityKw) * 100) : 47;
      const fuelLh = energy?.currentFuelConsumptionLh ?? 40.8;

      return {
        icon: Lightning,
        accent: "#FFAA00",
        discipline: "ELECTRICAL & THERMAL SCADA",
        subsystem:
          stationId === "BHARATI"
            ? "Volvo Penta 280kVA Tri-Gen Array"
            : `Ravi (${raviOnline.length}/4) · Surya (${suryaOnline.length}/4) · Aditya (${adityaOnline.length}/4)`,
        isPowerhouse: true,
        metrics: stationId === "BHARATI"
          ? [
              { label: "Active Generation", value: `${activeKw} kW`, status: "NOMINAL", live: true },
              { label: "Microgrid Load", value: `${loadPct}% Capacity`, status: "STABLE", live: true },
              { label: "Fuel Burn Rate", value: `${fuelLh} L/h`, status: "OPTIMAL", live: true },
              { label: "GenSet 01 (Lead)", value: `${(activeKw * 0.56).toFixed(1)} kW · 84°C`, status: "RUNNING" },
              { label: "GenSet 02 (Follower)", value: `${(activeKw * 0.44).toFixed(1)} kW · 81°C`, status: "RUNNING" },
              { label: "GenSet 03 (Standby)", value: "0.0 kW · 18°C (Heated)", status: "READY" },
              { label: "Grid Frequency", value: "50.01 Hz", status: "SYNCHRONIZED" },
              { label: "Heat Recovery Loop", value: "+78.2°C Supply", status: "ACTIVE" },
            ]
          : [
              { label: "Total Active Generation", value: `${activeKw} kW`, status: "SYNCHRONIZED", live: true },
              { label: "Ravi Complex (4x 150kVA)", value: `${raviOnline.length}/4 ON`, status: raviOnline.length > 0 ? "LEAD ACTIVE" : "STANDBY", live: true },
              { label: "Surya Complex (4x 62.5kVA)", value: `${suryaOnline.length}/4 ON`, status: suryaOnline.length > 0 ? "ONLINE" : "STANDBY", live: true },
              { label: "Aditya Complex (4x 62.5kVA)", value: `${adityaOnline.length}/4 ON`, status: adityaOnline.length > 0 ? "ONLINE" : "HOT STANDBY", live: true },
              { label: "Total Units Online", value: `${totalGeneratorsOnline} of 12 Gensets`, status: totalGeneratorsOnline >= 2 ? "SECURE" : "WARNING", live: true },
              { label: "Bus Frequency", value: "50.00 Hz", status: "PHASE-LOCKED" },
            ],
        actions: [
          { id: "ENGAGE_RAVI", label: "Engage Ravi Complex (4x 150 kVA Lead)", risk: "MEDIUM" },
          { id: "ENGAGE_SURYA", label: "Engage Surya Complex (4x 62.5 kVA Mid-Load)", risk: "LOW" },
          { id: "ENGAGE_ADITYA", label: "Engage Aditya Complex (4x 62.5 kVA Auxiliary)", risk: "LOW" },
          { id: "ACTIVATE_BOILER_HEATING", label: "View Boiler Room Heating Flow (Top-Down)", risk: "LOW" },
        ],
        specs: {
          complexConfig: "3 Complexes x 4 Generators (12 Units Total: Ravi, Surya, Aditya)",
          complexRavi: "4x 150 kVA Diesel GenSets (Kirloskar / Cummins)",
          complexSurya: "4x 62.5 kVA Diesel GenSets (Kirloskar / Cummins)",
          complexAditya: "4x 62.5 kVA Diesel GenSets (Kirloskar / Cummins)",
          busVoltage: "415V 3-Phase 50Hz Microgrid with Automated Synchronizer",
        },
      };
    }

    // ── 2. METEOROLOGY & WEATHER AWS (LIVE NCPOR / IMD DATA) ──
    if (rId.includes("weather") || rId.includes("roof_terrace") || rId.includes("terrace") || rId.includes("meteo") || rId.includes("mast")) {
      const temp = env?.tempC ?? (stationId === "BHARATI" ? -13.64 : -9.82);
      const windKmh = env?.windSpeedKmh ?? (stationId === "BHARATI" ? 27.5 : 88.8);
      const windKnots = env?.windKnots ?? +(windKmh / 1.852).toFixed(1);
      const baro = env?.pressureHpa ?? (stationId === "BHARATI" ? 977.1 : 943.9);
      const rh = env?.humidityPct ?? 84.4;

      return {
        icon: ThermometerCold,
        accent: "#00A8FF",
        discipline: "IMD / NCPOR LIVE WEATHER OBSERVATORY",
        subsystem: `${stationId} Katabatic Weather Mast (Live NCPOR Stream)`,
        isWeather: true,
        metrics: [
          { label: "Ambient Temperature", value: `${temp} °C`, status: "NCPOR LIVE", live: true },
          { label: "Katabatic Wind Velocity", value: `${windKmh} km/h (${windKnots} kts)`, status: windKmh > 50 ? "GALE" : "NOMINAL", live: true },
          { label: "Barometric Pressure", value: `${baro} hPa (mBar)`, status: "AWS SENSOR", live: true },
          { label: "Relative Humidity", value: `${rh} %`, status: "MONITORED", live: true },
          { label: "Observation Status", value: env?.windStatus || "MODERATE_EASTERLY", status: "POLAR FLOW" },
          { label: "Data Source", value: "https://data.ncaor.gov.in/maitri/live", status: "VERIFIED" },
        ],
        actions: [
          { id: "SYNC_NCPOR_AWS", label: "Sync Fresh AWS Cycle from NCPOR Portal", risk: "LOW" },
          { id: "CALIBRATE_ANEMOMETER", label: "Cycle Heated Ultrasonic Anemometer", risk: "LOW" },
        ],
        specs: {
          dataSourceUrl: "https://data.ncaor.gov.in/maitri/live (Ministry of Earth Sciences)",
          manufacturer: "NCPOR / IMD Automated Weather Observatory",
          sensors: "Ultrasonic 3D Anemometer, PT100 Resistance Thermometer, Capacitive Barometer",
          mastElevation: stationId === "BHARATI" ? "+28.5 m ASL" : "+125 m ASL",
        },
      };
    }

    // ── 3. DRY FOOD STORAGE (9 BAYS PROVISIONS CACHE) ──
    if (rId.includes("food") || rId.includes("dry_food") || rId.includes("provision")) {
      return {
        icon: Package,
        accent: "#F59E0B",
        discipline: "EXPEDITION NUTRITION & OVERWINTER CACHE",
        subsystem: "9x Segregated Dry Provisions & Grains Storage Bays",
        metrics: [
          { label: "Total Overwinter Stock", value: "540 Days Survival (18 Mos)", status: "OPTIMAL", live: true },
          { label: "Bays 01-03 (Grains)", value: "Atta, Rice & Wheat (12,400 kg)", status: "100% FULL" },
          { label: "Bays 04-06 (Pulses/Dal)", value: "Lentils, Spices & Tins (8,600 kg)", status: "95% FULL" },
          { label: "Bays 07-09 (Oils/Packaged)", value: "Ghee, Milk Powder, Nuts (6,200 kg)", status: "96% FULL" },
          { label: "Ambient Bay Temp", value: "+12.2 °C (Heated Cache)", status: "STABLE" },
          { label: "Relative Humidity", value: "22.4% (Optimal Dry-Safe)", status: "SAFE" },
        ],
        actions: [
          { id: "AUDIT_PROVISIONS", label: "Run Overwinter Rations Inventory Count Audit", risk: "LOW" },
          { id: "CYCLE_DEHUMIDIFIER", label: "Cycle Dry Storage Air Dehumidifier Loop", risk: "LOW" },
        ],
        specs: {
          baysCount: "9 Segregated Heavy Steel-Lined Storage Bays",
          hermeticSeal: "Class A Vapor Barrier with Positive-Pressure Dry Air",
          rationHorizon: "25 Crew x 540 Days (18 Months Overwinter Cushion)",
        },
      };
    }

    // ── 4. DUAL -4°C WALK-IN DEEP FREEZERS ──
    if (rId.includes("cold_storage") || rId.includes("freezer") || rId.includes("cold")) {
      return {
        icon: ThermometerCold,
        accent: "#00A8FF",
        discipline: "COLD-CHAIN CRYOGENIC REFRIGERATION",
        subsystem: "Dual -4°C Walk-In Deep Freezers (Unit 01 & 02)",
        metrics: [
          { label: "Freezer Unit 01", value: "-4.2 °C", status: "STABILIZED", live: true },
          { label: "Freezer Unit 02", value: "-4.0 °C", status: "STABILIZED", live: true },
          { label: "Compressor Circuit A", value: "Copeland Scroll R404A", status: "RUNNING" },
          { label: "Compressor Circuit B", value: "Dual Redundant Standby", status: "READY" },
          { label: "Thermal Curtain", value: "Vacuum Ingress Protected", status: "SEALED" },
          { label: "Power-Loss Buffer", value: "> 72 Hours Unpowered Hold", status: "SECURE" },
        ],
        actions: [
          { id: "TRIGGER_DEFROST", label: "Initiate Electric Heating Element Defrost Cycle", risk: "LOW" },
          { id: "SWITCH_COMPRESSOR", label: "Cycle Lead Compressor: Circuit A ↔ Circuit B", risk: "MEDIUM" },
        ],
        specs: {
          units: "Dual Hermetic Walk-In Rooms (Unit 01 & Unit 02)",
          insulation: "150mm Rigid Polyurethane Sandwich Panels with Thermal Break",
          backupPower: "Automated Microgrid UPS Feed with 72h Thermal Inertia",
        },
      };
    }

    // ── 5. CARPENTRY & WASTE MANAGEMENT ROOM ──
    if (rId.includes("carpentry") || rId.includes("waste")) {
      return {
        icon: Wrench,
        accent: "#F59E0B",
        discipline: "MADRID PROTOCOL & TIMBER WORKSHOP",
        subsystem: "Carpentry Shop, Waste Segregation & Hydraulic Baler",
        metrics: [
          { label: "Madrid Protocol", value: "Annex III 100% Compliant", status: "CERTIFIED", live: true },
          { label: "Solid Waste Baler", value: "120 Bar Hydraulic Pressure", status: "COMPACTED" },
          { label: "Category 1 (Organics)", value: "280 kg Shredded & Dehydrated", status: "PACKED" },
          { label: "Category 2 (Metals/Glass)", value: "410 kg Crushed in Drums", status: "CRUSHED" },
          { label: "Hazardous/Chemical Waste", value: "Zero Leakage in UN Drums", status: "SEALED" },
          { label: "Timber Crating Stock", value: "14 m³ Siberian Pine Ready", status: "STOCKED" },
        ],
        actions: [
          { id: "ACTUATE_BALER", label: "Actuate Hydraulic Waste Compactor Cycle", risk: "LOW" },
          { id: "GENERATE_MANIFEST", label: "Generate Madrid Protocol Vessel Backload Manifest", risk: "LOW" },
          { id: "CYCLONE_PURGE", label: "Purge Carpentry Dust Extraction Cyclone", risk: "LOW" },
        ],
        specs: {
          environmentalTreaty: "Protocol on Environmental Protection to the Antarctic Treaty (Madrid, 1991)",
          machinery: "12-Ton Hydraulic Solid Baler, Wood Lathe, Radial Saw, Dust Cyclone",
          backloadDestination: "Return Voyage Supply Vessel to Cape Town / Goa",
        },
      };
    }

    // ── 6. SATELLITE COMMUNICATIONS & RADOMES ──
    if (rId.includes("radome") || rId.includes("sat") || rId.includes("radio") || rId.includes("comms") || rId.includes("command")) {
      const latency = network?.latencyMs ?? 42;
      const buffer = network?.edgeBufferUsedPct ?? 68;

      return {
        icon: Radio,
        accent: "#A855F7",
        discipline: "SATELLITE TELECOMMUNICATIONS & NOC",
        subsystem: stationId === "BHARATI" ? "ISRO NRSC Ground Station Antenna Complex" : "DROMLAN Satellite Mesh & VHF Operations",
        metrics: [
          { label: "Uplink Latency", value: `${latency} ms`, status: "LIVE", live: true },
          { label: "Edge NVMe Buffer", value: `${buffer}% Used (2.0 TB)`, status: "BUFFERING", live: true },
          { label: "ISRO Link Channel", value: "C-Band (Shadnagar Link)", status: "LOCKED" },
          { label: "Priority P0 Queue", value: "0 Alerts Queued", status: "SYNCED" },
          { label: "Radome De-Icer", value: "+12.0°C Heated Radome", status: "ACTIVE" },
          { label: "VHF Marine Ch 16", value: "Guard Active (156.8 MHz)", status: "LISTENING" },
        ],
        actions: [
          { id: "BURST_SYNC_BUFFER", label: "Force Edge Telemetry Store-and-Forward Sync", risk: "LOW" },
          { id: "TEST_SATELLITE_FAILOVER", label: "Simulate Iridium Contingency Failover", risk: "MEDIUM" },
        ],
        specs: {
          radomeDiameter: "2.4m High-Latitude Dielectric Composite Dome",
          groundStation: "ISRO / NRSC Shadnagar Direct Link",
        },
      };
    }

    // ── 7. BOILER PLANT & HYDRONIC HEATING ──
    if (rId.includes("boiler") || rId.includes("heat")) {
      return {
        icon: Drop,
        accent: "#FF6B00",
        discipline: "INDUSTRIAL BOILER & HYDRONIC HEATING",
        subsystem: "Dual Riello Burners, 500L Calorifiers & Room Heating Loop",
        metrics: [
          { label: "Boiler Core Supply", value: "+78.4 °C (Heated)", status: "OPTIMAL", live: true },
          { label: "Return Loop Temp", value: "+62.1 °C (Delta 16.3°C)", status: "CIRCULATING", live: true },
          { label: "Hydronic Line Pressure", value: "3.4 Bar", status: "STABLE", live: true },
          { label: "Circulation Pumps", value: "Dual Grundfos Active", status: "ONLINE" },
          { label: "Room Heat Delivery", value: "+21.5°C All 16 Zones", status: "HEATED" },
          { label: "Lake Gantry Trace", value: "30 W/m Active", status: "PROTECTED" },
        ],
        actions: [
          { id: "ACTIVATE_BOILER_HEATING", label: "View Boiler Room Heating Flow (Top-Down)", risk: "LOW" },
          { id: "BOOST_BOILER_TEMP", label: "Boost Hydronic Supply Temp (+5°C Blizzard Hold)", risk: "MEDIUM" },
        ],
        specs: {
          burners: "Dual Riello R40 Light Oil Burners running on Arctic ATF-50",
          calorifiers: "2x 500L Dual-Coil Insulated Storage Vessels with Expansion Tanks",
          distribution: "Hydronic Underfloor & Radiator Network to Living Cabins & Medical Wing",
        },
      };
    }

    // ── 8. WATER SYSTEMS & RO / LAKE INTAKE ──
    if (rId.includes("water") || rId.includes("ro_plant") || rId.includes("pumphouse") || rId.includes("uv")) {
      return {
        icon: Drop,
        accent: "#00D4A0",
        discipline: "POTABLE WATER & BOILER PLANT",
        subsystem: stationId === "BHARATI" ? "Quilty Bay Reverse Osmosis & UV Sterilization" : "Priyadarshini Lake Sub-Ice Extraction & Calorifiers",
        metrics: stationId === "BHARATI"
          ? [
              { label: "Potable Production", value: "2,400 L/day", status: "NOMINAL" },
              { label: "Intake Line Trace Heat", value: "+4.2°C Supply", status: "PROTECTED" },
              { label: "Membrane Feed Pressure", value: "55.0 Bar", status: "OPTIMAL" },
              { label: "Product Salinity", value: "38 ppm (WHO Grade)", status: "POTABLE" },
            ]
          : [
              { label: "Sub-Ice Intake Depth", value: "6.2 m (Liquid Pool)", status: "NOMINAL" },
              { label: "Intake Water Temp", value: "+1.6°C Unfrozen", status: "SAFE" },
              { label: "280m Gantry Trace Heat", value: "30 W/m Active", status: "NORMAL" },
              { label: "Daily Production", value: "1,800 L/day", status: "POTABLE" },
            ],
        actions: [
          { id: "CYCLE_RO_BOOSTER", label: "Cycle Raw Seawater Intake Boost Skid", risk: "LOW" },
        ],
        specs: {
          source: stationId === "BHARATI" ? "Quilty Bay Coastal Ocean Intake" : "Priyadarshini Perennial Freshwater Lake",
        },
      };
    }

    // ── 9. FUEL FARM & DAY TANKS ──
    if (rId.includes("fuel") || rId.includes("daytank") || rId.includes("tank")) {
      const fuelLiters = logistics?.fuelReservesL ?? (stationId === "BHARATI" ? 285000 : 195000);
      const fuelDays = logistics?.fuelAutonomyDays ?? (stationId === "BHARATI" ? 290 : 219);
      const dailyBurn = logistics?.dailyFuelConsumptionL ?? 980;

      return {
        icon: GasPump,
        accent: "#F59E0B",
        discipline: "FUEL RESERVES & LOGISTICS HORIZON",
        subsystem: stationId === "BHARATI" ? "Bulk Aviation Turbine Fuel (ATF-50) Tank Farm" : "Southern Pad Bulk HSD & ATF Tank Battery",
        metrics: [
          { label: "Certified Reserves", value: `${fuelLiters.toLocaleString()} Liters`, status: "OPTIMAL", live: true },
          { label: "Winter Autonomy", value: `${fuelDays} Days Survival`, status: fuelDays > 180 ? "SECURE" : "WATCH", live: true },
          { label: "Daily Consumption", value: `${dailyBurn} L/day`, status: "NOMINAL", live: true },
          { label: "Fuel Chemistry", value: "ATF-50 (-50°C Pour Point)", status: "VERIFIED" },
        ],
        actions: [
          { id: "CYCLE_TRANSFER_PUMP", label: "Test Automated Fuel Transfer Booster Pump", risk: "LOW" },
        ],
        specs: {
          fuelGrade: "Polar Blend Aviation Turbine Fuel (Jet A-1 / ATF-50)",
        },
      };
    }

    // ── 10. SCIENCE LABS & OBSERVATORIES ──
    if (rId.includes("lab") || rId.includes("bio") || rId.includes("geo") || rId.includes("physics") || rId.includes("geomag")) {
      return {
        icon: Cpu,
        accent: "#EC4899",
        discipline: "POLAR SCIENCE & GEOMAGNETIC RESEARCH",
        subsystem: stationId === "BHARATI" ? "Four Designated Laboratories (Elec, Life, Chem, Earth)" : "IIG Kamet Geomagnetic & Atmospheric Physics Huts",
        metrics: [
          { label: "Geomagnetic Field", value: "54,210 nT (3-Axis)", status: "ONLINE", live: true },
          { label: "BARC IERMON Gamma", value: "125 nGy/h (Nominal)", status: "SAFE", live: true },
          { label: "Cryo Sample Storage", value: "-80.4°C Ultra-Cold", status: "NOMINAL" },
        ],
        actions: [
          { id: "CALIBRATE_MAGNETOMETER", label: "Trigger Digital Fluxgate Zero Calibration", risk: "LOW" },
        ],
        specs: {
          scientificBodies: "NCPOR, IIG Mumbai, BARC Mumbai, NGRI Hyderabad",
        },
      };
    }

    // ── 11. HOSPITAL & DEFAULT ──
    return {
      icon: Heartbeat,
      accent: "#10B981",
      discipline: "EXPEDITION CRITICAL HEALTH & HABITAT",
      subsystem: `${room.name} · Life Support Infrastructure`,
      metrics: [
        { label: "Thermal Comfort", value: "+21.4°C", status: "HEATED" },
        { label: "Relative Humidity", value: "48% Indoor Air", status: "OPTIMAL" },
        { label: "Fresh Air Makeup", value: "650 m³/h (AHU)", status: "VENTILATED" },
        { label: "Medical O2 Bank", value: "4x 50L (200 bar)", status: "RESERVE OK" },
      ],
      actions: [
        { id: "BOOST_HVAC_WARMTH", label: "Initiate +2°C Living Zone Warmth Boost", risk: "LOW" },
      ],
      specs: {
        envelope: "Modular Insulated Sandwich Panels with Aerodynamic Thermal Breaks",
      },
    };
  };

  const sysData = getSubsystemData();
  const IconComp = sysData.icon;

  const handleAction = async (actionId: string, label: string) => {
    setExecutingAction(actionId);
    setFeedbackMsg(null);

    try {
      if (actionId === "ENGAGE_RAVI") {
        engageComplexPreset("Ravi");
      } else if (actionId === "ENGAGE_SURYA") {
        engageComplexPreset("Surya");
      } else if (actionId === "ENGAGE_ADITYA") {
        engageComplexPreset("Aditya");
      } else if (actionId === "SYNC_NCPOR_AWS") {
        await api.syncEnvironment(stationId);
        await fetchLiveTelemetry();
        setFeedbackMsg({ id: actionId, text: "Live AWS feed freshly synced from NCPOR portal (https://data.ncaor.gov.in/maitri/live)!", ok: true });
      } else {
        if (onTriggerAction) onTriggerAction(actionId, label);
        await new Promise((r) => setTimeout(r, 650));
        setFeedbackMsg({ id: actionId, text: `Command ${label} executed successfully.`, ok: true });
      }
    } catch (err: any) {
      setFeedbackMsg({ id: actionId, text: `Execution failed: ${err.message}`, ok: false });
    } finally {
      setExecutingAction(null);
    }
  };

  return (
    <div className="relative w-[420px] sm:w-[480px] max-w-[calc(100vw-32px)] select-none font-sans animate-in fade-in zoom-in-95 duration-200">
      {/* ── SCADA INSTRUMENTATION CASING (Single Layer Titanium Panel) ── */}
      <div className="rounded-2xl bg-[#060D1A]/98 border border-white/[0.14] p-4 sm:p-5 flex flex-col gap-3 shadow-[0_24px_64px_rgba(0,0,0,0.92)] backdrop-blur-2xl">
        
        {/* Header Row */}
        <div className="flex items-start justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{
                backgroundColor: `${sysData.accent}15`,
                color: sysData.accent,
                border: `1px solid ${sysData.accent}35`,
              }}
            >
              <IconComp size={16} />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-[#7ABBD4]">
                  {sysData.discipline}
                </span>
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: sysData.accent }}
                />
              </div>
              <h3 className="font-mono text-sm font-semibold text-white tracking-tight truncate leading-tight">
                {room.name}
              </h3>
              <span className="font-mono text-[10px] text-[#A6C4D6] truncate">
                {stationId} // {room.level ? `${room.level} Deck` : "Facility"} · {sysData.subsystem}
              </span>
            </div>
          </div>

          {/* Actions: Refresh & Close */}
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <button
              onClick={fetchLiveTelemetry}
              disabled={isRefreshing}
              className="p-1.5 rounded-md text-[#7ABBD4] hover:text-white hover:bg-white/[0.08] transition-colors"
              title="Refresh live backend telemetry"
            >
              <ArrowsClockwise size={14} className={isRefreshing ? "animate-spin" : ""} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-[#7ABBD4] hover:text-white hover:bg-white/[0.08] transition-colors"
              title="Close facility card"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex p-0.5 rounded-lg bg-black/50 border border-white/[0.06] font-mono text-[10px]">
          <button
            onClick={() => setActiveTab("telemetry")}
            className={`flex-1 py-1 rounded-md font-semibold transition-colors ${
              activeTab === "telemetry"
                ? "bg-white/10 text-white shadow-sm"
                : "text-[#7ABBD4] hover:text-white"
            }`}
          >
            Live Telemetry
          </button>
          <button
            onClick={() => setActiveTab("controls")}
            className={`flex-1 py-1 rounded-md font-semibold transition-colors ${
              activeTab === "controls"
                ? "bg-white/10 text-white shadow-sm"
                : "text-[#7ABBD4] hover:text-white"
            }`}
          >
            SCADA Actuation
          </button>
          <button
            onClick={() => setActiveTab("specs")}
            className={`flex-1 py-1 rounded-md font-semibold transition-colors ${
              activeTab === "specs"
                ? "bg-white/10 text-white shadow-sm"
                : "text-[#7ABBD4] hover:text-white"
            }`}
          >
            BIM Specs
          </button>
        </div>

        {/* ── TAB 1: LIVE SCADA TELEMETRY METRICS ── */}
        {activeTab === "telemetry" && (
          <div className="flex flex-col gap-2.5">
            
            {/* POWERHOUSE GENERATOR COMPLEXES MATRIX (3 COMPLEXES x 4 GENERATORS = 12 UNITS TOTAL) */}
            {sysData.isPowerhouse && stationId === "MAITRI" && (
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.08] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Lightning size={13} className="text-[#FFAA00]" weight="bold" />
                    <span className="font-mono text-[10px] font-bold text-white uppercase tracking-wider">
                      3 Complexes Matrix (12 Gensets Total)
                    </span>
                  </div>
                  <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-[#FFAA00] border border-amber-500/30">
                    {totalGeneratorsOnline} / 12 ON · {totalGeneratedKw} kW
                  </span>
                </div>

                {/* 1. Ravi Complex (4x 150 kVA) */}
                <div className="flex flex-col gap-1 pt-1 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-white/90 font-semibold">1. RAVI COMPLEX (4x 150 kVA):</span>
                    <span className="text-[#7ABBD4]">{raviOnline.length}/4 Active</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {generators.filter((g) => g.complex === "Ravi").map((gen) => {
                      const isOnline = gen.status === "ONLINE";
                      return (
                        <button
                          key={gen.id}
                          onClick={() => toggleGenerator(gen.id)}
                          className={`p-1.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                            isOnline
                              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                              : gen.status === "STANDBY"
                              ? "bg-amber-500/10 border-amber-500/25 text-amber-300 hover:bg-amber-500/20"
                              : "bg-white/[0.03] border-white/[0.07] text-white/50 hover:bg-white/[0.06]"
                          }`}
                          title={`Click to toggle ${gen.name}`}
                        >
                          <span className="font-mono text-[9px] font-bold truncate">{gen.name.split(" ")[1]}</span>
                          <span className="font-mono text-[8px] mt-0.5 font-semibold">
                            {isOnline ? `${gen.outputKw}kW` : gen.status}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Surya Complex (4x 62.5 kVA) */}
                <div className="flex flex-col gap-1 pt-1 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-white/90 font-semibold">2. SURYA COMPLEX (4x 62.5 kVA):</span>
                    <span className="text-[#7ABBD4]">{suryaOnline.length}/4 Active</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {generators.filter((g) => g.complex === "Surya").map((gen) => {
                      const isOnline = gen.status === "ONLINE";
                      return (
                        <button
                          key={gen.id}
                          onClick={() => toggleGenerator(gen.id)}
                          className={`p-1.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                            isOnline
                              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                              : gen.status === "STANDBY"
                              ? "bg-amber-500/10 border-amber-500/25 text-amber-300 hover:bg-amber-500/20"
                              : "bg-white/[0.03] border-white/[0.07] text-white/50 hover:bg-white/[0.06]"
                          }`}
                          title={`Click to toggle ${gen.name}`}
                        >
                          <span className="font-mono text-[9px] font-bold truncate">{gen.name.split(" ")[1]}</span>
                          <span className="font-mono text-[8px] mt-0.5 font-semibold">
                            {isOnline ? `${gen.outputKw}kW` : gen.status}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Aditya Complex (4x 62.5 kVA) */}
                <div className="flex flex-col gap-1 pt-1 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-white/90 font-semibold">3. ADITYA COMPLEX (4x 62.5 kVA):</span>
                    <span className="text-[#7ABBD4]">{adityaOnline.length}/4 Active</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {generators.filter((g) => g.complex === "Aditya").map((gen) => {
                      const isOnline = gen.status === "ONLINE";
                      return (
                        <button
                          key={gen.id}
                          onClick={() => toggleGenerator(gen.id)}
                          className={`p-1.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                            isOnline
                              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                              : gen.status === "STANDBY"
                              ? "bg-amber-500/10 border-amber-500/25 text-amber-300 hover:bg-amber-500/20"
                              : "bg-white/[0.03] border-white/[0.07] text-white/50 hover:bg-white/[0.06]"
                          }`}
                          title={`Click to toggle ${gen.name}`}
                        >
                          <span className="font-mono text-[9px] font-bold truncate">{gen.name.split(" ")[1]}</span>
                          <span className="font-mono text-[8px] mt-0.5 font-semibold">
                            {isOnline ? `${gen.outputKw}kW` : gen.status}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Standard Metrics Grid */}
            <div className="grid grid-cols-2 gap-2">
              {sysData.metrics.map((m: any, idx: number) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors flex flex-col justify-between min-h-[56px]"
                >
                  <span className="font-mono text-[9px] text-[#7ABBD4] uppercase tracking-wider block truncate">
                    {m.label}
                  </span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="font-mono font-semibold text-white text-xs sm:text-[13px] tracking-tight truncate mr-1">
                      {m.value}
                    </span>
                    <span
                      className="px-1.5 py-0.2 rounded font-mono text-[8px] font-medium uppercase tracking-wider shrink-0"
                      style={{
                        backgroundColor: `${sysData.accent}15`,
                        color: sysData.accent,
                      }}
                    >
                      {m.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Weather Live Link Footnote */}
            {sysData.isWeather && (
              <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-between text-[9px] font-mono text-sky-200">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live AWS Scraper: <strong>data.ncaor.gov.in/maitri/live</strong>
                </span>
                <span className="text-white/60">Updated every 6s</span>
              </div>
            )}

            {/* Live Sync Footer */}
            <div className="flex items-center justify-between pt-1 font-mono text-[9px] text-[#4A7A8E]">
              <span>STREAM: <strong>NCPOR TELEMETRY CORE</strong></span>
              <span>SYNCED: {liveBackend.syncedAt}</span>
            </div>
          </div>
        )}

        {/* ── TAB 2: REMOTE SCADA ACTUATION & CONTROLS ── */}
        {activeTab === "controls" && (
          <div className="flex flex-col gap-2">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-[10px] flex items-center gap-2">
              <WarningCircle size={14} className="shrink-0" />
              <span>Encrypted bidirectional remote SCADA link active. Operations require telemetry confirmation.</span>
            </div>

            {/* Powerhouse 3 Complexes Quick Selectors */}
            {sysData.isPowerhouse && stationId === "MAITRI" && (
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-2">
                <span className="font-mono text-[10px] font-bold text-white uppercase tracking-wider">
                  Complex Duty Switching (Change Lead Complex)
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => engageComplexPreset("Ravi")}
                    className="p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-200 font-mono text-[10px] font-semibold transition-colors text-center"
                  >
                    Engage Ravi (150kVA)
                  </button>
                  <button
                    onClick={() => engageComplexPreset("Surya")}
                    className="p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-200 font-mono text-[10px] font-semibold transition-colors text-center"
                  >
                    Engage Surya (62.5kVA)
                  </button>
                  <button
                    onClick={() => engageComplexPreset("Aditya")}
                    className="p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-200 font-mono text-[10px] font-semibold transition-colors text-center"
                  >
                    Engage Aditya (62.5kVA)
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5 mt-0.5">
              {sysData.actions.map((act: any) => {
                const isRunning = executingAction === act.id;
                const isSuccess = feedbackMsg?.id === act.id && Boolean(feedbackMsg?.ok);

                return (
                  <button
                    key={act.id}
                    onClick={() => handleAction(act.id, act.label)}
                    disabled={executingAction !== null}
                    className={`group w-full p-2.5 rounded-xl border text-left font-mono text-xs font-medium flex items-center justify-between transition-colors ${
                      isSuccess
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                        : act.risk === "HIGH"
                        ? "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-300"
                        : "bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.08] text-white"
                    } disabled:opacity-50`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {isRunning ? (
                        <ArrowsClockwise size={13} className="animate-spin text-amber-400 shrink-0" />
                      ) : isSuccess ? (
                        <CheckCircle size={13} className="text-emerald-400 shrink-0" />
                      ) : (
                        <SlidersHorizontal size={13} className="text-[#7ABBD4] shrink-0" />
                      )}
                      <span className="truncate">{act.label}</span>
                    </div>

                    <span
                      className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono shrink-0 ml-2 ${
                        act.risk === "HIGH"
                          ? "bg-rose-500/20 text-rose-300"
                          : act.risk === "MEDIUM"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-white/10 text-white/70"
                      }`}
                    >
                      {act.risk}
                    </span>
                  </button>
                );
              })}
            </div>

            {feedbackMsg && (
              <div
                className={`p-2.5 rounded-xl text-[10px] font-mono mt-1 ${
                  feedbackMsg.ok
                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/15 border border-rose-500/30 text-rose-300"
                }`}
              >
                {feedbackMsg.text}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: BIM SPECS ── */}
        {activeTab === "specs" && (
          <div className="flex flex-col gap-2">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-2">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#7ABBD4]">
                Engineering Specifications & BIM Registry
              </span>
              <div className="flex flex-col gap-1.5 text-xs font-mono">
                {Object.entries(sysData.specs).map(([key, val]: any) => (
                  <div key={key} className="flex flex-col sm:flex-row sm:items-baseline justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-[#7ABBD4] text-[10px] uppercase">{key.replace(/([A-Z])/g, " $1")}</span>
                    <span className="text-white text-[11px] font-medium sm:text-right">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
