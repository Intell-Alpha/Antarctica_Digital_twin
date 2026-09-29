"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Lightning,
  ThermometerCold,
  Radio,
  Drop,
  GasPump,
  Atom,
  Heartbeat,
  Compass,
  CaretRight,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import { api, Station } from "@/lib/api";

export interface SystemFacilityItem {
  id: string;
  label: string;
  sublabel: string;
  category: "power" | "weather" | "satcom" | "water" | "fuel" | "science" | "habitat";
  icon: any;
  color: string;
  targetRoomId: string;
  keyboardKey: string;
  getBadge: (live: LiveSystemMetrics) => string;
}

export interface LiveSystemMetrics {
  tempC: number;
  windKmh: number;
  powerKw: number;
  fuelDays: number;
  satLatencyMs: number;
  isLiveNcpor: boolean;
}

interface StationSystemDockProps {
  station: Station;
  activeSystemId: string | null;
  onSelectSystem: (system: SystemFacilityItem) => void;
  onResetOverview?: () => void;
  className?: string;
}

export const STATION_SYSTEMS: Record<Station, SystemFacilityItem[]> = {
  BHARATI: [
    {
      id: "power",
      label: "CHPP Powerhouse",
      sublabel: "3x Volvo Penta GenSets (L2)",
      category: "power",
      icon: Lightning,
      color: "#FFAA00",
      targetRoomId: "chpp_generators",
      keyboardKey: "1",
      getBadge: (l) => `${l.powerKw} kW`,
    },
    {
      id: "weather",
      label: "NCPOR Weather Mast",
      sublabel: "AWS Meteorology (L4 Terrace)",
      category: "weather",
      icon: ThermometerCold,
      color: "#00A8FF",
      targetRoomId: "roof_terrace",
      keyboardKey: "2",
      getBadge: (l) => `${l.tempC}°C`,
    },
    {
      id: "satcom",
      label: "ISRO Radome Deck",
      sublabel: "Dual C/Ku-Band Radials (L4)",
      category: "satcom",
      icon: Radio,
      color: "#A855F7",
      targetRoomId: "radome_deck",
      keyboardKey: "3",
      getBadge: (l) => `${l.satLatencyMs}ms`,
    },
    {
      id: "water",
      label: "RO Desalination & SWI",
      sublabel: "Quilty Bay Intake (Campus Ext)",
      category: "water",
      icon: Drop,
      color: "#00D4A0",
      targetRoomId: "seawater_pumphouse",
      keyboardKey: "4",
      getBadge: () => "Potable",
    },
    {
      id: "fuel",
      label: "Bulk Fuel Tank Farm",
      sublabel: "Aviation Turbine Fuel (Campus Ext)",
      category: "fuel",
      icon: GasPump,
      color: "#F59E0B",
      targetRoomId: "fuel_farm",
      keyboardKey: "5",
      getBadge: (l) => `${l.fuelDays}d Autonomy`,
    },
    {
      id: "science",
      label: "Science & Biology Labs",
      sublabel: "Extreme Microbiology & Geo (L2)",
      category: "science",
      icon: Atom,
      color: "#EC4899",
      targetRoomId: "lab_bio",
      keyboardKey: "6",
      getBadge: () => "BARC Mon.",
    },
    {
      id: "habitat",
      label: "Hospital & Medical OT",
      sublabel: "Critical Care Bay (L3 Living)",
      category: "habitat",
      icon: Heartbeat,
      color: "#10B981",
      targetRoomId: "hospital",
      keyboardKey: "7",
      getBadge: () => "OT Sterile",
    },
  ],
  MAITRI: [
    {
      id: "power",
      label: "Powerhouse Generators",
      sublabel: "3x Kirloskar-Cummins Array",
      category: "power",
      icon: Lightning,
      color: "#FFAA00",
      targetRoomId: "room_powerhouse",
      keyboardKey: "1",
      getBadge: (l) => `${l.powerKw} kW`,
    },
    {
      id: "weather",
      label: "IMD Weather AWS",
      sublabel: "Atmospheric Mast Observatory",
      category: "weather",
      icon: ThermometerCold,
      color: "#00A8FF",
      targetRoomId: "lab_imd_meteo",
      keyboardKey: "2",
      getBadge: (l) => `${l.tempC}°C`,
    },
    {
      id: "satcom",
      label: "Comms & Satellite NOC",
      sublabel: "Inmarsat / VHF Operations",
      category: "satcom",
      icon: Radio,
      color: "#A855F7",
      targetRoomId: "lab_comms_telemetry",
      keyboardKey: "3",
      getBadge: (l) => `${l.satLatencyMs}ms`,
    },
    {
      id: "water",
      label: "Lake Intake & Boiler",
      sublabel: "Priyadarshini 280m Gantry",
      category: "water",
      icon: Drop,
      color: "#00D4A0",
      targetRoomId: "room_boiler",
      keyboardKey: "4",
      getBadge: () => "Calorifier",
    },
    {
      id: "fuel",
      label: "Bulk Fuel Farm",
      sublabel: "Polar ATF-50 Bund Storage",
      category: "fuel",
      icon: GasPump,
      color: "#F59E0B",
      targetRoomId: "fuel_farm",
      keyboardKey: "5",
      getBadge: (l) => `${l.fuelDays}d Autonomy`,
    },
    {
      id: "science",
      label: "IIG Geomagnetic Lab",
      sublabel: "Kamet Observatory & Aurora",
      category: "science",
      icon: Atom,
      color: "#EC4899",
      targetRoomId: "lab_kamet_geomag",
      keyboardKey: "6",
      getBadge: () => "IIG 3-Axis",
    },
    {
      id: "habitat",
      label: "Hospital Suite & OT",
      sublabel: "Surgical Operating Suite",
      category: "habitat",
      icon: Heartbeat,
      color: "#10B981",
      targetRoomId: "room_hospital",
      keyboardKey: "7",
      getBadge: () => "OT Sterile",
    },
  ],
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

  const [isHovered, setIsHovered] = useState<string | null>(null);

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

  const systems = STATION_SYSTEMS[station] || STATION_SYSTEMS.BHARATI;

  // Keyboard Navigation: Press 1-7 to fly camera straight to building
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === "0" || e.key === "Escape") {
        if (onResetOverview) onResetOverview();
        return;
      }

      const matched = systems.find((s) => s.keyboardKey === e.key);
      if (matched) {
        onSelectSystem(matched);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [systems, onSelectSystem, onResetOverview]);

  return (
    <div
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex flex-col items-center gap-2 select-none max-w-[calc(100vw-24px)] ${className}`}
    >
      {/* ── DOUBLE-BEZEL HARDWARE ENCLOSURE (Awwwards-Tier) ── */}
      <div className="p-1 sm:p-1.5 rounded-[2rem] bg-black/40 ring-1 ring-white/10 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85)]">
        <div className="rounded-[calc(2rem-0.375rem)] bg-[#040D1A]/90 border border-white/10 px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          
          {/* Station Campus Overview Button */}
          {onResetOverview && (
            <button
              onClick={onResetOverview}
              className={`group flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full font-mono text-[10px] sm:text-[11px] font-semibold transition-all shrink-0 ${
                activeSystemId === null
                  ? "bg-white/15 text-white shadow-inner"
                  : "bg-white/5 hover:bg-white/10 text-[#7ABBD4] hover:text-white"
              }`}
              title="Return camera to full station campus overview (Press 0 or Esc)"
            >
              <Compass size={14} weight="duotone" className="text-[#00A8FF]" />
              <span className="hidden md:inline uppercase tracking-wider">Campus Overview</span>
              <kbd className="hidden lg:inline-block px-1 py-0.2 rounded bg-white/10 text-[8px] font-mono text-white/60">
                0
              </kbd>
            </button>
          )}

          <div className="w-px h-5 bg-white/10 shrink-0" />

          {/* 7 Core Facility Buttons */}
          {systems.map((sys) => {
            const Icon = sys.icon;
            const isSelected = activeSystemId === sys.id || activeSystemId === sys.targetRoomId;
            const badgeVal = sys.getBadge(metrics);

            return (
              <button
                key={sys.id}
                onClick={() => onSelectSystem(sys)}
                onMouseEnter={() => setIsHovered(sys.id)}
                onMouseLeave={() => setIsHovered(null)}
                className={`group relative flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full transition-all shrink-0 font-sans ${
                  isSelected
                    ? "bg-white/15 ring-1 text-white shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                    : "bg-white/[0.03] hover:bg-white/[0.08] text-[#A6C4D6] hover:text-white"
                }`}
                style={{
                  borderColor: isSelected ? sys.color : "transparent",
                }}
                title={`${sys.label} — ${sys.sublabel} (Press ${sys.keyboardKey})`}
              >
                {/* Icon in Circular Well */}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shrink-0"
                  style={{
                    backgroundColor: `${sys.color}25`,
                    color: sys.color,
                  }}
                >
                  <Icon size={13} weight="bold" />
                </div>

                {/* Text Label & Badge */}
                <div className="flex flex-col text-left leading-none min-w-0 pr-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] sm:text-[11px] font-bold text-white tracking-tight truncate">
                      {sys.label}
                    </span>
                    <kbd className="hidden xl:inline-block px-1 py-0.2 rounded bg-white/10 text-[8px] font-mono text-white/50">
                      {sys.keyboardKey}
                    </kbd>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 font-mono text-[9px]">
                    <span
                      className="w-1 h-1 rounded-full shrink-0"
                      style={{ backgroundColor: sys.color }}
                    />
                    <span className="text-[#7ABBD4] font-medium truncate">{badgeVal}</span>
                  </div>
                </div>

                {/* Active Indicator Pip */}
                {isSelected && (
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-ping shrink-0"
                    style={{ backgroundColor: sys.color }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
