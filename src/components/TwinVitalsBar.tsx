"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ThermometerCold,
  Wind,
  Lightning,
  GasPump,
  Radio,
  X,
  WifiSlash,
  WifiHigh,
  ArrowsClockwise,
  ArrowSquareOut,
  Gauge,
  Drop,
} from "@phosphor-icons/react";
import { api, Station } from "@/lib/api";

interface TwinVitalsBarProps {
  station: Station;
}

export function TwinVitalsBar({ station }: TwinVitalsBarProps) {
  const [vitals, setVitals] = useState<{
    tempC: number;
    windKmh: number;
    windKnots: number;
    pressureHpa: number;
    humidityPct: number;
    powerKw: number;
    powerLoadPct: number;
    fuelReservesL: number;
    fuelAutonomyDays: number;
    satStatus: string;
    satLatencyMs: number;
    edgeBufferPct: number;
    isLiveNcpor: boolean;
    observationDate: string;
    sourceUrl: string;
    stats?: {
      temperature: { avg: number | null; min: number | null; max: number | null };
      windSpeedMps: { avg: number | null; min: number | null; max: number | null };
      airPressureHpa: { avg: number | null; min: number | null; max: number | null };
      relativeHumidityPct: { avg: number | null; min: number | null; max: number | null };
    };
  }>({
    tempC: station === "BHARATI" ? -13.64 : -9.82,
    windKmh: station === "BHARATI" ? 27.5 : 88.8,
    windKnots: station === "BHARATI" ? 14.86 : 47.97,
    pressureHpa: station === "BHARATI" ? 977.1 : 943.9,
    humidityPct: station === "BHARATI" ? 84.4 : 83.5,
    powerKw: station === "BHARATI" ? 147.0 : 142.0,
    powerLoadPct: 47,
    fuelReservesL: station === "BHARATI" ? 285000 : 195000,
    fuelAutonomyDays: station === "BHARATI" ? 290 : 219,
    satStatus: "ONLINE",
    satLatencyMs: 42,
    edgeBufferPct: 68,
    isLiveNcpor: true,
    observationDate: "28 Sep 2026",
    sourceUrl: station === "BHARATI" ? "https://data.ncpor.res.in/bharati/live" : "https://data.ncpor.res.in/maitri/live",
  });

  const [showNetworkDrawer, setShowNetworkDrawer] = useState(false);
  const [showAwsDrawer, setShowAwsDrawer] = useState(false);
  const [simulatedBlackout, setSimulatedBlackout] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

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
        windKnots: env.windKnots ?? +(env.windSpeedKmh / 1.852).toFixed(1),
        pressureHpa: env.pressureHpa ?? 988.4,
        humidityPct: env.humidityPct ?? 68,
        powerKw: energy.currentOutputKw,
        powerLoadPct: Math.round(
          (energy.currentOutputKw / (energy.totalCapacityKw || 1)) * 100
        ),
        fuelReservesL: logistics.fuelReservesL,
        fuelAutonomyDays: logistics.fuelAutonomyDays,
        satStatus: simulatedBlackout ? "BUFFERING (BLACKOUT)" : net.status,
        satLatencyMs: simulatedBlackout ? 9999 : net.latencyMs,
        edgeBufferPct: simulatedBlackout ? 89 : 68,
        isLiveNcpor: env.isLiveNcpor ?? true,
        observationDate: env.observationDate || "Live Observation",
        sourceUrl: station === "BHARATI" ? "https://data.ncpor.res.in/bharati/live" : "https://data.ncpor.res.in/maitri/live",
        stats: env.stats,
      });
    } catch (err) {
      console.warn("Vitals polling fallback active", err);
    }
  }, [station, simulatedBlackout]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await api.syncEnvironment(station);
      await fetchVitals();
    } catch (err) {
      console.error("Manual sync error", err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchVitals();
    const interval = setInterval(fetchVitals, 5000);
    return () => clearInterval(interval);
  }, [fetchVitals]);

  return (
    <>
      {/* ── TOP-CENTER FLOATING LIVE VITALS TICKER ── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 rounded-full bg-[#040D1A]/90 border border-white/10 backdrop-blur-2xl font-mono text-[10px] sm:text-[11px] shadow-[0_10px_35px_rgba(0,0,0,0.8)] select-none animate-in fade-in slide-in-from-top-2 duration-300">
        
        {/* Real-Time Live AWS Badge */}
        <button
          onClick={() => {
            setShowAwsDrawer(!showAwsDrawer);
            setShowNetworkDrawer(false);
          }}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-all ${
            vitals.isLiveNcpor
              ? "bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40 text-emerald-300"
              : "bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/30 text-amber-300"
          }`}
          title="Click to view official NCPOR / NCAOR live Automatic Weather Station (AWS) report"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-[9px] uppercase tracking-wider">
            NCPOR LIVE
          </span>
        </button>

        <div className="w-px h-3 bg-white/10" />

        {/* Outside Temperature */}
        <div
          onClick={() => setShowAwsDrawer(true)}
          className="flex items-center gap-1.5 text-[#00A8FF] cursor-pointer hover:opacity-80 transition-opacity"
          title="Live Outside Ambient Temperature (Click for daily stats)"
        >
          <ThermometerCold size={13} weight="duotone" />
          <span className="font-bold text-white">{vitals.tempC}°C</span>
        </div>

        <div className="w-px h-3 bg-white/10" />

        {/* Katabatic Wind */}
        <div
          onClick={() => setShowAwsDrawer(true)}
          className="flex items-center gap-1.5 text-[#00D4A0] cursor-pointer hover:opacity-80 transition-opacity"
          title={`Katabatic Wind Speed: ${vitals.windKmh} km/h (${vitals.windKnots} kts)`}
        >
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

        {/* ISRO Satellite Link Status */}
        <button
          onClick={() => {
            setShowNetworkDrawer(!showNetworkDrawer);
            setShowAwsDrawer(false);
          }}
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

      {/* ── NCPOR LIVE AWS WEATHER REPORT DRAWER ── */}
      {showAwsDrawer && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 w-[420px] max-w-[calc(100vw-32px)] rounded-3xl bg-[#040D1A]/95 border border-emerald-500/40 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] animate-in fade-in zoom-in-95 duration-200 font-sans select-none overflow-hidden p-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10 font-mono text-[10px]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-bold text-white uppercase tracking-wider">
                {station} // NCPOR LIVE AWS FEED
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="p-1 rounded-lg text-emerald-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Sync fresh data from NCPOR"
              >
                <ArrowsClockwise size={14} className={isSyncing ? "animate-spin" : ""} />
              </button>
              <button
                onClick={() => setShowAwsDrawer(false)}
                className="p-1 rounded-lg text-[#7ABBD4] hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Source & Observation Header */}
          <div className="mt-2.5 flex items-center justify-between font-mono text-[10px] text-[#7ABBD4]">
            <span>OBSERVATION CYCLE: <strong className="text-white">{vitals.observationDate}</strong></span>
            <a
              href={vitals.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-400 hover:underline"
            >
              <span>NCPOR Live Portal</span>
              <ArrowSquareOut size={11} />
            </a>
          </div>

          {/* Instantaneous KPI Grid */}
          <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[10px]">
            <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/5">
              <div className="flex items-center gap-1.5 text-[#00A8FF] mb-1">
                <ThermometerCold size={14} />
                <span className="text-[9px] uppercase tracking-wider">Temperature</span>
              </div>
              <div className="text-lg font-bold text-white">{vitals.tempC} °C</div>
              <div className="text-[9px] text-[#7ABBD4]">
                Min: {vitals.stats?.temperature.min ?? "--"}° / Max: {vitals.stats?.temperature.max ?? "--"}°
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/5">
              <div className="flex items-center gap-1.5 text-[#00D4A0] mb-1">
                <Wind size={14} />
                <span className="text-[9px] uppercase tracking-wider">Wind Velocity</span>
              </div>
              <div className="text-lg font-bold text-white">{vitals.windKmh} km/h</div>
              <div className="text-[9px] text-[#7ABBD4]">
                {vitals.windKnots} knots ({+(vitals.windKnots * 0.5144).toFixed(1)} m/s)
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/5">
              <div className="flex items-center gap-1.5 text-amber-400 mb-1">
                <Gauge size={14} />
                <span className="text-[9px] uppercase tracking-wider">Air Pressure</span>
              </div>
              <div className="text-lg font-bold text-white">{vitals.pressureHpa} hPa</div>
              <div className="text-[9px] text-[#7ABBD4]">
                Avg: {vitals.stats?.airPressureHpa.avg ?? "--"} hPa
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/5">
              <div className="flex items-center gap-1.5 text-cyan-400 mb-1">
                <Drop size={14} />
                <span className="text-[9px] uppercase tracking-wider">Rel. Humidity</span>
              </div>
              <div className="text-lg font-bold text-white">{vitals.humidityPct}%</div>
              <div className="text-[9px] text-[#7ABBD4]">
                Range: {vitals.stats?.relativeHumidityPct.min ?? "--"}% – {vitals.stats?.relativeHumidityPct.max ?? "--"}%
              </div>
            </div>
          </div>

          {/* Daily Aggregate Stats Table */}
          {vitals.stats && (
            <div className="mt-3 p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 font-mono text-[9px]">
              <div className="text-[#A6C4D6] uppercase tracking-wider font-bold mb-1.5 flex justify-between">
                <span>Daily Aggregates (24-Hour Cycle)</span>
                <span className="text-emerald-400">AWS Synced</span>
              </div>
              <table className="w-full text-center">
                <thead>
                  <tr className="text-[#64748B] border-b border-white/5">
                    <th className="text-left pb-1 font-medium">Metric</th>
                    <th className="pb-1 font-medium">Min</th>
                    <th className="pb-1 font-medium">Average</th>
                    <th className="pb-1 font-medium">Max</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white">
                  <tr>
                    <td className="text-left py-1 text-[#7ABBD4]">Temperature</td>
                    <td>{vitals.stats.temperature.min ?? "--"}°C</td>
                    <td>{vitals.stats.temperature.avg ?? "--"}°C</td>
                    <td>{vitals.stats.temperature.max ?? "--"}°C</td>
                  </tr>
                  <tr>
                    <td className="text-left py-1 text-[#7ABBD4]">Wind Speed</td>
                    <td>{vitals.stats.windSpeedMps.min ?? "--"} m/s</td>
                    <td>{vitals.stats.windSpeedMps.avg ?? "--"} m/s</td>
                    <td>{vitals.stats.windSpeedMps.max ?? "--"} m/s</td>
                  </tr>
                  <tr>
                    <td className="text-left py-1 text-[#7ABBD4]">Air Pressure</td>
                    <td>{vitals.stats.airPressureHpa.min ?? "--"} hPa</td>
                    <td>{vitals.stats.airPressureHpa.avg ?? "--"} hPa</td>
                    <td>{vitals.stats.airPressureHpa.max ?? "--"} hPa</td>
                  </tr>
                  <tr>
                    <td className="text-left py-1 text-[#7ABBD4]">Humidity</td>
                    <td>{vitals.stats.relativeHumidityPct.min ?? "--"}%</td>
                    <td>{vitals.stats.relativeHumidityPct.avg ?? "--"}%</td>
                    <td>{vitals.stats.relativeHumidityPct.max ?? "--"}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between font-mono text-[9px] text-[#64748B]">
            <span>National Centre for Polar & Ocean Research, MoES</span>
            <button
              onClick={handleManualSync}
              className="text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>{isSyncing ? "Syncing..." : "Sync Fresh AWS Feed"}</span>
            </button>
          </div>
        </div>
      )}

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
