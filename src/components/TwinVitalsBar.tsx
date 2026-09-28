"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ThermometerCold,
  Wind,
  Lightning,
  GasPump,
  Radio,
  HardDrives,
  X,
  WifiSlash,
  WifiHigh,
  ShieldCheck,
  CheckCircle,
} from "@phosphor-icons/react";
import { api, Station } from "@/lib/api";

interface TwinVitalsBarProps {
  station: Station;
}

export function TwinVitalsBar({ station }: TwinVitalsBarProps) {
  const [vitals, setVitals] = useState<{
    tempC: number;
    windKmh: number;
    powerKw: number;
    powerLoadPct: number;
    fuelReservesL: number;
    fuelAutonomyDays: number;
    satStatus: string;
    satLatencyMs: number;
    edgeBufferPct: number;
  }>({
    tempC: station === "BHARATI" ? -22.4 : -24.8,
    windKmh: station === "BHARATI" ? 38.5 : 42.0,
    powerKw: station === "BHARATI" ? 147.0 : 142.0,
    powerLoadPct: 47,
    fuelReservesL: station === "BHARATI" ? 285000 : 195000,
    fuelAutonomyDays: station === "BHARATI" ? 290 : 219,
    satStatus: "ONLINE",
    satLatencyMs: 42,
    edgeBufferPct: 68,
  });

  const [showNetworkDrawer, setShowNetworkDrawer] = useState(false);
  const [simulatedBlackout, setSimulatedBlackout] = useState(false);

  // Poll live telemetry every 5 seconds
  const fetchVitals = useCallback(async () => {
    try {
      const [energy, logistics, env, net] = await Promise.all([
        api.getEnergy(station),
        api.getLogistics(station),
        api.getEnvironment(station),
        api.getNetwork(station),
      ]);

      setVitals({
        tempC: env.tempC,
        windKmh: env.windSpeedKmh,
        powerKw: energy.currentOutputKw,
        powerLoadPct: Math.round(
          (energy.currentOutputKw / (energy.totalCapacityKw || 1)) * 100
        ),
        fuelReservesL: logistics.fuelReservesL,
        fuelAutonomyDays: logistics.fuelAutonomyDays,
        satStatus: simulatedBlackout ? "BUFFERING (BLACKOUT)" : net.status,
        satLatencyMs: simulatedBlackout ? 9999 : net.latencyMs,
        edgeBufferPct: simulatedBlackout ? 89 : 68,
      });
    } catch (err) {
      console.warn("Vitals polling fallback active", err);
    }
  }, [station, simulatedBlackout]);

  useEffect(() => {
    fetchVitals();
    const interval = setInterval(fetchVitals, 5000);
    return () => clearInterval(interval);
  }, [fetchVitals]);

  return (
    <>
      {/* ── TOP-CENTER FLOATING LIVE VITALS TICKER ── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex items-center gap-2 sm:gap-3.5 px-3.5 py-1.5 rounded-full bg-[#040D1A]/90 border border-white/10 backdrop-blur-2xl font-mono text-[10px] sm:text-[11px] shadow-[0_10px_35px_rgba(0,0,0,0.8)] select-none animate-in fade-in slide-in-from-top-2 duration-300">
        {/* Outside Temperature */}
        <div className="flex items-center gap-1.5 text-[#00A8FF]" title="Outside Ambient Temperature">
          <ThermometerCold size={13} weight="duotone" />
          <span className="font-bold text-white">{vitals.tempC}°C</span>
        </div>

        <div className="w-px h-3 bg-white/10" />

        {/* Katabatic Wind */}
        <div className="flex items-center gap-1.5 text-[#00D4A0]" title="Katabatic Wind Speed">
          <Wind size={13} weight="duotone" />
          <span className="font-bold text-white">{vitals.windKmh} km/h</span>
        </div>

        <div className="w-px h-3 bg-white/10" />

        {/* Active Power Demand */}
        <div className="flex items-center gap-1.5 text-[#FFAA00]" title="Active CHPP Generation Load">
          <Lightning size={13} weight="duotone" />
          <span className="font-bold text-white">
            {vitals.powerKw} kW <span className="text-[#FFAA00] font-normal">({vitals.powerLoadPct}%)</span>
          </span>
        </div>

        <div className="w-px h-3 bg-white/10" />

        {/* Dynamic Fuel Autonomy Survival Horizon */}
        <div className="flex items-center gap-1.5 text-[#EBF5FC]" title="Survival Horizon (TTCF Days)">
          <GasPump size={13} weight="duotone" className="text-[#A6C4D6]" />
          <span className="font-bold text-[#00D4A0]">{vitals.fuelAutonomyDays}d Autonomy</span>
        </div>

        <div className="w-px h-3 bg-white/10" />

        {/* ISRO Satellite Link Status (Clickable to open Store & Forward Queue) */}
        <button
          onClick={() => setShowNetworkDrawer(!showNetworkDrawer)}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full transition-all ${
            simulatedBlackout
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
              : "bg-white/5 hover:bg-white/15 text-[#7ABBD4] hover:text-white"
          }`}
          title="Click to view ISRO Satellite Uplink & Store-and-Forward Buffer"
        >
          {simulatedBlackout ? (
            <WifiSlash size={12} weight="bold" className="text-rose-400" />
          ) : (
            <WifiHigh size={12} weight="bold" className="text-[#00D4A0]" />
          )}
          <span className="font-bold text-[9px] uppercase tracking-wider">
            {simulatedBlackout ? "BUFFERING" : `${vitals.satLatencyMs}ms`}
          </span>
        </button>
      </div>

      {/* ── STORE-AND-FORWARD SATELLITE QUEUE DRAWER ── */}
      {showNetworkDrawer && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 w-[380px] max-w-[calc(100vw-32px)] rounded-3xl bg-[#040D1A]/95 border border-[#00A8FF]/40 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] animate-in fade-in zoom-in-95 duration-200 font-sans select-none overflow-hidden p-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 font-mono text-[10px]">
            <div className="flex items-center gap-2">
              <Radio size={16} weight="duotone" className="text-[#00A8FF]" />
              <span className="font-bold text-white uppercase tracking-wider">
                ISRO C-Band Link & NVMe Edge Queue
              </span>
            </div>
            <button
              onClick={() => setShowNetworkDrawer(false)}
              className="p-1 rounded-lg text-[#7ABBD4] hover:text-white"
            >
              <X size={14} />
            </button>
          </div>

          {/* Buffer Utilization Bar */}
          <div className="mt-2.5 p-2 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-1.5 font-mono text-[9px]">
            <div className="flex justify-between">
              <span className="text-[#7ABBD4]">Station Edge NVMe Buffer</span>
              <span className="text-white font-bold">{vitals.edgeBufferPct}% Used (2.0 TB)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  vitals.edgeBufferPct > 80 ? "bg-rose-500" : "bg-[#00D4A0]"
                }`}
                style={{ width: `${vitals.edgeBufferPct}%` }}
              />
            </div>
          </div>

          {/* Multi-Tier Priority Queues (P0 to P4) */}
          <div className="mt-2 flex flex-col gap-1 font-mono text-[9px]">
            <span className="text-[#FFAA00] font-bold uppercase tracking-wider text-[8px]">
              Multi-Tier Store-and-Forward Queues:
            </span>
            {[
              { q: "P0", label: "Emergency & Safety Alarms", size: "0 KB", status: "INSTANT BURST", color: "#FF0055" },
              { q: "P1", label: "Critical Plant SCADA (CHP/Water)", size: "14 KB", status: "SYNCED OK", color: "#00D4A0" },
              { q: "P2", label: "Operational State Logs", size: "1.2 MB", status: "BUFFERING", color: "#FFAA00" },
              { q: "P3", label: "Scientific Telemetry Streams", size: "450 MB", status: "QUEUED (42ms)", color: "#00A8FF" },
              { q: "P4", label: "Bulk Point Clouds & Video", size: "12.4 GB", status: "WAITING NEXT PASS", color: "#7ABBD4" },
            ].map((queue) => (
              <div
                key={queue.q}
                className="flex items-center justify-between px-2 py-1 rounded-xl bg-white/[0.02] border border-white/5"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="px-1 py-0.2 rounded font-bold text-[8px]"
                    style={{ backgroundColor: `${queue.color}20`, color: queue.color }}
                  >
                    {queue.q}
                  </span>
                  <span className="text-[#EBF5FC] truncate">{queue.label}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[#4A7A8E]">{queue.size}</span>
                  <span
                    className="font-bold text-[8px]"
                    style={{ color: queue.color }}
                  >
                    {queue.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Test Satellite Blackout Toggle */}
          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between font-mono text-[9px]">
            <span className="text-[#7ABBD4]">Simulate Orbital Blackout</span>
            <button
              onClick={() => setSimulatedBlackout(!simulatedBlackout)}
              className={`px-2.5 py-1 rounded-xl font-bold uppercase transition-all ${
                simulatedBlackout
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  : "bg-white/10 text-[#7ABBD4] hover:text-white"
              }`}
            >
              {simulatedBlackout ? "DISCONNECT ACTIVE" : "SIMULATE DROP"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
