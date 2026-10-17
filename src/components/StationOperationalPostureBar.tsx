"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Snowflake,
  Leaf,
  Atom,
  Warning,
  Radio,
  CaretDown,
  CheckCircle,
  ArrowsClockwise,
  X,
  Gauge,
  Lightning,
  Fire,
  DotsSixVertical,
} from "@phosphor-icons/react";
import { Station } from "@/lib/api";
import { polarAudio } from "@/lib/polarAudioEngine";
import { DraggablePanel } from "./DraggablePanel";

export type StationOperationalPosture =
  | "NOMINAL"
  | "BLIZZARD_LOCKDOWN"
  | "ENERGY_CONSERVATION"
  | "DEEP_SCIENCE"
  | "BLACK_START";

export interface PostureDefinition {
  id: StationOperationalPosture;
  label: string;
  shortLabel: string;
  tagline: string;
  icon: any;
  color: string;
  bgTint: string;
  borderColor: string;
  metrics: {
    powerTargetKw: number;
    fuelRateLh: number;
    traceHeatWm: number;
    roomTempC: number;
    intakeDamperPct: number;
    leadGenset: string;
  };
  actuationSummary: string[];
}

export const STATION_POSTURES: Record<StationOperationalPosture, PostureDefinition> = {
  NOMINAL: {
    id: "NOMINAL",
    label: "Nominal Operations",
    shortLabel: "Nominal",
    tagline: "Standard Baseline Overwintering Profile",
    icon: ShieldCheck,
    color: "#00D4A0",
    bgTint: "rgba(0, 212, 160, 0.12)",
    borderColor: "rgba(0, 212, 160, 0.35)",
    metrics: {
      powerTargetKw: 142.0,
      fuelRateLh: 38.5,
      traceHeatWm: 25,
      roomTempC: 21.0,
      intakeDamperPct: 100,
      leadGenset: "Ravi Gen 01 (Lead)",
    },
    actuationSummary: [
      "Microgrid automated load-balancing at standard 142 kW",
      "Freshwater intake and sewage heat-trace at baseline 25 W/m",
      "Living quarters and hospital HVAC set to +21.0°C",
      "Standard satellite priority queue (P0 telemetry live)",
    ],
  },
  BLIZZARD_LOCKDOWN: {
    id: "BLIZZARD_LOCKDOWN",
    label: "Blizzard Cryo-Lockdown",
    shortLabel: "Cryo-Lockdown",
    tagline: "Maximum Thermal Defense & N+1 Power Redundancy",
    icon: Snowflake,
    color: "#00E5FF",
    bgTint: "rgba(0, 229, 255, 0.14)",
    borderColor: "rgba(0, 229, 255, 0.45)",
    metrics: {
      powerTargetKw: 198.0,
      fuelRateLh: 52.4,
      traceHeatWm: 45,
      roomTempC: 22.5,
      intakeDamperPct: 20,
      leadGenset: "Ravi 01 + Surya 01 (N+1)",
    },
    actuationSummary: [
      "Trace heat boosted to maximum 45 W/m across 280m lake intake",
      "Hot standby generator synchronized in active N+1 parallel",
      "External fresh air dampers throttled to 20% to prevent snow ingestion",
      "Zone 1 storm shutters engaged; non-critical exterior huts isolated",
    ],
  },
  ENERGY_CONSERVATION: {
    id: "ENERGY_CONSERVATION",
    label: "Energy & Fuel Peak-Shaving",
    shortLabel: "Fuel-Save",
    tagline: "Non-Critical Load Shedding (-24% Fuel Burn)",
    icon: Leaf,
    color: "#F59E0B",
    bgTint: "rgba(245, 158, 11, 0.14)",
    borderColor: "rgba(245, 158, 11, 0.4)",
    metrics: {
      powerTargetKw: 108.0,
      fuelRateLh: 29.2,
      traceHeatWm: 20,
      roomTempC: 19.5,
      intakeDamperPct: 80,
      leadGenset: "Surya Gen 01 (Single)",
    },
    actuationSummary: [
      "Non-essential leisure circuits shed (Sauna, Snow-melt coils isolated)",
      "Living quarter thermostats stepped down to +19.5°C eco setpoint",
      "Fuel burn throttled to 29.2 L/h (saves ~220L Arctic ATF-50 daily)",
      "Secondary water purification batches paused during off-peak hours",
    ],
  },
  DEEP_SCIENCE: {
    id: "DEEP_SCIENCE",
    label: "High-Throughput Deep Science",
    shortLabel: "Deep Science",
    tagline: "Ultra-Clean Isolated Power Bus Routing",
    icon: Atom,
    color: "#A855F7",
    bgTint: "rgba(168, 85, 247, 0.14)",
    borderColor: "rgba(168, 85, 247, 0.45)",
    metrics: {
      powerTargetKw: 165.0,
      fuelRateLh: 44.0,
      traceHeatWm: 25,
      roomTempC: 20.5,
      intakeDamperPct: 100,
      leadGenset: "Ravi 01 + Aditya UPS Bus",
    },
    actuationSummary: [
      "Harmonic isolation filters engaged for ISRO Radome tracking",
      "Continuous clean 3-phase bus delivered to Kamet Geomagnetic variometers",
      "High-speed optical telemetry buffer flushed via Inmarsat broadband",
      "LIDAR & atmospheric physics spectrometers energized at 100% duty",
    ],
  },
  BLACK_START: {
    id: "BLACK_START",
    label: "Emergency Black-Start Recovery",
    shortLabel: "Black-Start",
    tagline: "Autonomous Grid Resynchronization Protocol",
    icon: Warning,
    color: "#EF4444",
    bgTint: "rgba(239, 68, 68, 0.18)",
    borderColor: "rgba(239, 68, 68, 0.5)",
    metrics: {
      powerTargetKw: 85.0,
      fuelRateLh: 22.0,
      traceHeatWm: 30,
      roomTempC: 18.0,
      intakeDamperPct: 0,
      leadGenset: "Aditya 01 (Black-Start)",
    },
    actuationSummary: [
      "Cold-start diesel fuel line preheaters energized via emergency battery UPS",
      "Critical life-support bus isolated from non-essential building loads",
      "Riello hydronic heating burner manual override armed",
      "Autonomous automated bus synchronizer cycling at 50.00 Hz target",
    ],
  },
};

interface StationOperationalPostureBarProps {
  station: Station;
  currentPosture: StationOperationalPosture;
  onSelectPosture: (posture: StationOperationalPosture) => void;
  isUplinking?: boolean;
}

export function StationOperationalPostureBar({
  station,
  currentPosture,
  onSelectPosture,
  isUplinking = false,
}: StationOperationalPostureBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<StationOperationalPosture | null>(null);
  const [uplinkStep, setUplinkStep] = useState<"IDLE" | "INTERLOCK" | "SATELLITE" | "VERIFIED">("IDLE");

  const currentDef = STATION_POSTURES[currentPosture] || STATION_POSTURES.NOMINAL;
  const Icon = currentDef.icon;

  const handleCommandPosture = (postureKey: StationOperationalPosture) => {
    if (postureKey === currentPosture || uplinkStep !== "IDLE") return;

    setSelectedTarget(postureKey);
    setUplinkStep("INTERLOCK");

    // 1. Safety Interlock Handshake
    setTimeout(() => {
      setUplinkStep("SATELLITE");

      // 2. Simulated Satellite Roundtrip (580ms latency to Antarctica)
      setTimeout(() => {
        setUplinkStep("VERIFIED");
        polarAudio.playAlert("critical");

        // 3. Execution Confirmation
        setTimeout(() => {
          onSelectPosture(postureKey);
          setUplinkStep("IDLE");
          setSelectedTarget(null);
          setIsOpen(false);
        }, 600);
      }, 700);
    }, 450);
  };

  return (
    <div className="relative">
      {/* ── ACTIVE POSTURE CAPSULE TRIGGER ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-xl transition-all shadow-sm group hover:scale-[1.02]"
        style={{
          backgroundColor: currentDef.bgTint,
          borderColor: currentDef.borderColor,
        }}
        title={`Current Station Posture: ${currentDef.label} (Click to Change Macro Operations)`}
      >
        <div
          className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${currentDef.color}25`, color: currentDef.color }}
        >
          <Icon size={13} weight="bold" />
        </div>

        <div className="flex flex-col text-left leading-none">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-white tracking-tight">
              {currentDef.shortLabel}
            </span>
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0"
              style={{ backgroundColor: currentDef.color }}
            />
          </div>
          <span className="font-mono text-[9px] text-[#7ABBD4] mt-0.5">
            {currentDef.metrics.powerTargetKw} kW · {currentDef.metrics.leadGenset.split(" ")[0]}
          </span>
        </div>

        <CaretDown
          size={12}
          className={`text-white/40 transition-transform duration-200 group-hover:text-white ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* ── MODAL POSTURE COMMAND CONSOLE DRAWER (DRAGGABLE HUD PANEL) ── */}
      {isOpen && (
        <div className="fixed top-14 right-3 sm:right-6 z-50 pointer-events-none">
          <DraggablePanel className="pointer-events-auto w-[94vw] sm:w-[520px] max-w-lg">
            <div className="p-3.5 rounded-2xl bg-[#040C1A]/95 border border-white/[0.12] shadow-[0_24px_64px_rgba(0,0,0,0.92)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col">
              
              {/* Header with Drag Handle */}
              <div
                className="flex items-center justify-between pb-2.5 border-b border-white/[0.08] cursor-grab active:cursor-grabbing select-none"
                title="Click and drag anywhere on panel to move · Double-click to reset position"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <DotsSixVertical size={16} className="text-white/40 shrink-0" />
                  <div className="w-6 h-6 rounded-lg bg-[#00A8FF]/20 text-[#00A8FF] flex items-center justify-center shrink-0">
                    <Radio size={14} weight="bold" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider truncate">
                      Station Operational Posture Command
                    </h4>
                    <p className="font-mono text-[9px] text-[#7ABBD4] truncate">
                      Supervisory macro directives uplinked to {station} Remote Operations PLC
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[8px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 uppercase tracking-wider">
                    Movable
                  </span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Satellite Uplink Handshake Status (if active) */}
              {uplinkStep !== "IDLE" && (
                <div className="my-2.5 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex items-center gap-3 animate-pulse">
                  <ArrowsClockwise size={16} className="text-[#00E5FF] animate-spin shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className="font-mono text-[10px] font-bold text-cyan-200 uppercase tracking-wide">
                      {uplinkStep === "INTERLOCK" && "Verifying Pre-Command Safety Interlocks..."}
                      {uplinkStep === "SATELLITE" && "Uplinking Command via GSAT-7A (540ms Latency)..."}
                      {uplinkStep === "VERIFIED" && "Station RTU Acknowledged: Directive Executed!"}
                    </span>
                    <span className="font-mono text-[9px] text-cyan-400/80">
                      Target: {selectedTarget ? STATION_POSTURES[selectedTarget].label : ""}
                    </span>
                  </div>
                </div>
              )}

              {/* Posture Grid */}
              <div
                className="grid grid-cols-1 gap-2 pt-2.5 max-h-[60vh] overflow-y-auto pr-1 no-scrollbar no-drag"
                data-no-drag
              >
                {(Object.keys(STATION_POSTURES) as StationOperationalPosture[]).map((postureKey) => {
                  const def = STATION_POSTURES[postureKey];
                  const isCurrent = postureKey === currentPosture;
                  const PostureIcon = def.icon;

                  return (
                    <div
                      key={def.id}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isCurrent
                          ? "bg-white/[0.08] border-white/30 shadow-md ring-1 ring-white/20"
                          : "bg-white/[0.02] hover:bg-white/[0.06] border-white/[0.08]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${def.color}25`, color: def.color }}
                          >
                            <PostureIcon size={16} weight="bold" />
                          </div>
                          <div className="flex flex-col leading-tight min-w-0">
                            <span className="font-sans text-xs font-bold text-white truncate">
                              {def.label}
                            </span>
                            <span className="text-[10px] text-[#7ABBD4] truncate">{def.tagline}</span>
                          </div>
                        </div>

                        {isCurrent ? (
                          <span
                            className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0"
                            style={{
                              backgroundColor: `${def.color}25`,
                              color: def.color,
                              borderColor: `${def.color}50`,
                            }}
                          >
                            ACTIVE NOW
                          </span>
                        ) : (
                          <button
                            onClick={() => handleCommandPosture(def.id)}
                            disabled={uplinkStep !== "IDLE"}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-[10px] font-semibold transition-colors shrink-0 disabled:opacity-50"
                          >
                            Engage Directive
                          </button>
                        )}
                      </div>

                      {/* Operational Metrics Strip */}
                      <div className="grid grid-cols-4 gap-1.5 mt-2 pt-2 border-t border-white/[0.05] font-mono text-[9px]">
                        <div className="p-1 rounded bg-black/30 flex flex-col">
                          <span className="text-white/40">POWER</span>
                          <span className="font-bold text-white mt-0.5">{def.metrics.powerTargetKw} kW</span>
                        </div>
                        <div className="p-1 rounded bg-black/30 flex flex-col">
                          <span className="text-white/40">FUEL</span>
                          <span className="font-bold text-amber-300 mt-0.5">{def.metrics.fuelRateLh} L/h</span>
                        </div>
                        <div className="p-1 rounded bg-black/30 flex flex-col">
                          <span className="text-white/40">TRACE</span>
                          <span className="font-bold text-orange-400 mt-0.5">{def.metrics.traceHeatWm} W/m</span>
                        </div>
                        <div className="p-1 rounded bg-black/30 flex flex-col">
                          <span className="text-white/40">DAMPER</span>
                          <span className="font-bold text-emerald-300 mt-0.5">{def.metrics.intakeDamperPct}%</span>
                        </div>
                      </div>

                      {/* Summary Bullets */}
                      <ul className="mt-2 space-y-0.5 text-[9px] font-mono text-white/70">
                        {def.actuationSummary.slice(0, 2).map((bullet, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: def.color }} />
                            <span className="truncate">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              {/* Footer note */}
              <div className="mt-2.5 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[9px] font-mono text-[#7ABBD4]">
                <span>Uplink Carrier: GSAT-7A Military / NCPOR Goa Hub</span>
                <span>Cryptographic SCADA: Level 4 HMAC</span>
              </div>
            </div>
          </DraggablePanel>
        </div>
      )}
    </div>
  );
}
