"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Wind,
  Thermometer,
  Compass,
  Sun,
  ShieldWarning,
  ArrowLeft,
  Gauge,
  Drop,
  ArrowsClockwise,
  ArrowSquareOut,
  ChartLineUp,
  CheckCircle,
} from "@phosphor-icons/react";
import { HudPanel } from "@/components/HudPanel";
import { HeartbeatDot } from "@/components/HeartbeatDot";
import { TelemetryValue } from "@/components/TelemetryValue";
import { TopographicBg } from "@/components/TopographicBg";
import { api, Station } from "@/lib/api";

const BLIZZARD_CLASSES = [
  {
    tier: "CLASS 1: MODERATE GALE",
    wind: "35 – 50 kts (65 – 92 km/h)",
    visibility: "< 1,000 m",
    guideline: "Station safety lifeline cables required between main block and fuel/generator house. Solo transit restricted.",
    status: "ACTIVE CURRENT WATCH",
    color: "bg-[#F59E0B]/10 text-[#FCD34D] border-[#F59E0B]/30",
  },
  {
    tier: "CLASS 2: SEVERE BLIZZARD",
    wind: "50 – 75 kts (93 – 139 km/h)",
    visibility: "< 100 m",
    guideline: "Complete outdoor transit suspended. All scientific antenna masts locked in stow position. Powerhouse crew on continuous watch.",
    status: "STANDBY // ESCALATION WATCH",
    color: "bg-white/[0.03] text-[#94A3B8] border-white/[0.08]",
  },
  {
    tier: "CLASS 3: CATASTROPHIC STORM",
    wind: "> 75 kts (140+ km/h)",
    visibility: "Zero (Whiteout)",
    guideline: "Full emergency lockdown. Automatic load-shedding to Tier 1 life support only. Satellite antennas stowed.",
    status: "DORMANT",
    color: "bg-white/[0.02] text-[#64748B] border-white/[0.06]",
  },
];

export default function EnvironmentPage() {
  const easeEng = [0.32, 0.72, 0, 1] as const;
  const [station, setStation] = useState<Station>("BHARATI");
  const [isSyncing, setIsSyncing] = useState(false);

  const [envData, setEnvData] = useState<{
    tempC: number;
    windSpeedKmh: number;
    windKnots: number;
    pressureHpa: number;
    humidityPct: number;
    windStatus: string;
    isLiveNcpor: boolean;
    observationDate: string;
    stats?: {
      temperature: { avg: number | null; min: number | null; max: number | null };
      windSpeedMps: { avg: number | null; min: number | null; max: number | null };
      airPressureHpa: { avg: number | null; min: number | null; max: number | null };
      relativeHumidityPct: { avg: number | null; min: number | null; max: number | null };
    };
    series?: {
      temperature: { timestamp: number; value: number }[];
      windSpeed: { timestamp: number; value: number }[];
      airPressure: { timestamp: number; value: number }[];
      humidity: { timestamp: number; value: number }[];
    };
  }>({
    tempC: -13.64,
    windSpeedKmh: 27.5,
    windKnots: 14.86,
    pressureHpa: 977.1,
    humidityPct: 84.4,
    windStatus: "MODERATE_EASTERLY",
    isLiveNcpor: true,
    observationDate: "28 Sep 2026",
  });

  const fetchEnv = useCallback(async () => {
    try {
      const data = await api.getEnvironment(station);
      setEnvData({
        tempC: data.tempC,
        windSpeedKmh: data.windSpeedKmh,
        windKnots: data.windKnots ?? +(data.windSpeedKmh / 1.852).toFixed(1),
        pressureHpa: data.pressureHpa ?? 988.4,
        humidityPct: data.humidityPct ?? 68,
        windStatus: data.windStatus,
        isLiveNcpor: data.isLiveNcpor ?? true,
        observationDate: data.observationDate || "Live Observation",
        stats: data.stats,
        series: data.series,
      });
    } catch (err) {
      console.warn("Error fetching environment telemetry:", err);
    }
  }, [station]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await api.syncEnvironment(station);
      await fetchEnv();
    } catch (err) {
      console.error("Manual sync failed:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchEnv();
    const interval = setInterval(fetchEnv, 6000);
    return () => clearInterval(interval);
  }, [fetchEnv]);

  // Wind Chill calculation (Environment Canada / NOAA formula)
  const calcWindChill = (t: number, vKmh: number) => {
    if (vKmh < 4.8) return t;
    const wc = 13.12 + 0.6215 * t - 11.37 * Math.pow(vKmh, 0.16) + 0.3965 * t * Math.pow(vKmh, 0.16);
    return Math.round(wc * 10) / 10;
  };

  const currentWindChill = calcWindChill(envData.tempC, envData.windSpeedKmh);

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#06090E] text-[#F8FAFC] px-4 sm:px-6 lg:px-10 py-6 max-w-7xl mx-auto">
      <TopographicBg showRadarRings={false} />

      {/* ═══ BREADCRUMB & HEADER WITH STATION SELECTOR ═══ */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeEng }}
        className="bezel-shell p-1 mb-8 relative z-10"
      >
        <div className="bezel-core p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="w-9 h-9 rounded-md bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center transition-all text-[#94A3B8] hover:text-[#FFFFFF]"
              aria-label="Return to Twin Cockpit"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-[#94A3B8] uppercase tracking-widest font-semibold px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">
                  DOMAIN // 04 METEOROLOGY
                </span>
                <HeartbeatDot
                  size="sm"
                  status={envData.windSpeedKmh > 60 ? "CRITICAL" : "NORMAL"}
                  label={envData.windSpeedKmh > 60 ? "KATABATIC GALE ACTIVE" : "STATION MET NOMINAL"}
                />
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-[#FFFFFF] mt-1">
                Environmental Stress & Polar Meteorology
              </h1>
            </div>
          </div>

          {/* Station Switcher & Observation Metadata */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 font-mono text-xs">
            {/* Station Toggle */}
            <div className="flex p-0.5 rounded-lg bg-black/60 border border-white/10">
              <button
                onClick={() => setStation("BHARATI")}
                className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                  station === "BHARATI"
                    ? "bg-[#00A8FF] text-black shadow-lg shadow-[#00A8FF]/20"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                BHARATI (69°S)
              </button>
              <button
                onClick={() => setStation("MAITRI")}
                className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                  station === "MAITRI"
                    ? "bg-[#00D4A0] text-black shadow-lg shadow-[#00D4A0]/20"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                MAITRI (70°S)
              </button>
            </div>

            <div className="px-3 py-1.5 rounded-md bg-[#06090E]/80 border border-white/[0.06] text-[#64748B]">
              TERRAIN:{" "}
              <span className="text-[#F8FAFC] font-semibold">
                {station === "BHARATI" ? "Larsemann Hills (Prydz Bay)" : "Schirmacher Oasis"}
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-md bg-[#06090E]/80 border border-white/[0.06] text-[#64748B]">
              WIND CHILL: <span className="text-[#F59E0B] font-semibold">{currentWindChill}°C</span>
            </div>

            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-mono text-xs transition-all disabled:opacity-50"
              title="Poll fresh data from NCPOR live portal"
            >
              <ArrowsClockwise size={13} className={isSyncing ? "animate-spin" : ""} />
              <span>{isSyncing ? "SYNCING..." : "SYNC NCPOR"}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ═══ LIVE NCPOR OFFICIAL AWS SOURCE BANNER ═══ */}
      <div className="mb-6 p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-cyan-950/20 to-transparent border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs z-10 relative">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-300 font-bold tracking-wide uppercase">
            Official NCPOR / NCAOR AWS Live Feed:
          </span>
          <span className="text-white font-medium">
            {station === "BHARATI" ? "Bharati AWS Station" : "Maitri AWS Station"}
          </span>
          <span className="hidden md:inline text-[#64748B]">•</span>
          <span className="hidden md:inline text-[#94A3B8]">
            Observation Cycle: <strong className="text-white">{envData.observationDate}</strong>
          </span>
        </div>

        <a
          href={
            station === "BHARATI"
              ? "https://data.ncpor.res.in/bharati/live"
              : "https://data.ncpor.res.in/maitri/live"
          }
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors font-mono text-[11px]"
        >
          <span>View Source on NCPOR (MoES)</span>
          <ArrowSquareOut size={13} />
        </a>
      </div>

      {/* ═══ SECTION 1: AWS WEATHER INSTRUMENTATION ═══ */}
      <section className="mb-8 relative z-10">
        <HudPanel
          tag={station === "BHARATI" ? "// BHARATI-AWS-01" : "// MAITRI-AWS-01"}
          title={`${station} Automated Weather Station (AWS)`}
          subtitle={`Microclimate sensor cluster in ${station === "BHARATI" ? "Larsemann Hills coastal promontory" : "Schirmacher Oasis continental ice fringe"}`}
          status="LIVE"
          hoverEffect={false}
          className="p-6 md:p-8"
        >
          {/* Main Weather Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 p-4 rounded-lg bg-[#06090E]/90 border border-white/[0.06] mb-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-[#64748B] uppercase">Ambient Temp</span>
              <TelemetryValue value={envData.tempC} unit="°C" size="md" isLive={true} />
              <span className="text-[9px] font-mono text-[#64748B] mt-0.5">
                Min: {envData.stats?.temperature.min ?? "--"}° / Max: {envData.stats?.temperature.max ?? "--"}°
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-[#64748B] uppercase">Wind Speed</span>
              <TelemetryValue
                value={envData.windSpeedKmh}
                unit="km/h"
                size="md"
                status={envData.windSpeedKmh > 50 ? "WATCH" : "NORMAL"}
                isLive={true}
              />
              <span className="text-[9px] font-mono text-[#00D4A0] mt-0.5">
                {envData.windKnots} knots ({+(envData.windKnots * 0.5144).toFixed(1)} m/s)
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-[#64748B] uppercase">Wind Chill</span>
              <TelemetryValue
                value={currentWindChill}
                unit="°C"
                size="md"
                status={currentWindChill < -40 ? "WATCH" : "NORMAL"}
                isLive={true}
              />
              <span className="text-[9px] font-mono text-[#64748B] mt-0.5">Convective cooling</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-[#64748B] uppercase">Barometer</span>
              <TelemetryValue value={envData.pressureHpa} unit="hPa" size="md" isLive={true} />
              <span className="text-[9px] font-mono text-[#F59E0B] mt-0.5">
                Avg: {envData.stats?.airPressureHpa.avg ?? envData.pressureHpa} hPa
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-[#64748B] uppercase">Relative Humidity</span>
              <TelemetryValue value={envData.humidityPct} unit="%" size="md" isLive={true} />
              <span className="text-[9px] font-mono text-[#64748B] mt-0.5">
                Range: {envData.stats?.relativeHumidityPct.min ?? "--"}% – {envData.stats?.relativeHumidityPct.max ?? "--"}%
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-[#64748B] uppercase">Wind Status</span>
              <div className="font-mono text-sm font-bold text-white mt-1">
                {envData.windStatus.replace(/_/g, " ")}
              </div>
              <span className="text-[9px] font-mono text-emerald-400 mt-0.5">Continuous Monitoring</span>
            </div>
          </div>

          {/* 24-Hour Spline Curve Visualizer */}
          {envData.series && envData.series.temperature.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-black/40 border border-white/5 font-mono">
              <div className="flex items-center justify-between mb-3 text-xs">
                <div className="flex items-center gap-2">
                  <ChartLineUp size={16} className="text-[#00A8FF]" />
                  <span className="font-bold text-white uppercase tracking-wider">
                    24-Hour Diurnal Temperature Profile ({station})
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-[#7ABBD4]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 bg-[#D9534F] inline-block" />
                    <span>Temperature (°C)</span>
                  </span>
                  <span>{envData.series.temperature.length} hourly sample points</span>
                </div>
              </div>

              {/* Responsive SVG Sparkline */}
              <div className="w-full h-36 relative flex items-end">
                {(() => {
                  const points = envData.series.temperature;
                  const vals = points.map((p) => p.value);
                  const min = Math.min(...vals);
                  const max = Math.max(...vals);
                  const range = max - min || 1;
                  const width = 1000;
                  const height = 120;

                  const pathD = points
                    .map((p, idx) => {
                      const x = (idx / (points.length - 1)) * width;
                      const y = height - ((p.value - min) / range) * (height - 20) - 10;
                      return `${idx === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
                    })
                    .join(" ");

                  return (
                    <svg
                      viewBox={`0 0 ${width} ${height}`}
                      className="w-full h-full overflow-visible"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient id="tempGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#D9534F" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#D9534F" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d={`${pathD} L ${width} ${height} L 0 ${height} Z`}
                        fill="url(#tempGlow)"
                      />
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#D9534F"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {points.map((p, idx) => {
                        const x = (idx / (points.length - 1)) * width;
                        const y = height - ((p.value - min) / range) * (height - 20) - 10;
                        return (
                          <circle
                            key={idx}
                            cx={x}
                            cy={y}
                            r={idx === points.length - 1 ? 4 : 2}
                            fill={idx === points.length - 1 ? "#FFFFFF" : "#D9534F"}
                            stroke="#06090E"
                            strokeWidth="1"
                          />
                        );
                      })}
                    </svg>
                  );
                })()}
              </div>

              <div className="flex justify-between text-[9px] text-[#64748B] mt-2 border-t border-white/5 pt-1.5">
                <span>00:00 UTC</span>
                <span>06:00 UTC</span>
                <span>12:00 UTC</span>
                <span>18:00 UTC</span>
                <span className="text-white font-bold">Latest: {envData.tempC}°C</span>
              </div>
            </div>
          )}

          {/* Meteorological Analysis & Wind Vector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-lg bg-[#06090E]/80 border border-white/[0.06] space-y-2">
              <span className="text-[#FFFFFF] font-semibold block mb-2 tracking-wide uppercase">
                {station === "BHARATI" ? "PRYDZ BAY MARITIME KATABATIC GRADIENT" : "SCHIRMACHER CONTINENTAL DRAINAGE"}
              </span>
              <div className="flex justify-between py-1.5 border-b border-white/[0.06] text-[#64748B]">
                <span>PREVAILING AZIMUTH:</span>
                <span className="text-[#F8FAFC]">
                  {station === "BHARATI" ? "145° (South-East Promontory)" : "178° (South-South-East)"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/[0.06] text-[#64748B]">
                <span>ATMOSPHERIC PRESSURE:</span>
                <span className="text-[#F8FAFC]">{envData.pressureHpa} mBar (AWS Sensor)</span>
              </div>
              <div className="flex justify-between py-1.5 text-[#64748B]">
                <span>CURRENT WIND CLASSIFICATION:</span>
                <span className="text-[#00D4A0] font-semibold">
                  {envData.windKnots < 25 ? "MODERATE BREEZE" : "KATABATIC GALE"}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#06090E]/80 border border-white/[0.06] space-y-2">
              <span className="text-[#FFFFFF] font-semibold block mb-2 tracking-wide uppercase">
                24-HOUR STATISTICAL SUMMARY (NCPOR)
              </span>
              <div className="flex justify-between py-1.5 border-b border-white/[0.06] text-[#64748B]">
                <span>DIURNAL TEMPERATURE RANGE:</span>
                <span className="text-[#F8FAFC]">
                  {envData.stats?.temperature.min ?? "--"}°C to {envData.stats?.temperature.max ?? "--"}°C
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/[0.06] text-[#64748B]">
                <span>PEAK 24H WIND SPEED:</span>
                <span className="text-[#F8FAFC]">
                  {envData.stats?.windSpeedMps.max ?? "--"} m/s ({+( (envData.stats?.windSpeedMps.max ?? 0) * 1.94384).toFixed(1)} kts)
                </span>
              </div>
              <div className="flex justify-between py-1.5 text-[#64748B]">
                <span>DATA INTEGRITY:</span>
                <span className="text-[#10B981] font-semibold">
                  NCPOR AWS Verified ({envData.observationDate})
                </span>
              </div>
            </div>
          </div>
        </HudPanel>
      </section>

      {/* ═══ SECTION 2: KATABATIC BLIZZARD WARNING PROTOCOLS ═══ */}
      <section className="mb-8 relative z-10">
        <HudPanel
          tag="// PROTOCOL-BLIZZARD"
          title="Antarctic Gale & Blizzard Warning Classification"
          subtitle="Station standard operating procedure for exterior transit and equipment tie-downs"
          status="WATCH"
          hoverEffect={false}
        >
          <div className="space-y-3">
            {BLIZZARD_CLASSES.map((b) => (
              <div
                key={b.tier}
                className={`p-4 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs ${b.color}`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#FFFFFF]">{b.tier}</span>
                    <span className="text-white/20">|</span>
                    <span className="text-[#F8FAFC] font-semibold">{b.wind}</span>
                    <span className="text-white/20">|</span>
                    <span className="text-[#94A3B8]">Vis: {b.visibility}</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] font-body leading-relaxed">
                    {b.guideline}
                  </p>
                </div>

                <span className="text-[9px] font-bold px-2 py-1 rounded bg-[#06090E] border border-white/[0.08] tracking-wider shrink-0 uppercase">
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </HudPanel>
      </section>

      {/* ═══ SECTION 3: HYDROLOGY & SOLAR EPHEMERIS TRACKER ═══ */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 relative z-10">
        <HudPanel
          tag={station === "BHARATI" ? "// WATER-BHARATI" : "// WATER-MAITRI"}
          title={station === "BHARATI" ? "Seawater Intake & RO Desalination Profile" : "Lake Priyadarshini Limnological Profile"}
          subtitle={station === "BHARATI" ? "Heated pipeline from coastal fjord intake" : "Continuous sensors through perennial freshwater ice cover"}
          status="LIVE"
          hoverEffect={false}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-[#06090E]/90 border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#64748B] uppercase block">
                  {station === "BHARATI" ? "Intake Line Trace Heat" : "Surface Ice Sheet Thickness"}
                </span>
                <TelemetryValue
                  value={station === "BHARATI" ? 4.2 : 2.1}
                  unit={station === "BHARATI" ? "°C" : "meters"}
                  size="lg"
                  isLive={true}
                />
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-[#64748B] uppercase block">
                  {station === "BHARATI" ? "Primary Water System" : "Intake Depth"}
                </span>
                <span className="font-mono text-sm font-semibold text-[#F8FAFC]">
                  {station === "BHARATI" ? "RO Desalination Plant" : "4.5 m (Liquid Pool)"}
                </span>
              </div>
            </div>

            <div className="space-y-2 font-mono text-xs text-[#64748B]">
              <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                <span>WATER PURITY STATUS:</span>
                <span className="text-[#10B981] font-semibold">POTABLE GRADE (VERIFIED)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                <span>FREEZE DEFENSE LOOP:</span>
                <span className="text-[#F8FAFC]">AUTOMATIC GLYCOL TRACE HEATING</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span>DAILY PRODUCTION RATE:</span>
                <span className="text-[#F8FAFC]">{station === "BHARATI" ? "2,400 L/day" : "1,800 L/day"}</span>
              </div>
            </div>
          </div>
        </HudPanel>

        <HudPanel
          tag="// EPHEMERIS-01"
          title="Polar Ephemeris & Solar Cycle Tracker"
          subtitle={`${station} Coordinates: ${station === "BHARATI" ? "69°24′28″S 76°11′14″E" : "70°45′57″S 11°44′09″E"}`}
          status="LIVE"
          hoverEffect={false}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-[#06090E]/90 border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#64748B] uppercase block">
                  Seasonal Sun State
                </span>
                <div className="font-mono text-lg font-bold text-white mt-1">
                  Spring Transition
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-[#64748B] uppercase block">
                  Solar Elevation
                </span>
                <span className="font-mono text-sm font-semibold text-emerald-400">
                  +18.4° Solar Noon
                </span>
              </div>
            </div>

            <div className="space-y-2 font-mono text-xs text-[#64748B]">
              <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                <span>CURRENT LIGHT REGIME:</span>
                <span className="text-[#F8FAFC] font-semibold">12h 45m DAYLIGHT (EXPANDING)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                <span>AURORA AUSTRALIS PROBABILITY:</span>
                <span className="text-[#10B981] font-semibold">MODERATE (Kp Index: 3.2)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span>SUMMER SOLSTICE (24H SUN):</span>
                <span className="text-[#F8FAFC]">21 December 2026</span>
              </div>
            </div>
          </div>
        </HudPanel>
      </section>
    </div>
  );
}
