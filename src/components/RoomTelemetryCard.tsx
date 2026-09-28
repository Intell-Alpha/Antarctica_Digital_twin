"use client";

import React, { useState } from "react";
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
} from "@phosphor-icons/react";

export interface RoomTelemetryData {
  id: string;
  name: string;
  level?: string;
  category: string;
  description?: string;
}

interface RoomTelemetryCardProps {
  room: RoomTelemetryData;
  stationId: "BHARATI" | "MAITRI";
  onClose: () => void;
  onTriggerAction?: (actionId: string, label: string) => void;
}

export function RoomTelemetryCard({
  room,
  stationId,
  onClose,
  onTriggerAction,
}: RoomTelemetryCardProps) {
  const [executingAction, setExecutingAction] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Subsystem-specific live telemetry & bi-directional controls mapped to physical rooms
  const getSubsystemData = () => {
    const rId = room.id.toLowerCase();

    // ── BHARATI & MAITRI GENERATOR HALLS ──
    if (rId.includes("gen") || rId.includes("chpp") || rId.includes("powerhouse")) {
      return {
        icon: Lightning,
        accent: "#FFAA00",
        discipline: "ELECTRICAL & THERMAL SCADA",
        subsystem: stationId === "BHARATI" ? "Volvo Penta 280kVA Tri-Gen Array" : "Kirloskar-Cummins GenSet Array",
        metrics: stationId === "BHARATI"
          ? [
              { label: "Active Output", value: "147.0 kW", status: "NOMINAL" },
              { label: "GenSet 01 (Volvo)", value: "82.5 kW · 84°C", status: "RUNNING" },
              { label: "GenSet 02 (Volvo)", value: "64.5 kW · 81°C", status: "RUNNING" },
              { label: "GenSet 03 (Standby)", value: "0.0 kW · 18°C", status: "READY" },
              { label: "Grid Frequency", value: "50.01 Hz", status: "STABLE" },
              { label: "Heat Recovery", value: "+78.2°C Supply", status: "ACTIVE" },
            ]
          : [
              { label: "Active Output", value: "142.0 kW", status: "NOMINAL" },
              { label: "Ravi GenSet", value: "80.0 kW · 82°C", status: "RUNNING" },
              { label: "Surya GenSet", value: "62.0 kW · 79°C", status: "RUNNING" },
              { label: "Aditya (Standby)", value: "0.0 kW · 16°C", status: "STANDBY" },
              { label: "Grid Frequency", value: "50.00 Hz", status: "STABLE" },
              { label: "Fuel Feed", value: "39.2 L/h", status: "NORMAL" },
            ],
        actions: [
          { id: "START_STANDBY_GEN", label: "Remote Spin-Up Standby GenSet", risk: "MEDIUM" },
          { id: "TOGGLE_ECO_THERMAL", label: "Toggle Eco-Thermal Heat Loop", risk: "LOW" },
          { id: "SHED_ZONE_LOAD", label: "Selective Microgrid Load Shed", risk: "HIGH" },
        ],
      };
    }

    // ── FUEL TANKS & DAY TANKS ──
    if (rId.includes("fuel") || rId.includes("daytank") || rId.includes("tank")) {
      return {
        icon: GasPump,
        accent: "#FFAA00",
        discipline: "FUEL RESERVES & FEED MANAGEMENT",
        subsystem: stationId === "BHARATI" ? "470L Certified Day Tank & Boost Skid" : "Bulk HSD Tank Battery 01-04",
        metrics: [
          { label: "Tank Fill Level", value: stationId === "BHARATI" ? "470 L (100%)" : "195,000 L (78%)", status: "OPTIMAL" },
          { label: "Fuel Grade", value: "Jet A-1 (ATF-50)", status: "OK" },
          { label: "Auto-Fill Booster", value: "AUTOMATIC (Standby)", status: "NOMINAL" },
          { label: "Interstitial Vac", value: "-0.45 bar (Sealed)", status: "SAFE" },
          { label: "Secondary Bund", value: "0.0% Liquid Detected", status: "DRY OK" },
          { label: "Burn Rate", value: "40.8 L/hr", status: "NORMAL" },
        ],
        actions: [
          { id: "TEST_BOOSTER_PUMP", label: "Cycle Auto-Fill Boost Pump", risk: "LOW" },
          { id: "EMERGENCY_FUEL_ISOLATE", label: "Emergency Fuel Isolation Valve", risk: "HIGH" },
        ],
      };
    }

    // ── WATER SYSTEMS (RO DESALINATION OR PRIYADARSHINI INTAKE) ──
    if (rId.includes("water") || rId.includes("ro_plant") || rId.includes("pumphouse") || rId.includes("uv")) {
      return {
        icon: Waves,
        accent: "#00A8FF",
        discipline: "POTABLE WATER LIFELINE",
        subsystem: stationId === "BHARATI" ? "Quilty Bay Reverse Osmosis & UV Desal" : "Lake Priyadarshini Sub-Ice Intake Gantry",
        metrics: stationId === "BHARATI"
          ? [
              { label: "Raw Intake Flow", value: "42.5 L/min", status: "PUMPING" },
              { label: "Membrane Feed", value: "55.0 bar", status: "OPTIMAL" },
              { label: "RO Recovery Rate", value: "45.2%", status: "NORMAL" },
              { label: "Product Salinity", value: "38 ppm", status: "POTABLE OK" },
              { label: "UV Disinfection", value: "254nm Active", status: "STERILIZING" },
              { label: "Calorifier Temp", value: "+65.2°C", status: "HEATED" },
            ]
          : [
              { label: "Sub-Ice Intake", value: "6.2 m Depth", status: "EXTRACTION" },
              { label: "Lake Water Temp", value: "+1.6°C", status: "UNFROZEN" },
              { label: "Gantry Trace Heat", value: "30 W/m Active", status: "NORMAL" },
              { label: "Transfer Rate", value: "38.0 L/min", status: "NOMINAL" },
              { label: "Boiler Calorifier", value: "+72.0°C", status: "HEATED" },
              { label: "Freeze Horizon", value: "> 180 mins", status: "SAFE" },
            ],
        actions: [
          { id: "FLUSH_MEMBRANES", label: "Initiate High-Pressure Membrane Flush", risk: "LOW" },
          { id: "BOOST_TRACE_HEAT", label: "Boost Lifeline Trace Heat +10°C", risk: "MEDIUM" },
        ],
      };
    }

    // ── SCADA NOC & BMS SERVER ROOM ──
    if (rId.includes("bms") || rId.includes("server") || rId.includes("scada") || rId.includes("network")) {
      return {
        icon: HardDrives,
        accent: "#00D4A0",
        discipline: "AUTOMATION & SCADA NOC",
        subsystem: "Dual Redundant Telemetry Servers & Edge NVMe Gateway",
        metrics: [
          { label: "ISRO Satellite Ping", value: "42 ms (Stable)", status: "ONLINE" },
          { label: "Edge NVMe Buffer", value: "68% (Store & Fwd)", status: "SYNCING" },
          { label: "P0 Emergency Queue", value: "0 Alerts Queued", status: "SYNCED" },
          { label: "P1 Infra Telemetry", value: "14 KB In Flight", status: "NOMINAL" },
          { label: "Server CPU Load", value: "18.4% (Xeon Polar)", status: "COOL" },
          { label: "NTP Sync Drift", value: "< 2 ms UTC", status: "LOCKED" },
        ],
        actions: [
          { id: "FLUSH_BUFFER", label: "Force Edge Telemetry Sync Burst", risk: "LOW" },
          { id: "AUDIT_SCADA_LOGS", label: "Execute Cryptographic Integrity Audit", risk: "LOW" },
        ],
      };
    }

    // ── COMMAND, RADIO & COMMUNICATIONS ──
    if (rId.includes("command") || rId.includes("radio") || rId.includes("com")) {
      return {
        icon: Radio,
        accent: "#00A8FF",
        discipline: "POLAR COMMUNICATIONS & COMMAND",
        subsystem: "VHF Marine, HF High-Latitude & Iridium Certus Contingency",
        metrics: [
          { label: "VHF Channel 16", value: "GUARD ACTIVE", status: "MONITORING" },
          { label: "ISRO C-Band Link", value: "1024 kbps Dedicated", status: "LOCKED" },
          { label: "INSAT-3DR Telemetry", value: "POLAR PASS READY", status: "TRACKING" },
          { label: "Iridium SBD Backup", value: "STANDBY 100%", status: "READY" },
          { label: "Aeronautical 121.5", value: "DROMLAN AIR WATCH", status: "LISTEN" },
          { label: "Antenna De-Icer", value: "+12.0°C Radome", status: "ACTIVE" },
        ],
        actions: [
          { id: "TEST_VHF_BEACON", label: "Broadcast Station VHF Identification", risk: "LOW" },
          { id: "SWITCH_IRIDIUM", label: "Simulate Satellite Contingency Failover", risk: "MEDIUM" },
        ],
      };
    }

    // ── MEDICAL CLINIC & SURGICAL OT ──
    if (rId.includes("hospital") || rId.includes("clinic") || rId.includes("med")) {
      return {
        icon: Heartbeat,
        accent: "#00D4A0",
        discipline: "EXPEDITION CRITICAL HEALTH",
        subsystem: "Autonomous Surgical Operation Theatre & Tele-Medicine Bay",
        metrics: [
          { label: "Surgical OT Temp", value: "+21.2°C", status: "COMFORT" },
          { label: "Medical O2 Bank", value: "4x 50L (200 bar)", status: "RESERVE OK" },
          { label: "Defibrillator", value: "100% Charged", status: "READY" },
          { label: "Telemedicine Link", value: "ISRO AIIMS Direct", status: "ONLINE" },
          { label: "OT Air Pressure", value: "+25 Pa (Positive)", status: "STERILE" },
          { label: "Autoclave Sterilizer", value: "STANDBY", status: "NOMINAL" },
        ],
        actions: [
          { id: "LOCK_OT_PRESSURE", label: "Engage Positive Pressure OT Isolation", risk: "HIGH" },
          { id: "TELEMED_HEALTHCHECK", label: "Ping AIIMS Tele-Surgery Gateway", risk: "LOW" },
        ],
      };
    }

    // ── VEHICLE GARAGE & SCISSOR LIFT ──
    if (rId.includes("garage") || rId.includes("lift") || rId.includes("workshop") || rId.includes("veh")) {
      return {
        icon: Wrench,
        accent: "#7ABBD4",
        discipline: "HEAVY LOGISTICS & FLEET WORKSHOP",
        subsystem: "PistenBully Heavy Scissor Lift & Maintenance Tooling Bay",
        metrics: [
          { label: "Scissor Lift Deck", value: "HYDRAULIC CHARGED", status: "180 bar" },
          { label: "Tracked Fleet", value: "3x PistenBully 300", status: "READY" },
          { label: "Snowmobiles", value: "4x Skidoo 800", status: "2 ON ICE" },
          { label: "Pneumatic Supply", value: "8.2 bar Line", status: "PRESSURIZED" },
          { label: "Roll-Up Air Seals", value: "THERMAL AIR CURTAIN", status: "LOCKED" },
          { label: "Hydraulic Fluid", value: "ISO VG 32 Polar", status: "NOMINAL" },
        ],
        actions: [
          { id: "CYCLE_HYDRAULIC_LIFT", label: "Remote Cycle Hydraulic Vehicle Lift", risk: "MEDIUM" },
          { id: "PREHEAT_SNOWMOBILES", label: "Engage Block Heaters for Surface Fleet", risk: "LOW" },
        ],
      };
    }

    // ── BOOT WASH & MUDROOM AIRLOCK ──
    if (rId.includes("boot") || rId.includes("mudroom") || rId.includes("airlock")) {
      return {
        icon: SlidersHorizontal,
        accent: "#7ABBD4",
        discipline: "THERMAL AIRLOCK BARRIER",
        subsystem: "Expedition Parka Decontamination & Boot Wash Glycol Circuit",
        metrics: [
          { label: "Airlock Pressure", value: "+15 Pa Differential", status: "SEALED" },
          { label: "Boot Wash Loop", value: "+15.2°C Heated", status: "ACTIVE" },
          { label: "Parka Lockers", value: "+28°C Thermal Blow", status: "DRYING" },
          { label: "Outer Threshold", value: "-22.4°C Larsemann", status: "SUBZERO" },
          { label: "Decon Status", value: "BIO-SECURE OK", status: "CLEAR" },
          { label: "Aero Seal Integrity", value: "Double Gasketed", status: "OPTIMAL" },
        ],
        actions: [
          { id: "BOOST_AIR_CURTAIN", label: "Boost Airlock Thermal Curtain", risk: "LOW" },
        ],
      };
    }

    // ── WASTE BALER & ENVIRONMENTAL COMPACTOR ──
    if (rId.includes("waste") || rId.includes("baler") || rId.includes("compactor")) {
      return {
        icon: ShieldCheck,
        accent: "#00D4A0",
        discipline: "ENVIRONMENTAL PROTOCOL COMPLIANCE",
        subsystem: "Madrid Protocol Hydraulic Solid Waste Baler & Incinerator",
        metrics: [
          { label: "Madrid Protocol", value: "100% COMPLIANT", status: "VERIFIED" },
          { label: "Compactor Press", value: "25 Metric Tonnes", status: "READY" },
          { label: "Baled Waste Stock", value: "12 Cylinders Sealed", status: "RETROGRADE" },
          { label: "Organic Digester", value: "+55°C Aerobic Bio", status: "DIGESTING" },
          { label: "Flue Emissions", value: "HEPA + Carbon Filter", status: "CLEAN" },
          { label: "Repatriation Ready", value: "Austral Summer Ship", status: "LOGGED" },
        ],
        actions: [
          { id: "CYCLE_BALER", label: "Run Hydraulic Compactor Cycle", risk: "LOW" },
        ],
      };
    }

    // ── DEFAULT: LIVING CABINS, MESS, LOUNGE, SAUNA, LABS ──
    return {
      icon: Cpu,
      accent: "#00A8FF",
      discipline: `LEVEL ${room.level || "03"} · ${room.category?.toUpperCase() || "FACILITY"}`,
      subsystem: room.description || "Station Living & Operational Facility Module",
      metrics: [
        { label: "Zone Temperature", value: "+20.5°C", status: "COMFORT" },
        { label: "HVAC Fresh Air", value: "4.2 Air Changes/Hr", status: "OPTIMAL" },
        { label: "Thermal Wall Barrier", value: "R-60 Polar Sandwich", status: "INTACT" },
        { label: "Carbon Monoxide", value: "0 ppm CO (Clear)", status: "SAFE" },
        { label: "Radiant Floor Loop", value: "+22.0°C Hydronic", status: "WARMED" },
        { label: "Fire / Smoke Loop", value: "VESDA Aspirating OK", status: "ARMED" },
      ],
      actions: [
        { id: "BOOST_HVAC_AIR", label: "Boost Module Fresh Air Exchange", risk: "LOW" },
        { id: "DIM_LIGHTING", label: "Switch to Night Circadian Lighting", risk: "LOW" },
      ],
    };
  };

  const data = getSubsystemData();
  const IconComp = data.icon;

  const handleActionClick = (actionId: string, label: string) => {
    setExecutingAction(actionId);
    setFeedbackMsg(`Remote tele-command '${label}' executed with Two-Key authorization.`);
    if (onTriggerAction) onTriggerAction(actionId, label);

    setTimeout(() => {
      setExecutingAction(null);
    }, 1200);

    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4500);
  };

  return (
    <div className="absolute top-24 left-4 sm:left-6 z-40 w-[350px] max-w-[calc(100vw-32px)] rounded-3xl bg-[#040D1A]/95 border border-[#00A8FF]/40 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] animate-in fade-in slide-in-from-left-4 duration-300 font-sans select-none overflow-hidden">
      {/* ── CARD HEADER ── */}
      <div className="p-3.5 border-b border-white/10 flex items-start justify-between gap-2 bg-gradient-to-r from-white/[0.03] to-transparent">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center border shrink-0 shadow-lg"
            style={{
              backgroundColor: `${data.accent}15`,
              borderColor: `${data.accent}45`,
              color: data.accent,
            }}
          >
            <IconComp size={20} weight="duotone" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#7ABBD4] font-semibold truncate">
                {data.discipline}
              </span>
              {room.level && (
                <span className="px-1.5 py-0.2 rounded font-mono text-[8px] bg-[#00A8FF]/20 text-[#00A8FF] font-bold shrink-0">
                  {room.level}
                </span>
              )}
            </div>
            <h4 className="font-sans text-xs font-bold text-white leading-tight truncate">
              {room.name}
            </h4>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-[#7ABBD4] hover:text-white hover:bg-white/10 transition-colors shrink-0"
          title="Close telemetry card"
        >
          <X size={14} />
        </button>
      </div>

      {/* ── SUBSYSTEM SUBTITLE ── */}
      <div className="px-3.5 py-1.5 bg-black/30 border-b border-white/5 flex items-center justify-between font-mono text-[9px]">
        <span className="text-[#4A7A8E] truncate">{data.subsystem}</span>
        <span className="text-[#00D4A0] font-semibold shrink-0">LIVE SCADA</span>
      </div>

      {/* ── 6-PARAMETER LIVE TELEMETRY GRID ── */}
      <div className="p-3 grid grid-cols-2 gap-2 border-b border-white/10 bg-white/[0.01]">
        {data.metrics.map((m, idx) => (
          <div
            key={idx}
            className="p-2 rounded-2xl bg-white/[0.025] hover:bg-white/[0.05] border border-white/5 flex flex-col justify-between transition-colors"
          >
            <span className="font-mono text-[9px] text-[#7ABBD4] truncate leading-tight">
              {m.label}
            </span>
            <div className="flex items-baseline justify-between gap-1 mt-1.5">
              <span className="font-mono text-xs font-bold text-white truncate">
                {m.value}
              </span>
              <span className="font-mono text-[8px] px-1 py-0.2 rounded bg-[#00D4A0]/15 text-[#00D4A0] font-semibold shrink-0">
                {m.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── BI-DIRECTIONAL REMOTE SUPERVISORY CONTROLS ── */}
      {data.actions && data.actions.length > 0 && (
        <div className="p-3 flex flex-col gap-1.5 bg-black/20">
          <div className="flex items-center justify-between text-[9px] font-mono">
            <span className="text-[#FFAA00] uppercase font-bold tracking-wider">
              Remote Supervisory Actuation
            </span>
            <span className="text-[#4A7A8E]">Two-Key Interlock</span>
          </div>

          <div className="flex flex-col gap-1 mt-0.5">
            {data.actions.map((act) => {
              const isPending = executingAction === act.id;
              return (
                <button
                  key={act.id}
                  disabled={!!executingAction}
                  onClick={() => handleActionClick(act.id, act.label)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl border text-left transition-all group ${
                    isPending
                      ? "bg-[#FFAA00]/30 border-[#FFAA00] text-white animate-pulse"
                      : "bg-white/[0.03] hover:bg-white/[0.08] border-white/10 hover:border-[#FFAA00]/50 text-[#EBF5FC]"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        act.risk === "HIGH" ? "bg-rose-400" : "bg-[#FFAA00]"
                      }`}
                    />
                    <span className="font-mono text-[10px] font-semibold truncate group-hover:text-white">
                      {isPending ? "Transmitting Cryptographic Command..." : act.label}
                    </span>
                  </div>
                  <span
                    className={`font-mono text-[8px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                      act.risk === "HIGH"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-[#FFAA00]/20 text-[#FFAA00] border border-[#FFAA00]/30"
                    }`}
                  >
                    {act.risk}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Execution Feedback Notification */}
          {feedbackMsg && (
            <div className="mt-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 font-mono text-[9px] text-emerald-300 flex items-center gap-1.5 animate-in fade-in duration-200">
              <CheckCircle size={12} weight="bold" className="shrink-0" />
              <span className="truncate">✓ {feedbackMsg}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
