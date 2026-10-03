"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Buildings,
  Lightning,
  Package,
  ThermometerCold,
  Drop,
  GasPump,
  Atom,
  Heartbeat,
  Cpu,
  Radio,
  Wrench,
  Compass,
  CaretUp,
  CaretRight,
  X,
  Gauge,
  ArrowsClockwise,
  Fire,
  DotsSixVertical,
} from "@phosphor-icons/react";
import { api, Station } from "@/lib/api";
import { DraggablePanel } from "./DraggablePanel";

export type DomainCategoryKey = "infra" | "energy" | "logistics" | "environment";

export interface SystemFacilityItem {
  id: string;
  label: string;
  sublabel: string;
  category: DomainCategoryKey | string;
  icon: any;
  color: string;
  targetRoomId: string;
  keyboardKey?: string;
  badge?: string;
  getBadge?: (live: LiveSystemMetrics) => string;
}

export interface LiveSystemMetrics {
  tempC: number;
  windKmh: number;
  powerKw: number;
  fuelDays: number;
  satLatencyMs: number;
  isLiveNcpor: boolean;
}

export interface DomainCategoryConfig {
  id: DomainCategoryKey;
  label: string;
  shortLabel: string;
  icon: any;
  color: string;
  keyboardKey: string;
  getRollupMetric: (live: LiveSystemMetrics) => string;
  subdivisions: SystemFacilityItem[];
}

interface StationSystemDockProps {
  station: Station;
  activeSystemId: string | null;
  onSelectSystem: (system: SystemFacilityItem) => void;
  onResetOverview?: () => void;
  className?: string;
}

// ── DOMAIN DEFINITIONS WITH SUB-DIVISIONS ──
export const STATION_DOMAINS: Record<Station, DomainCategoryConfig[]> = {
  BHARATI: [
    {
      id: "infra",
      label: "Infrastructure",
      shortLabel: "Infra",
      icon: Buildings,
      color: "#00D4A0",
      keyboardKey: "1",
      getRollupMetric: () => "Potable & Grid",
      subdivisions: [
        {
          id: "bharati_boiler_heating",
          label: "Hydronic Heating Flow",
          sublabel: "CHPP Cogeneration + Riser Loop (Overhead)",
          category: "infra",
          icon: Fire,
          color: "#FFAA00",
          targetRoomId: "chpp_generators",
          getBadge: () => "+82.5°C Flow",
        },
        {
          id: "ro_water_plant",
          label: "RO Desalination & Sea Intake",
          sublabel: "Quilty Bay Seawater Intake (Campus Ext)",
          category: "infra",
          icon: Drop,
          color: "#00D4A0",
          targetRoomId: "seawater_pumphouse",
          getBadge: () => "Potable",
        },
        {
          id: "uv_disinfection",
          label: "Potable UV Disinfection Skid",
          sublabel: "Pressurization & UV Sterilization (L2)",
          category: "infra",
          icon: Drop,
          color: "#00D4A0",
          targetRoomId: "uv_disinfection",
          getBadge: () => "Sterile",
        },
        {
          id: "radome_deck",
          label: "ISRO Satellite Radome Deck",
          sublabel: "Dual C/Ku-Band Tracking (L4 Roof)",
          category: "infra",
          icon: Radio,
          color: "#A855F7",
          targetRoomId: "radome_deck",
          getBadge: (l) => `${l.satLatencyMs}ms`,
        },
        {
          id: "hospital",
          label: "Medical Clinic & Surgical OT",
          sublabel: "Critical Care Bay & Telemedicine (L3)",
          category: "infra",
          icon: Heartbeat,
          color: "#10B981",
          targetRoomId: "hospital",
          getBadge: () => "OT Sterile",
        },
        {
          id: "bms_server_room",
          label: "BMS & SCADA Network NOC",
          sublabel: "Station Automation Servers (L3)",
          category: "infra",
          icon: Cpu,
          color: "#38BDF8",
          targetRoomId: "bms_server_room",
          getBadge: () => "Online",
        },
        {
          id: "helipads",
          label: "Logistics Helipads (H1-H3)",
          sublabel: "Kamov Ka-32 Polar Helideck (Campus Ext)",
          category: "infra",
          icon: Buildings,
          color: "#00D4A0",
          targetRoomId: "helipads",
          getBadge: () => "Clear",
        },
      ],
    },
    {
      id: "energy",
      label: "Energy",
      shortLabel: "Energy",
      icon: Lightning,
      color: "#FFAA00",
      keyboardKey: "2",
      getRollupMetric: (l) => `${l.powerKw} kW`,
      subdivisions: [
        {
          id: "power",
          label: "CHPP Generator Hall",
          sublabel: "3x Volvo Penta 280kVA GenSets (L2)",
          category: "energy",
          icon: Lightning,
          color: "#FFAA00",
          targetRoomId: "chpp_generators",
          getBadge: (l) => `${l.powerKw} kW`,
        },
        {
          id: "mlvd_panel",
          label: "Main LV Distribution Switchgear",
          sublabel: "415V 3-Phase Bus & Switchboard (L2)",
          category: "energy",
          icon: Cpu,
          color: "#FFAA00",
          targetRoomId: "mlvd_panel",
          getBadge: () => "415V 50Hz",
        },
        {
          id: "ups_batteries",
          label: "Emergency UPS Battery Room",
          sublabel: "LiFePO4 Redundant Rack System (L2)",
          category: "energy",
          icon: Lightning,
          color: "#FFAA00",
          targetRoomId: "ups_batteries",
          getBadge: () => "100% Float",
        },
        {
          id: "fuel_day_tank",
          label: "CHPP Fuel Day Tank Room",
          sublabel: "470L Boost Transfer Skid (L2)",
          category: "energy",
          icon: GasPump,
          color: "#FFAA00",
          targetRoomId: "fuel_day_tank",
          getBadge: () => "Pressurized",
        },
      ],
    },
    {
      id: "logistics",
      label: "Logistics",
      shortLabel: "Logistics",
      icon: Package,
      color: "#F59E0B",
      keyboardKey: "3",
      getRollupMetric: (l) => `${l.fuelDays}d Autonomy`,
      subdivisions: [
        {
          id: "fuel",
          label: "Bulk Fuel Tank Farm",
          sublabel: "Polar ATF-50 Bund Containment (Ext)",
          category: "logistics",
          icon: GasPump,
          color: "#F59E0B",
          targetRoomId: "fuel_farm",
          getBadge: (l) => `${l.fuelDays}d Autonomy`,
        },
        {
          id: "garage_lift",
          label: "PistenBully Maintenance Bay",
          sublabel: "Hydraulic Scissor Lift (L1 Garage)",
          category: "logistics",
          icon: Wrench,
          color: "#F59E0B",
          targetRoomId: "garage_lift",
          getBadge: () => "Service Bay",
        },
        {
          id: "workshop_bench",
          label: "Mechanical Tool Workshop",
          sublabel: "Lathe, TIG Welding & Spares (L1)",
          category: "logistics",
          icon: Wrench,
          color: "#F59E0B",
          targetRoomId: "workshop_bench",
          getBadge: () => "Tool Ready",
        },
        {
          id: "waste_baler",
          label: "Environmental Waste Compactor",
          sublabel: "Hydraulic Baler - Madrid Protocol (L1)",
          category: "logistics",
          icon: Package,
          color: "#F59E0B",
          targetRoomId: "waste_baler",
          getBadge: () => "Compacted",
        },
        {
          id: "boot_wash",
          label: "Airlock & Mudroom Boot Wash",
          sublabel: "Thermal Entry & Parka Lockers (L1)",
          category: "logistics",
          icon: Package,
          color: "#F59E0B",
          targetRoomId: "boot_wash",
          getBadge: () => "Pressurized",
        },
      ],
    },
    {
      id: "environment",
      label: "Environment",
      shortLabel: "Env",
      icon: ThermometerCold,
      color: "#00A8FF",
      keyboardKey: "4",
      getRollupMetric: (l) => `${l.tempC}°C`,
      subdivisions: [
        {
          id: "weather",
          label: "NCPOR Weather Mast AWS",
          sublabel: "Atmospheric AWS Meteorology (L4)",
          category: "environment",
          icon: ThermometerCold,
          color: "#00A8FF",
          targetRoomId: "roof_terrace",
          getBadge: (l) => `${l.tempC}°C`,
        },
        {
          id: "lab_bio",
          label: "Environmental & Biology Lab",
          sublabel: "Extremophile Incubation & Bio-Sensors (L2)",
          category: "environment",
          icon: Atom,
          color: "#00A8FF",
          targetRoomId: "lab_bio",
          getBadge: () => "Bio Clean",
        },
        {
          id: "lab_geo",
          label: "Geoscience & Petrography Lab",
          sublabel: "Ice Core & Mineral Analyzers (L2)",
          category: "environment",
          icon: Atom,
          color: "#00A8FF",
          targetRoomId: "lab_geo",
          getBadge: () => "Core Logging",
        },
        {
          id: "roof_terrace",
          label: "Observation Roof Terrace",
          sublabel: "Katabatic Wind & Solar Flux Deck (L4)",
          category: "environment",
          icon: ThermometerCold,
          color: "#00A8FF",
          targetRoomId: "roof_terrace",
          getBadge: (l) => `${l.windKmh} km/h`,
        },
      ],
    },
  ],
  MAITRI: [
    {
      id: "infra",
      label: "Infrastructure",
      shortLabel: "Infra",
      icon: Buildings,
      color: "#00D4A0",
      keyboardKey: "1",
      getRollupMetric: () => "Calorifier & STP",
      subdivisions: [
        {
          id: "maitri_boiler_heating",
          label: "Hydronic Heating Flow",
          sublabel: "Riello Boiler + Heat Recovery Loop (Overhead)",
          category: "infra",
          icon: Fire,
          color: "#FFAA00",
          targetRoomId: "room_boiler",
          getBadge: () => "+82.4°C Flow",
        },
        {
          id: "water",
          label: "Lake Priyadarshini Boiler",
          sublabel: "280m Heated Gantry Intake & Calorifiers",
          category: "infra",
          icon: Drop,
          color: "#00D4A0",
          targetRoomId: "room_boiler",
          getBadge: () => "Calorifier",
        },
        {
          id: "room_stp",
          label: "Central Sewage Treatment Facility",
          sublabel: "MBBR Biological Digestion & UV Skid",
          category: "infra",
          icon: Drop,
          color: "#00D4A0",
          targetRoomId: "room_stp",
          getBadge: () => "Madrid Standard",
        },
        {
          id: "satcom",
          label: "Comms & Satellite NOC",
          sublabel: "Inmarsat / High-Latitude VHF Transceivers",
          category: "infra",
          icon: Radio,
          color: "#A855F7",
          targetRoomId: "lab_comms_telemetry",
          getBadge: (l) => `${l.satLatencyMs}ms`,
        },
        {
          id: "habitat",
          label: "Hospital Suite & Surgical OT",
          sublabel: "Critical Care Berths & Telemedicine",
          category: "infra",
          icon: Heartbeat,
          color: "#10B981",
          targetRoomId: "room_hospital",
          getBadge: () => "OT Sterile",
        },
      ],
    },
    {
      id: "energy",
      label: "Energy",
      shortLabel: "Energy",
      icon: Lightning,
      color: "#FFAA00",
      keyboardKey: "2",
      getRollupMetric: (l) => `${l.powerKw} kW`,
      subdivisions: [
        {
          id: "power_complex_ravi",
          label: "Ravi Complex (4x 150 kVA)",
          sublabel: "4x 150 kVA Diesel GenSets · Primary Lead Microgrid",
          category: "energy",
          icon: Lightning,
          color: "#FFAA00",
          targetRoomId: "room_powerhouse_ravi",
          getBadge: () => "Ravi: 1/4 ON (150kVA)",
        },
        {
          id: "power_complex_surya",
          label: "Surya Complex (4x 62.5 kVA)",
          sublabel: "4x 62.5 kVA Diesel GenSets · Mid-Load Grid Array",
          category: "energy",
          icon: Lightning,
          color: "#FFAA00",
          targetRoomId: "room_powerhouse_surya",
          getBadge: () => "Surya: 1/4 ON (62.5kVA)",
        },
        {
          id: "power_complex_aditya",
          label: "Aditya Complex (4x 62.5 kVA)",
          sublabel: "4x 62.5 kVA Diesel GenSets · Auxiliary Standby Array",
          category: "energy",
          icon: Lightning,
          color: "#FFAA00",
          targetRoomId: "room_powerhouse_aditya",
          getBadge: () => "Aditya: 0/4 Standby",
        },
        {
          id: "substation_racks",
          label: "Microgrid Synchronizer Bus",
          sublabel: "415V 3-Phase Auto-Bus Coupler & Harmonic Filter",
          category: "energy",
          icon: Cpu,
          color: "#FFAA00",
          targetRoomId: "room_powerhouse",
          getBadge: () => "50.00 Hz Synch",
        },
        {
          id: "emergency_genset",
          label: "Auxiliary Auto-Transfer Switch",
          sublabel: "Cold-Start Standby Diesel Auxiliary ATS",
          category: "energy",
          icon: Lightning,
          color: "#FFAA00",
          targetRoomId: "room_powerhouse",
          getBadge: () => "ATS Armed",
        },
      ],
    },
    {
      id: "logistics",
      label: "Logistics",
      shortLabel: "Logistics",
      icon: Package,
      color: "#F59E0B",
      keyboardKey: "3",
      getRollupMetric: (l) => `${l.fuelDays}d Autonomy`,
      subdivisions: [
        {
          id: "fuel",
          label: "Bulk Fuel Farm",
          sublabel: "50kL Polar ATF-50 Bund Tank Storage",
          category: "logistics",
          icon: GasPump,
          color: "#F59E0B",
          targetRoomId: "fuel_farm",
          getBadge: (l) => `${l.fuelDays}d Autonomy`,
        },
        {
          id: "maitri_carpentry_waste",
          label: "Carpentry & Waste Mgmt Room",
          sublabel: "Waste Segregation, Crating & Baler (Madrid Protocol)",
          category: "logistics",
          icon: Wrench,
          color: "#F59E0B",
          targetRoomId: "room_carpentry_waste",
          getBadge: () => "Madrid Baler",
        },
        {
          id: "maitri_dry_food",
          label: "9x Dry Food Storage Bays",
          sublabel: "18-Month Overwinter Provisions Cache (Bays 01-09)",
          category: "logistics",
          icon: Package,
          color: "#F59E0B",
          targetRoomId: "room_dry_food",
          getBadge: () => "9 Bays OK",
        },
        {
          id: "maitri_freezers",
          label: "Dual -4°C Walk-In Deep Freezers",
          sublabel: "Freezer Unit 01 & 02 (-4°C Perishable Cold Store)",
          category: "logistics",
          icon: ThermometerCold,
          color: "#F59E0B",
          targetRoomId: "room_cold_storage",
          getBadge: () => "-4.2°C Stabilized",
        },
        {
          id: "vehicle_workshop",
          label: "Snow Vehicle Maintenance Shed",
          sublabel: "PistenBully & Crane Spares Workshop",
          category: "logistics",
          icon: Wrench,
          color: "#F59E0B",
          targetRoomId: "fuel_farm",
          getBadge: () => "Workshop OK",
        },
        {
          id: "water_pipeline",
          label: "Freshwater Pipeline Gantry",
          sublabel: "Heated Supply Line from Priyadarshini",
          category: "logistics",
          icon: Package,
          color: "#F59E0B",
          targetRoomId: "room_boiler",
        },
      ],
    },
    {
      id: "environment",
      label: "Environment",
      shortLabel: "Env",
      icon: ThermometerCold,
      color: "#00A8FF",
      keyboardKey: "4",
      getRollupMetric: (l) => `${l.tempC}°C`,
      subdivisions: [
        {
          id: "weather",
          label: "IMD Weather AWS",
          sublabel: "Katabatic AWS Weather Observatory",
          category: "environment",
          icon: ThermometerCold,
          color: "#00A8FF",
          targetRoomId: "lab_imd_meteo",
          getBadge: (l) => `${l.tempC}°C`,
        },
        {
          id: "science",
          label: "IIG Kamet Geomagnetic Lab",
          sublabel: "3-Axis Variometers & Aurora Observatory",
          category: "environment",
          icon: Atom,
          color: "#00A8FF",
          targetRoomId: "lab_kamet_geomag",
          getBadge: () => "IIG 3-Axis",
        },
        {
          id: "lab_ncpor_physics",
          label: "NCPOR Atmospheric Physics Lab",
          sublabel: "GHG Monitors, Solar Flux & Aerosols",
          category: "environment",
          icon: Atom,
          color: "#00A8FF",
          targetRoomId: "lab_ncpor_physics",
          getBadge: () => "GHG Active",
        },
      ],
    },
  ],
};

// Flattened system lookup for backwards compatibility
export const STATION_SYSTEMS: Record<Station, SystemFacilityItem[]> = {
  BHARATI: STATION_DOMAINS.BHARATI.flatMap((d) => d.subdivisions),
  MAITRI: STATION_DOMAINS.MAITRI.flatMap((d) => d.subdivisions),
};

export function StationSystemDock({
  station,
  activeSystemId,
  onSelectSystem,
  onResetOverview,
  className = "",
}: StationSystemDockProps) {
  const [metrics, setMetrics] = useState<LiveSystemMetrics>({
    tempC: station === "BHARATI" ? -13.6 : -9.8,
    windKmh: station === "BHARATI" ? 27.5 : 88.8,
    powerKw: station === "BHARATI" ? 147.0 : 142.0,
    fuelDays: station === "BHARATI" ? 290 : 219,
    satLatencyMs: 42,
    isLiveNcpor: true,
  });

  const domains = useMemo(() => {
    return STATION_DOMAINS[station] || STATION_DOMAINS.BHARATI;
  }, [station]);

  // Which domain drawer is open: "infra" | "energy" | "logistics" | "environment" | null
  const [openDomainId, setOpenDomainId] = useState<DomainCategoryKey | null>(null);

  // Poll live metrics for dock badges
  const refreshMetrics = useCallback(async () => {
    try {
      const [energy, logistics, env, net] = await Promise.all([
        api.getEnergy(station),
        api.getLogistics(station),
        api.getEnvironment(station),
        api.getNetwork(station),
      ]);

      setMetrics({
        tempC: env.tempC,
        windKmh: env.windSpeedKmh,
        powerKw: energy.currentOutputKw,
        fuelDays: logistics.fuelAutonomyDays,
        satLatencyMs: net.latencyMs,
        isLiveNcpor: env.isLiveNcpor ?? true,
      });
    } catch (err) {
      console.warn("[System Dock] Metrics poll fallback active", err);
    }
  }, [station]);

  useEffect(() => {
    refreshMetrics();
    const interval = setInterval(refreshMetrics, 6000);
    return () => clearInterval(interval);
  }, [refreshMetrics]);

  // Find active domain from activeSystemId if user clicked on 3D canvas directly
  const activeDomain = useMemo(() => {
    if (!activeSystemId) return null;
    for (const d of domains) {
      if (d.subdivisions.some((sub) => sub.id === activeSystemId || sub.targetRoomId === activeSystemId)) {
        return d;
      }
    }
    return null;
  }, [domains, activeSystemId]);

  // When activeDomain changes externally, optionally align drawer if already open
  useEffect(() => {
    if (activeDomain && openDomainId && openDomainId !== activeDomain.id) {
      setOpenDomainId(activeDomain.id);
    }
  }, [activeDomain, openDomainId]);

  // Toggle domain shelf
  const handleToggleDomain = useCallback((domainId: DomainCategoryKey) => {
    setOpenDomainId((prev) => (prev === domainId ? null : domainId));
  }, []);

  // Handle selecting a specific sub-division
  const handleSelectSubdivision = useCallback(
    (sub: SystemFacilityItem) => {
      onSelectSystem(sub);
    },
    [onSelectSystem]
  );

  // Keyboard Navigation:
  // 0 / Esc: Reset to overview or close drawer
  // 1: Infrastructure, 2: Energy, 3: Logistics, 4: Environment
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === "0") {
        setOpenDomainId(null);
        if (onResetOverview) onResetOverview();
        return;
      }

      if (e.key === "Escape") {
        if (openDomainId) {
          setOpenDomainId(null);
        } else if (onResetOverview) {
          onResetOverview();
        }
        return;
      }

      const domain = domains.find((d) => d.keyboardKey === e.key);
      if (domain) {
        setOpenDomainId((prev) => (prev === domain.id ? null : domain.id));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [domains, openDomainId, onResetOverview]);

  const currentOpenDomain = domains.find((d) => d.id === openDomainId);

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex flex-col items-center select-none max-w-[calc(100vw-24px)] ${className}`}
    >
      {/* ── SUB-DIVISIONS POPUP DRAWER (FLOATING ABOVE DOCK - DRAGGABLE ANYWHERE) ── */}
      {currentOpenDomain && (
        <DraggablePanel className="mb-2 w-full max-w-3xl">
          <div className="w-full rounded-2xl bg-[#060D1A]/95 border border-white/[0.14] shadow-[0_24px_60px_rgba(0,0,0,0.92)] backdrop-blur-2xl p-3 animate-in slide-in-from-bottom-2 fade-in duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08] px-1 cursor-grab active:cursor-grabbing">
              <div className="flex items-center gap-2">
                <DotsSixVertical size={16} className="text-white/40 hover:text-cyan-400 transition-colors shrink-0" />
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${currentOpenDomain.color}25`,
                    color: currentOpenDomain.color,
                  }}
                >
                  <currentOpenDomain.icon size={14} weight="bold" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-white">
                    {currentOpenDomain.label}
                  </span>
                  <span className="font-mono text-[10px] text-[#7ABBD4]">
                    Sub-Divisions ({currentOpenDomain.subdivisions.length})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline font-mono text-[9px] text-white/40">
                  Drag header to move anywhere · Press [1-4] switch · [Esc] close
                </span>
                <button
                  onClick={() => setOpenDomainId(null)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                  title="Close Drawer (Esc)"
                >
                  <X size={13} weight="bold" />
                </button>
              </div>
            </div>

          {/* Sub-divisions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[320px] overflow-y-auto pr-0.5 no-scrollbar">
            {currentOpenDomain.subdivisions.map((sub) => {
              const SubIcon = sub.icon;
              const isSelected =
                activeSystemId === sub.id || activeSystemId === sub.targetRoomId;
              const badgeText = sub.getBadge ? sub.getBadge(metrics) : sub.badge;

              return (
                <button
                  key={sub.id}
                  onClick={() => handleSelectSubdivision(sub)}
                  className={`group relative flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-white/15 border-white/30 shadow-md"
                      : "bg-white/[0.03] hover:bg-white/[0.08] border-white/[0.08] hover:border-white/20"
                  }`}
                >
                  {/* Left accent bar if selected */}
                  {isSelected && (
                    <div
                      className="absolute left-0 top-2 bottom-2 w-1 rounded-r"
                      style={{ backgroundColor: currentOpenDomain.color }}
                    />
                  )}

                  {/* Icon */}
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                    style={{
                      backgroundColor: isSelected
                        ? `${currentOpenDomain.color}35`
                        : "rgba(255,255,255,0.06)",
                      color: isSelected ? currentOpenDomain.color : "#9CB5C8",
                    }}
                  >
                    <SubIcon size={14} weight="bold" />
                  </div>

                  {/* Text details */}
                  <div className="flex flex-col min-w-0 flex-1 leading-tight">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[12px] font-semibold text-white/95 group-hover:text-white truncate">
                        {sub.label}
                      </span>
                      <CaretRight
                        size={11}
                        className="text-white/30 group-hover:text-white shrink-0 group-hover:translate-x-0.5 transition-transform"
                      />
                    </div>
                    <span className="text-[10px] text-[#7ABBD4]/80 group-hover:text-[#7ABBD4] truncate mt-0.5">
                      {sub.sublabel}
                    </span>

                    {/* Live Badge */}
                    {badgeText && (
                      <div className="mt-1.5 flex items-center">
                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-white/[0.07] text-[#9CD6EA] border border-white/[0.08] tabular-nums">
                          {badgeText}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </DraggablePanel>
      )}

      {/* ── CORE 4 DOMAINS INSTRUMENT DOCK (DRAGGABLE ANYWHERE) ── */}
      <DraggablePanel>
        <div className="rounded-2xl bg-[#060D1A]/95 border border-white/[0.12] px-2 py-1.5 flex items-center gap-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.88)] backdrop-blur-2xl overflow-x-auto no-scrollbar">
          
          {/* Campus Overview Button */}
        {onResetOverview && (
          <button
            onClick={() => {
              setOpenDomainId(null);
              onResetOverview();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[11px] font-semibold transition-all shrink-0 ${
              activeSystemId === null && openDomainId === null
                ? "bg-white/15 text-white border border-white/20 shadow-sm"
                : "text-[#7ABBD4] hover:text-white hover:bg-white/[0.05]"
            }`}
            title="Overview (0 / Esc)"
          >
            <Compass size={13} className="text-[#00A8FF]" />
            <span className="hidden sm:inline uppercase tracking-wider text-[10px]">Overview</span>
            <kbd className="hidden lg:inline text-[9px] text-white/40">0</kbd>
          </button>
        )}

        <div className="w-px h-5 bg-white/10 mx-0.5 shrink-0" />

        {/* ONLY THE 4 CORE DOMAINS: INFRA, ENERGY, LOGISTICS, ENVIRONMENT */}
        {domains.map((dom) => {
          const Icon = dom.icon;
          const isDrawerOpen = openDomainId === dom.id;
          const isDomainActive =
            isDrawerOpen ||
            activeDomain?.id === dom.id ||
            dom.subdivisions.some(
              (sub) => sub.id === activeSystemId || sub.targetRoomId === activeSystemId
            );
          const rollupVal = dom.getRollupMetric(metrics);

          return (
            <button
              key={dom.id}
              onClick={() => handleToggleDomain(dom.id)}
              className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all shrink-0 text-left ${
                isDomainActive
                  ? "bg-white/15 text-white border border-white/20 shadow-sm"
                  : "bg-transparent hover:bg-white/[0.05] text-[#8EAABF] hover:text-white border border-transparent"
              }`}
              title={`${dom.label} Sub-Divisions (Press ${dom.keyboardKey})`}
            >
              {/* Icon with Subtle Tint */}
              <div
                className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                style={{
                  backgroundColor: isDomainActive ? `${dom.color}30` : "rgba(255,255,255,0.05)",
                  color: isDomainActive ? dom.color : "#9CB5C8",
                }}
              >
                <Icon size={12} weight="bold" />
              </div>

              {/* Label & Rollup Metric */}
              <div className="flex flex-col leading-none pr-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold tracking-tight uppercase text-white/90 group-hover:text-white">
                    {dom.label}
                  </span>
                  <span className="hidden md:inline font-mono text-[9px] text-white/30">
                    [{dom.keyboardKey}]
                  </span>
                  <CaretUp
                    size={10}
                    className={`transition-transform duration-200 ${
                      isDrawerOpen
                        ? "text-white rotate-0"
                        : "text-white/30 -rotate-180 group-hover:text-white/60"
                    }`}
                  />
                </div>
                <span className="font-mono text-[9px] text-[#7ABBD4] mt-0.5 tabular-nums">
                  {rollupVal}
                </span>
              </div>

              {/* Solid 2px Active Accent Underline */}
              {isDomainActive && (
                <div
                  className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                  style={{ backgroundColor: dom.color }}
                />
              )}
            </button>
          );
        })}
        </div>
      </DraggablePanel>
    </div>
  );
}
