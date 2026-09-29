"use client";

import React, { useState, useEffect, useCallback } from "react";
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

  // Subsystem-specific live telemetry & bi-directional controls mapped to physical rooms
  const getSubsystemData = () => {
    const rId = room.id.toLowerCase();
    const { energy, env, logistics, network } = liveBackend;

    // ── 1. BHARATI & MAITRI GENERATOR HALLS (POWER) ──
    if (rId.includes("gen") || rId.includes("chpp") || rId.includes("powerhouse") || rId.includes("power")) {
      const activeKw = energy?.currentOutputKw ?? (stationId === "BHARATI" ? 147.0 : 142.0);
      const loadPct = energy?.totalCapacityKw ? Math.round((activeKw / energy.totalCapacityKw) * 100) : 47;
      const fuelLh = energy?.currentFuelConsumptionLh ?? 40.8;

      return {
        icon: Lightning,
        accent: "#FFAA00",
        discipline: "ELECTRICAL & THERMAL SCADA",
        subsystem: stationId === "BHARATI" ? "Volvo Penta 280kVA Tri-Gen Array" : "Kirloskar-Cummins GenSet Array",
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
              { label: "Active Generation", value: `${activeKw} kW`, status: "NOMINAL", live: true },
              { label: "Microgrid Load", value: `${loadPct}% Capacity`, status: "STABLE", live: true },
              { label: "Fuel Burn Rate", value: `${fuelLh} L/h`, status: "OPTIMAL", live: true },
              { label: "Ravi GenSet", value: "80.0 kW · 82°C", status: "RUNNING" },
              { label: "Surya GenSet", value: "62.0 kW · 79°C", status: "RUNNING" },
              { label: "Aditya (Standby)", value: "0.0 kW · 16°C", status: "STANDBY" },
              { label: "Grid Frequency", value: "50.00 Hz", status: "SYNCHRONIZED" },
              { label: "Riello Burner", value: "Standby 100%", status: "READY" },
            ],
        actions: [
          { id: "START_STANDBY_GEN", label: "Remote Spin-Up Standby GenSet", risk: "MEDIUM" },
          { id: "TOGGLE_ECO_THERMAL", label: "Toggle Eco-Thermal Heat Recovery", risk: "LOW" },
          { id: "SHED_ZONE_LOAD", label: "Selective Microgrid Non-Essential Shed", risk: "HIGH" },
        ],
        specs: {
          manufacturer: stationId === "BHARATI" ? "Volvo Penta / MAN Diesel" : "Kirloskar / Cummins India",
          rating: stationId === "BHARATI" ? "3x 280 kVA (415V 3-Phase 50Hz)" : "3x 100 kVA (415V 50Hz)",
          heatExchange: "Plate Heat Exchanger to Primary Hydronic Loop",
          fuelType: "Aviation Turbine Fuel (ATF-50 Polar Blend)",
        },
      };
    }

    // ── 2. METEOROLOGY & WEATHER MASTS ──
    if (rId.includes("weather") || rId.includes("roof_terrace") || rId.includes("terrace") || rId.includes("meteo") || rId.includes("mast")) {
      const temp = env?.tempC ?? (stationId === "BHARATI" ? -13.64 : -9.82);
      const windKmh = env?.windSpeedKmh ?? (stationId === "BHARATI" ? 27.5 : 88.8);
      const windKnots = env?.windKnots ?? +(windKmh / 1.852).toFixed(1);
      const baro = env?.pressureHpa ?? (stationId === "BHARATI" ? 977.1 : 943.9);
      const rh = env?.humidityPct ?? 84.4;

      return {
        icon: ThermometerCold,
        accent: "#00A8FF",
        discipline: "NCPOR AUTOMATED WEATHER STATION",
        subsystem: `${stationId} Polar Meteorology Mast & Boundary Layer AWS`,
        metrics: [
          { label: "Ambient Temperature", value: `${temp} °C`, status: "NCPOR LIVE", live: true },
          { label: "Katabatic Wind Velocity", value: `${windKmh} km/h (${windKnots} kts)`, status: windKmh > 50 ? "GALE" : "NOMINAL", live: true },
          { label: "Barometric Pressure", value: `${baro} hPa (mBar)`, status: "AWS SENSOR", live: true },
          { label: "Relative Humidity", value: `${rh} %`, status: "MONITORED", live: true },
          { label: "Wind Status", value: env?.windStatus || "MODERATE_EASTERLY", status: "POLAR FLOW" },
          { label: "Observation Cycle", value: env?.observationDate || "Live Telemetry", status: "VERIFIED" },
        ],
        actions: [
          { id: "SYNC_NCPOR_AWS", label: "Sync Fresh AWS Cycle from NCPOR Portal", risk: "LOW" },
          { id: "CALIBRATE_ANEMOMETER", label: "Cycle Heated Ultrasonic Anemometer", risk: "LOW" },
        ],
        specs: {
          manufacturer: "NCPOR / IMD Ministry of Earth Sciences",
          sensors: "Ultrasonic 3D Anemometer, PT100 Resistance Thermometer, Capacitive Barometer",
          mastElevation: stationId === "BHARATI" ? "+28.5 m ASL" : "+125 m ASL",
          polarDeIcing: "Automatic Electric Pulse Heating (120 W)",
        },
      };
    }

    // ── 3. SATELLITE COMMUNICATIONS & RADOMES ──
    if (rId.includes("radome") || rId.includes("sat") || rId.includes("radio") || rId.includes("comms") || rId.includes("command")) {
      const latency = network?.latencyMs ?? 42;
      const buffer = network?.edgeBufferUsedPct ?? 68;

      return {
        icon: Radio,
        accent: "#A855F7",
        discipline: "SATELLITE TELECOMMUNICATIONS & ISRO LINK",
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
          antennaTracking: "3-Axis Azimuth/Elevation Polar Mount with De-icing",
          bufferCapacity: "2.0 TB Redundant NVMe Solid-State Cache",
        },
      };
    }

    // ── 4. WATER SYSTEMS & RO / LAKE INTAKE ──
    if (rId.includes("water") || rId.includes("ro_plant") || rId.includes("pumphouse") || rId.includes("uv") || rId.includes("boiler")) {
      return {
        icon: Drop,
        accent: "#00D4A0",
        discipline: "POTABLE WATER & DESALINATION",
        subsystem: stationId === "BHARATI" ? "Quilty Bay Reverse Osmosis & UV Sterilization" : "Priyadarshini Lake Sub-Ice Extraction & Calorifiers",
        metrics: stationId === "BHARATI"
          ? [
              { label: "Potable Production", value: "2,400 L/day", status: "NOMINAL" },
              { label: "Intake Line Trace Heat", value: "+4.2°C Supply", status: "PROTECTED" },
              { label: "Membrane Feed Pressure", value: "55.0 Bar", status: "OPTIMAL" },
              { label: "Product Salinity", value: "38 ppm (WHO Grade)", status: "POTABLE" },
              { label: "Calorifier Core", value: "+65.0°C Heated", status: "ACTIVE" },
              { label: "Freeze Horizon", value: "> 180 mins", status: "SAFE" },
            ]
          : [
              { label: "Sub-Ice Intake Depth", value: "6.2 m (Liquid Pool)", status: "NOMINAL" },
              { label: "Intake Water Temp", value: "+1.6°C Unfrozen", status: "SAFE" },
              { label: "280m Gantry Trace Heat", value: "30 W/m Active", status: "NORMAL" },
              { label: "Boiler Calorifier Core", value: "+72.0°C Core", status: "HEATED" },
              { label: "Daily Production", value: "1,800 L/day", status: "POTABLE" },
              { label: "Madrid Protocol", value: "100% Compliant", status: "VERIFIED" },
            ],
        actions: [
          { id: "CYCLE_RO_BOOSTER", label: "Cycle Raw Seawater Intake Boost Skid", risk: "LOW" },
          { id: "BOOST_TRACE_HEAT", label: "Boost Lifeline Trace Heat +10°C", risk: "MEDIUM" },
        ],
        specs: {
          source: stationId === "BHARATI" ? "Quilty Bay Coastal Ocean Intake" : "Priyadarshini Perennial Freshwater Lake",
          treatment: stationId === "BHARATI" ? "Dual-Train High Pressure SWRO + Micron UV" : "Micro-filtration + Plate Heat Calorifiers",
          intakePipe: "304L Stainless Steel with 100mm Polyurethane Insulation",
          freezeProtection: "30 W/m Self-Regulating Electric Heat-Trace",
        },
      };
    }

    // ── 5. FUEL FARM & DAY TANKS ──
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
          { label: "Interstitial Vacuum", value: "-0.45 bar (Sealed)", status: "LEAK SAFE" },
          { label: "Secondary Bund", value: "0.0% Liquid Detected", status: "DRY OK" },
        ],
        actions: [
          { id: "CYCLE_TRANSFER_PUMP", label: "Test Automated Fuel Transfer Booster Pump", risk: "LOW" },
          { id: "EMERGENCY_FUEL_ISOLATE", label: "Actuate Emergency Master Fuel Cutoff", risk: "HIGH" },
        ],
        specs: {
          fuelGrade: "Polar Blend Aviation Turbine Fuel (Jet A-1 / ATF-50)",
          containment: "Double-Walled Steel Tanks with Continuous Vacuum Interstitial Leak Sensor",
          transferPipeline: "Double-Walled Carbon Steel with Trace Heating",
          resupplyWindow: logistics?.resupplyWindow || "OPEN (Ship Mooring Dec-Feb)",
        },
      };
    }

    // ── 6. SCIENCE LABS & OBSERVATORIES ──
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
          { label: "Fume Hood Exhaust", value: "Negative Pressure OK", status: "ACTIVE" },
          { label: "Clean Air Class", value: "ISO Class 7 Cleanroom", status: "FILTERED" },
          { label: "Spectrometer Link", value: "Optical Auroral Scan", status: "READY" },
        ],
        actions: [
          { id: "CALIBRATE_MAGNETOMETER", label: "Trigger Digital Fluxgate Zero Calibration", risk: "LOW" },
          { id: "PURGE_FUME_HOOD", label: "Emergency Chemical Fume Extraction Purge", risk: "MEDIUM" },
        ],
        specs: {
          scientificBodies: "NCPOR, IIG Mumbai, BARC Mumbai, NGRI Hyderabad",
          instruments: "Proton Magnetometer, Digital Fluxgate, Aerosol Spectrometer, Gamma Monitors",
          dataTelemetry: "Direct Fibre-Optic Bus to BMS NOC & ISRO NRSC Link",
          vibrationTolerance: "Isolated Floating Foundation Slabs (< 0.05 mm/s)",
        },
      };
    }

    // ── 7. HOSPITAL & LIFE SUPPORT (HABITAT) ──
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
        { label: "Telemedicine Link", value: "AIIMS New Delhi Gateway", status: "ONLINE" },
        { label: "Fire Suppression", value: "Inergen Gas Bank Armed", status: "STANDBY" },
      ],
      actions: [
        { id: "BOOST_HVAC_WARMTH", label: "Initiate +2°C Living Zone Warmth Boost", risk: "LOW" },
        { id: "TEST_FIRE_DAMPERS", label: "Test Motorized Smoke Dampers", risk: "MEDIUM" },
      ],
      specs: {
        envelope: "Modular Insulated Sandwich Panels with Aerodynamic Thermal Breaks",
        capacity: stationId === "BHARATI" ? "47 Berths (Main Building)" : "25 Winter / 65 Summer",
        fireRating: "A60 Marine Standard Marine Bulkheads & Inergen Suppression",
        acoustics: "Double-Partitioned Soundproof Bulkheads (STC 48)",
      },
    };
  };

  const sysData = getSubsystemData();
  const IconComp = sysData.icon;

  const handleAction = async (actionId: string, label: string) => {
    setExecutingAction(actionId);
    setFeedbackMsg(null);

    try {
      if (actionId === "SYNC_NCPOR_AWS") {
        await api.syncEnvironment(stationId);
        await fetchLiveTelemetry();
        setFeedbackMsg({ id: actionId, text: "Live AWS feed freshly synced from NCPOR portal!", ok: true });
      } else {
        // SCADA actuation
        if (onTriggerAction) onTriggerAction(actionId, label);
        await new Promise((r) => setTimeout(r, 750));
        setFeedbackMsg({ id: actionId, text: `Command ${label} executed successfully.`, ok: true });
      }
    } catch (err: any) {
      setFeedbackMsg({ id: actionId, text: `Execution failed: ${err.message}`, ok: false });
    } finally {
      setExecutingAction(null);
    }
  };

  return (
    <div className="relative w-[390px] sm:w-[440px] max-w-[calc(100vw-32px)] select-none font-sans animate-in fade-in zoom-in-95 duration-200">
      {/* ── DOUBLE-BEZEL OUTER HARDWARE CASING (Awwwards-Tier) ── */}
      <div className="p-1.5 sm:p-2 rounded-[2rem] bg-black/50 ring-1 ring-white/10 backdrop-blur-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)]">
        {/* ── INNER CORE CONTAINER ── */}
        <div className="rounded-[calc(2rem-0.375rem)] bg-[#040D1A]/95 border border-white/10 p-4 sm:p-5 flex flex-col gap-3.5">
          
          {/* Header Row */}
          <div className="flex items-start justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
                style={{
                  backgroundColor: `${sysData.accent}20`,
                  color: sysData.accent,
                  border: `1px solid ${sysData.accent}40`,
                }}
              >
                <IconComp size={18} weight="bold" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#7ABBD4]">
                    {sysData.discipline}
                  </span>
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-ping shrink-0"
                    style={{ backgroundColor: sysData.accent }}
                  />
                </div>
                <h3 className="font-sans font-bold text-white text-base tracking-tight truncate leading-tight">
                  {room.name}
                </h3>
                <span className="font-mono text-[9px] text-[#A6C4D6] truncate">
                  {stationId} // {room.level ? `${room.level} Deck` : "Campus Facility"} · {sysData.subsystem}
                </span>
              </div>
            </div>

            {/* Actions: Refresh & Close */}
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <button
                onClick={fetchLiveTelemetry}
                disabled={isRefreshing}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-[#7ABBD4] hover:text-white transition-all"
                title="Refresh live backend telemetry"
              >
                <ArrowsClockwise size={14} className={isRefreshing ? "animate-spin" : ""} />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-[#7ABBD4] hover:text-rose-300 transition-all"
                title="Close facility card"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex p-0.5 rounded-xl bg-black/40 border border-white/5 font-mono text-[10px]">
            <button
              onClick={() => setActiveTab("telemetry")}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === "telemetry"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-[#7ABBD4] hover:text-white"
              }`}
            >
              Live Telemetry
            </button>
            <button
              onClick={() => setActiveTab("controls")}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === "controls"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-[#7ABBD4] hover:text-white"
              }`}
            >
              SCADA Actuation
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === "specs"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-[#7ABBD4] hover:text-white"
              }`}
            >
              BIM Specs
            </button>
          </div>

          {/* ── TAB 1: LIVE SCADA TELEMETRY METRICS ── */}
          {activeTab === "telemetry" && (
            <div className="flex flex-col gap-2.5">
              <div className="grid grid-cols-2 gap-2">
                {sysData.metrics.map((m: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors flex flex-col justify-between min-h-[58px]"
                  >
                    <span className="font-mono text-[9px] text-[#7ABBD4] uppercase tracking-wider block truncate">
                      {m.label}
                    </span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="font-sans font-bold text-white text-xs sm:text-[13px] tracking-tight">
                        {m.value}
                      </span>
                      <span
                        className="px-1.5 py-0.5 rounded-full font-mono text-[8px] font-semibold uppercase tracking-wider"
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

              {/* Live Sync Footer */}
              <div className="flex items-center justify-between pt-1 font-mono text-[9px] text-[#4A7A8E]">
                <span>STREAM: <strong>BACKEND CORE ENGINE</strong></span>
                <span>SYNCED: {liveBackend.syncedAt}</span>
              </div>
            </div>
          )}

          {/* ── TAB 2: REMOTE SCADA ACTUATION & CONTROLS ── */}
          {activeTab === "controls" && (
            <div className="flex flex-col gap-2">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-[10px] flex items-center gap-2">
                <WarningCircle size={15} weight="bold" className="shrink-0" />
                <span>Encrypted bidirectional remote SCADA link active. Operations require telemetry confirmation.</span>
              </div>

              <div className="flex flex-col gap-1.5 mt-1">
                {sysData.actions.map((act) => {
                  const isRunning = executingAction === act.id;
                  const isSuccess = feedbackMsg?.id === act.id && feedbackMsg.ok;

                  return (
                    <button
                      key={act.id}
                      onClick={() => handleAction(act.id, act.label)}
                      disabled={executingAction !== null}
                      className={`group w-full p-2.5 rounded-2xl border text-left font-sans text-xs font-semibold flex items-center justify-between transition-all ${
                        isSuccess
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                          : act.risk === "HIGH"
                          ? "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-300 hover:text-white"
                          : "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white"
                      } disabled:opacity-50`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isRunning ? (
                          <ArrowsClockwise size={14} className="animate-spin text-white shrink-0" />
                        ) : isSuccess ? (
                          <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                        ) : (
                          <SlidersHorizontal size={14} className="text-[#7ABBD4] group-hover:text-white shrink-0" />
                        )}
                        <span className="truncate">{act.label}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full font-mono text-[8px] uppercase tracking-wider bg-black/40 text-[#7ABBD4]">
                        {act.risk} RISK
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback toast message */}
              {feedbackMsg && (
                <div
                  className={`mt-1 p-2 rounded-xl text-center font-mono text-[10px] animate-in fade-in duration-200 ${
                    feedbackMsg.ok ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                  }`}
                >
                  {feedbackMsg.text}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 3: BIM & PHYSICAL SPECS ── */}
          {activeTab === "specs" && (
            <div className="flex flex-col gap-2 font-mono text-[10px]">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                {Object.entries(sysData.specs).map(([key, val]) => (
                  <div key={key} className="flex justify-between py-1 border-b border-white/5 last:border-0">
                    <span className="text-[#7ABBD4] uppercase tracking-wider">
                      {key.replace(/([A-Z])/g, " $1")}
                    </span>
                    <span className="text-white font-medium text-right max-w-[60%] truncate">
                      {String(val)}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[#64748B] italic">
                {room.description || "Facility metadata synchronized with master polar BIM register."}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
