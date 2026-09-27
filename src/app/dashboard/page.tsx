"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  ShieldCheck,
  Lightning,
  Waves,
  Package,
  Wind,
  Warning,
  Cpu,
  TerminalWindow,
  SlidersHorizontal,
  Flame,
  ArrowRight,
  ArrowsClockwise,
  Radio,
  CheckCircle,
} from "@phosphor-icons/react";
import { HudPanel } from "@/components/HudPanel";
import { HeartbeatDot } from "@/components/HeartbeatDot";
import { TelemetryValue } from "@/components/TelemetryValue";
import { TopographicBg } from "@/components/TopographicBg";
import { INITIAL_VITALS, STATION_CONSTANTS, SystemHealthState } from "@/lib/telemetry";

const INITIAL_LOGS = [
  { time: "12:44:02", level: "INFO", src: "SYS_CORE", prov: "SENSOR", msg: "Lossless telemetry synchronization confirmed via INSAT-3DR." },
  { time: "12:44:15", level: "INFO", src: "GEN_CTRL", prov: "OFFICIAL", msg: "Generator 'Ravi' governor nominal. Phase balance: 415.2V @ 50.04 Hz." },
  { time: "12:45:01", level: "WARN", src: "ENV_MON",  prov: "SENSOR", msg: "Katabatic wind acceleration detected on northern ridgeline: 48.6 kts." },
  { time: "12:45:18", level: "WARN", src: "HYD_SYS",  prov: "SENSOR", msg: "Trace heat circuit #2 current draw 6.2A vs 8.0A nominal. Inspection flagged." },
  { time: "12:46:05", level: "INFO", src: "THERMAL",  prov: "SIMULATED", msg: "Thermodynamic twin recalculated: freeze horizon safe at 140 min." },
];

export default function DashboardPage() {
  const [utcTime, setUtcTime] = useState("");
  const [stormMode, setStormMode] = useState(false);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [activeGenTab, setActiveGenTab] = useState<"Ravi" | "Surya" | "Aditya">("Ravi");
  const scrollRef = useRef<HTMLDivElement>(null);

  // UTC clock ticker
  useEffect(() => {
    const tick = () => setUtcTime(new Date().toUTCString().slice(17, 25) + " UTC");
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Periodic log stream
  useEffect(() => {
    const stream = [
      { level: "INFO", src: "PLC_NODE", prov: "SENSOR", msg: "Day-tank #1 level verified: 88% full." },
      { level: "INFO", src: "SAT_ISRO", prov: "OFFICIAL", msg: "Uplink packet SNR: 18.4 dB. Zero packet drop." },
      { level: "WARN", src: "ENV_STRESS", prov: "SIMULATED", msg: "Convective heat loss index increased by 8.4%." },
      { level: "INFO", src: "BIO_DIGEST", prov: "SENSOR", msg: "Anaerobic digester temperature steady at 36.8°C." },
      { level: "INFO", src: "LIFE_SUP", prov: "SIMULATED", msg: "Internal habitat air quality index: CO2 480ppm nominal." },
    ];

    const id = setInterval(() => {
      const nextItem = stream[Math.floor(Math.random() * stream.length)];
      setLogs((prev) => [
        ...prev.slice(-24),
        {
          time: new Date().toUTCString().slice(17, 25),
          level: nextItem.level,
          src: nextItem.src,
          prov: nextItem.prov,
          msg: nextItem.msg,
        },
      ]);
    }, 4500);

    return () => clearInterval(id);
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Derived telemetry based on storm mode toggle
  const currentTemp = stormMode ? -44.2 : INITIAL_VITALS.externalTemp.value;
  const currentWind = stormMode ? 92.5 : INITIAL_VITALS.windSpeed.value;
  const currentDemand = stormMode ? 56.4 : INITIAL_VITALS.totalPowerDemand.value;
  const currentTraceHeat = stormMode ? 28.6 : 18.4;
  const freezeHorizon = stormMode ? 34 : 140;
  const overallStatus: SystemHealthState = stormMode ? "CRITICAL" : "NORMAL";

  const easeEng = [0.32, 0.72, 0, 1] as const;

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#06090E] text-[#F8FAFC] px-4 sm:px-6 lg:px-10 py-6 max-w-[1600px] mx-auto">
      <TopographicBg showRadarRings={false} />

      {/* ═══ TOP COMMAND BAR / COCKPIT HEADER ═══ */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeEng }}
        className="bezel-shell p-1 mb-6 relative z-10"
      >
        <div className="bezel-core p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Station Identity & Back Link */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="w-9 h-9 rounded-md bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center transition-all text-[#94A3B8] hover:text-[#FFFFFF]"
              aria-label="Return to Overview"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <HeartbeatDot
                  size="md"
                  status={overallStatus}
                  label={stormMode ? "CRITICAL // STORM OVERRIDE ENGAGED" : "NOMINAL TELEMETRY // 1Hz SYNCHRONIZED"}
                  pulse={true}
                />
              </div>
              <div className="flex items-center gap-2 mt-1 font-mono text-[10px] text-[#64748B] uppercase tracking-wider">
                <span className="text-[#94A3B8] font-medium">{STATION_CONSTANTS.STATION_NAME} STATION ({STATION_CONSTANTS.STATION_CODE})</span>
                <span>•</span>
                <span>{STATION_CONSTANTS.COORDINATES_DISPLAY}</span>
                <span>•</span>
                <span className="text-[#64748B]">SCHIRMACHER OASIS</span>
              </div>
            </div>
          </div>

          {/* Center: System Clock & Autonomy Metric */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#06090E]/80 border border-white/[0.08]">
              <Clock size={14} className="text-[#94A3B8]" />
              <span className="text-[#F8FAFC] tracking-wider">{utcTime || "12:00:00 UTC"}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#06090E]/80 border border-white/[0.08]">
              <ShieldCheck size={14} className="text-[#10B981]" weight="fill" />
              <span className="text-[#64748B]">AUTONOMY:</span>
              <span className="text-[#F8FAFC] font-semibold">142 DAYS</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#06090E]/80 border border-white/[0.08]">
              <span className="text-[#64748B]">RESUPPLY:</span>
              <span className="text-[#F8FAFC] font-semibold">T-214 DAYS</span>
            </div>
          </div>

          {/* Right: What-If Storm Trigger Toggle Switch */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStormMode(!stormMode)}
              className={`px-4 py-2 rounded-md font-mono text-xs tracking-wider uppercase flex items-center gap-2.5 border transition-all duration-300 ${
                stormMode
                  ? "bg-[#EF4444]/15 border-[#EF4444]/50 text-[#FCA5A5] shadow-[0_0_20px_rgba(239,68,68,0.2)] font-semibold"
                  : "bg-white/[0.03] border-white/[0.08] text-[#94A3B8] hover:text-[#FFFFFF] hover:border-white/20 hover:bg-white/[0.06]"
              }`}
            >
              <SlidersHorizontal size={14} className={stormMode ? "text-[#EF4444] animate-pulse" : "text-[#64748B]"} />
              <span>{stormMode ? "Storm Override Active" : "Simulate Katabatic Storm"}</span>
              <span
                className={`w-2 h-2 rounded-full transition-colors ${
                  stormMode ? "bg-[#EF4444] shadow-[0_0_8px_#EF4444]" : "bg-[#475569]"
                }`}
              />
            </button>
          </div>
        </div>
      </motion.header>

      {/* ═══ ROW 1: FOUR DOMAIN SUMMARY HUD CARDS ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 relative z-10">
        {/* Domain 1: Energy & Microgrid */}
        <HudPanel
          tag="// SYS-01"
          title="Microgrid & Generation"
          status={stormMode ? "WATCH" : "LIVE"}
          href="/energy"
          hoverEffect={true}
        >
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] font-mono uppercase text-[#64748B]">Primary Demand</span>
              <TelemetryValue value={currentDemand} unit="kW" size="lg" isLive={true} />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06] text-[10px] font-mono text-[#64748B]">
              <div>ACTIVE: <span className="text-[#F8FAFC]">GEN-01 (Ravi)</span></div>
              <div>FREQ: <span className="text-[#F8FAFC]">50.04 Hz</span></div>
              <div>VOLTAGE: <span className="text-[#94A3B8]">415.2 V</span></div>
              <div>STANDBY: <span className="text-[#64748B]">Aditya, Surya</span></div>
            </div>
          </div>
        </HudPanel>

        {/* Domain 2: Infrastructure & Hydrology */}
        <HudPanel
          tag="// SYS-02"
          title="Priyadarshini Hydrology"
          status={stormMode ? "CRITICAL" : "WATCH"}
          href="/infrastructure"
          hoverEffect={true}
        >
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] font-mono uppercase text-[#64748B]">Freeze Horizon</span>
              <TelemetryValue
                value={freezeHorizon}
                unit="min"
                size="lg"
                status={stormMode ? "CRITICAL" : "NORMAL"}
                isLive={true}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06] text-[10px] font-mono text-[#64748B]">
              <div>INTAKE TEMP: <span className="text-[#F8FAFC]">+1.4°C</span></div>
              <div>TRACE HEAT: <span className={stormMode ? "text-[#EF4444]" : "text-[#F59E0B]"}>{currentTraceHeat} kW</span></div>
              <div>FLOW RATE: <span className="text-[#F8FAFC]">42.8 L/m</span></div>
              <div>STORAGE: <span className="text-[#94A3B8]">8,400 L</span></div>
            </div>
          </div>
        </HudPanel>

        {/* Domain 3: Logistics & Fuel Autonomy */}
        <HudPanel
          tag="// SYS-03"
          title="Fuel Farm & Consumables"
          status="LIVE"
          href="/logistics"
          hoverEffect={true}
        >
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] font-mono uppercase text-[#64748B]">Bulk Jet A-1</span>
              <TelemetryValue value={84620} unit="L" size="lg" isLive={true} />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06] text-[10px] font-mono text-[#64748B]">
              <div>AUTONOMY: <span className="text-[#10B981]">142 Days</span></div>
              <div>BURN RATE: <span className="text-[#F8FAFC]">{stormMode ? "580" : "412"} L/d</span></div>
              <div>RATION BUFFER: <span className="text-[#94A3B8]">180 Days</span></div>
              <div>SPARES: <span className="text-[#10B981]">96% Ready</span></div>
            </div>
          </div>
        </HudPanel>

        {/* Domain 4: Environmental Stress */}
        <HudPanel
          tag="// SYS-04"
          title="Meteorological Stress"
          status={stormMode ? "CRITICAL" : "LIVE"}
          href="/environment"
          hoverEffect={true}
        >
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] font-mono uppercase text-[#64748B]">Katabatic Gale</span>
              <TelemetryValue
                value={currentWind}
                unit="kts"
                size="lg"
                status={stormMode ? "CRITICAL" : "WATCH"}
                isLive={true}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06] text-[10px] font-mono text-[#64748B]">
              <div>AMBIENT: <span className="text-[#F8FAFC]">{currentTemp}°C</span></div>
              <div>WIND CHILL: <span className={stormMode ? "text-[#EF4444]" : "text-[#F59E0B]"}>{stormMode ? "-68" : "-46.8"}°C</span></div>
              <div>BAROMETER: <span className="text-[#94A3B8]">986.2 hPa</span></div>
              <div>SOLAR UV: <span className="text-[#64748B]">0.0 (Night)</span></div>
            </div>
          </div>
        </HudPanel>
      </div>

      {/* ═══ ROW 2: DEEP TELEMETRY & SYSTEM DETAILS ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 relative z-10">
        
        {/* Left: 3× Kirloskar Generator Matrix (Span 7) */}
        <div className="lg:col-span-7 flex flex-col">
          <HudPanel
            tag="// PWR-01"
            title="Kirloskar 62.5 kVA Diesel Generator Subsystem"
            subtitle="Powerhouse configuration: Three primary alternators under automated load sharing and thermal rotation"
            status="LIVE"
            hoverEffect={false}
            className="h-full"
          >
            {/* Generator Selection Tabs */}
            <div className="flex items-center gap-2 mb-4 border-b border-white/[0.06] pb-3">
              {(["Ravi", "Surya", "Aditya"] as const).map((name) => {
                const isActive = activeGenTab === name;
                const isOnline = name === "Ravi" || (stormMode && name === "Surya");
                return (
                  <button
                    key={name}
                    onClick={() => setActiveGenTab(name)}
                    className={`px-3.5 py-1.5 rounded-md font-mono text-xs tracking-wider uppercase transition-all flex items-center gap-2 border ${
                      isActive
                        ? "bg-white/[0.08] border-white/25 text-[#FFFFFF] font-medium shadow-[0_1px_4px_rgba(0,0,0,0.5)]"
                        : "bg-white/[0.02] border-white/[0.06] text-[#94A3B8] hover:text-[#FFFFFF] hover:border-white/10"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isOnline ? "bg-[#10B981] shadow-[0_0_6px_#10B981]" : "bg-[#475569]"
                      }`}
                    />
                    <span>Gen-Set {name}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Generator Telemetry Gauges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-lg bg-[#06090E]/90 border border-white/[0.06] mb-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-[#64748B] uppercase">Alternator Load</span>
                <TelemetryValue
                  value={activeGenTab === "Ravi" ? (stormMode ? 86 : 74) : stormMode && activeGenTab === "Surya" ? 62 : 0}
                  unit="%"
                  size="md"
                  isLive={activeGenTab === "Ravi" || (stormMode && activeGenTab === "Surya")}
                />
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-[#64748B] uppercase">Coolant Temp</span>
                <TelemetryValue
                  value={activeGenTab === "Ravi" ? 84.5 : 38.0}
                  unit="°C"
                  size="md"
                  isLive={activeGenTab === "Ravi"}
                />
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-[#64748B] uppercase">Oil Pressure</span>
                <TelemetryValue
                  value={activeGenTab === "Ravi" ? 395 : 0}
                  unit="kPa"
                  size="md"
                  isLive={activeGenTab === "Ravi"}
                />
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-[#64748B] uppercase">Fuel Burn Rate</span>
                <TelemetryValue
                  value={activeGenTab === "Ravi" ? (stormMode ? 18.2 : 16.4) : 0}
                  unit="L/h"
                  size="md"
                  isLive={activeGenTab === "Ravi"}
                />
              </div>
            </div>

            {/* Alternator Diagnostics details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-md bg-white/[0.02] border border-white/[0.06] flex justify-between items-center">
                <span className="text-[#64748B]">HOURS SINCE OVERHAUL:</span>
                <span className="text-[#F8FAFC] font-semibold">
                  {activeGenTab === "Ravi" ? "2,840 h" : activeGenTab === "Surya" ? "120 h" : "4,190 h"}
                </span>
              </div>
              <div className="p-3 rounded-md bg-white/[0.02] border border-white/[0.06] flex justify-between items-center">
                <span className="text-[#64748B]">VIBRATION AMPLITUDE:</span>
                <span className="text-[#10B981] font-semibold">1.8 mm/sec (NOMINAL)</span>
              </div>
            </div>
          </HudPanel>
        </div>

        {/* Right: Priyadarshini Heated Pipeline Schematic (Span 5) */}
        <div className="lg:col-span-5 flex flex-col">
          <HudPanel
            tag="// HYD-02"
            title="Heated Lake Pipeline Schematic"
            subtitle="2.5 km trace-heated intake line from Lake Priyadarshini to station buffer tanks"
            status={stormMode ? "CRITICAL" : "WATCH"}
            hoverEffect={false}
            className="h-full"
          >
            {/* Visual Pipeline Bar */}
            <div className="p-4 rounded-lg bg-[#06090E]/90 border border-white/[0.06] mb-4">
              <div className="flex justify-between text-[10px] font-mono text-[#64748B] mb-2 uppercase">
                <span>Intake: <span className="text-[#F8FAFC]">+1.4°C</span></span>
                <span>Trace Heat: <span className={stormMode ? "text-[#EF4444]" : "text-[#F59E0B]"}>{currentTraceHeat} kW</span></span>
                <span>Habitat: <span className="text-[#F8FAFC]">+8.2°C</span></span>
              </div>

              {/* Heated pipe progress line with tick marks */}
              <div className="relative h-3 bg-white/[0.05] rounded-full overflow-hidden border border-white/[0.08] p-[1px]">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    stormMode
                      ? "bg-gradient-to-r from-[#38BDF8] via-[#F59E0B] to-[#EF4444]"
                      : "bg-gradient-to-r from-[#38BDF8] via-[#10B981] to-[#38BDF8]"
                  }`}
                  style={{ width: "100%" }}
                />
              </div>

              <div className="flex justify-between text-[9px] font-mono text-[#64748B] mt-2">
                <span>0.0 km (Lake Submersible)</span>
                <span>1.2 km (Junction BJ-04)</span>
                <span>2.5 km (Boiler Header)</span>
              </div>
            </div>

            {/* Waste & Ecological Subsystems */}
            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 rounded-md bg-white/[0.02] border border-white/[0.06] flex justify-between items-center">
                <span className="text-[#64748B]">ANAEROBIC DIGESTER TEMP:</span>
                <span className="text-[#F8FAFC] font-semibold">36.8°C (THERMALLY COUPLED)</span>
              </div>
              <div className="p-3 rounded-md bg-white/[0.02] border border-white/[0.06] flex justify-between items-center">
                <span className="text-[#64748B]">INCINERATOR RESIDUE ASH:</span>
                <span className="text-[#F8FAFC] font-semibold">42.5 kg (TREATY RETENTION)</span>
              </div>
            </div>
          </HudPanel>
        </div>

      </div>

      {/* ═══ ROW 3: CROSS-DOMAIN CASCADE & FORENSIC LOG STREAM ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left: Cross-Domain Cascade Engine (Span 6) */}
        <div className="lg:col-span-6 flex flex-col">
          <HudPanel
            tag="// CASCADE-01"
            title="Cross-Domain Failure Propagation Graph"
            subtitle="Physics-informed failure cascade sequence modeled across power, thermal, and hydraulic systems"
            status="LIVE"
            hoverEffect={false}
            className="h-full"
          >
            <div className="space-y-3">
              {[
                {
                  step: "01",
                  title: "Generator 1 (Ravi) Sheds 20% Capacity",
                  impact: "Microgrid voltage sags to 398V. Automatic transfer switch isolates non-essential auxiliary loads.",
                  status: "TRIGGER",
                  badge: "bg-white/[0.06] text-[#CBD5E1] border-white/10",
                },
                {
                  step: "02",
                  title: "Switchboard B Sheds Trace Heat Circuit #2",
                  impact: "Pipeline segment BJ-04 loses convective compensation. Heat loss rate accelerates to 1.8°C/hr.",
                  status: "CASCADE",
                  badge: "bg-[#F59E0B]/10 text-[#FBBF24] border-[#F59E0B]/30",
                },
                {
                  step: "03",
                  title: "Lake Intake Freeze Horizon: 34 Minutes",
                  impact: "Freshwater intake halts if unaddressed. Emergency glycol backflush protocol armed.",
                  status: stormMode ? "URGENT" : "PROJECTED",
                  badge: stormMode ? "bg-[#EF4444]/15 text-[#FCA5A5] border-[#EF4444]/40" : "bg-white/[0.04] text-[#94A3B8] border-white/[0.08]",
                },
              ].map((c) => (
                <div
                  key={c.step}
                  className="p-3.5 rounded-md border border-white/[0.06] bg-[#06090E]/60 flex items-start gap-3"
                >
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/[0.06] text-[#94A3B8] border border-white/[0.08]">
                    {c.step}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-headline text-xs font-semibold text-[#FFFFFF]">
                        {c.title}
                      </h4>
                      <span className={`font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded border ${c.badge}`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="font-body text-[11px] text-[#94A3B8] mt-1 leading-relaxed">
                      {c.impact}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
              <span className="text-[#64748B]">PREVENTIVE AUTOMATION:</span>
              <span className="text-[#10B981] font-medium flex items-center gap-1.5">
                <CheckCircle size={14} weight="bold" />
                SURYA AUTO-START AT 15 MIN HORIZON
              </span>
            </div>
          </HudPanel>
        </div>

        {/* Right: Live Telemetry Terminal Stream (Span 6) */}
        <div className="lg:col-span-6 flex flex-col">
          <HudPanel
            tag="// LOGS-01"
            title="Forensic Data Stream (1Hz)"
            subtitle="Raw packet stream with NCPOR cryptographic provenance validation"
            status="LIVE"
            hoverEffect={false}
            className="h-full flex flex-col"
          >
            <div
              ref={scrollRef}
              className="flex-1 min-h-[260px] max-h-[320px] overflow-y-auto space-y-2 p-3 rounded-md bg-[#04060A] border border-white/[0.06] font-mono text-[11px] select-text"
            >
              <AnimatePresence initial={false}>
                {logs.map((log, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2.5 leading-relaxed"
                  >
                    <span className="text-[#64748B] shrink-0 select-none">
                      [{log.time}]
                    </span>
                    <span
                      className={`shrink-0 font-medium ${
                        log.level === "WARN" ? "text-[#F59E0B]" : "text-[#CBD5E1]"
                      }`}
                    >
                      {log.level}
                    </span>
                    <span className="px-1 py-0.5 rounded bg-white/[0.04] text-[9px] text-[#64748B] border border-white/[0.04] shrink-0">
                      {log.prov}
                    </span>
                    <span className="text-[#94A3B8] shrink-0 uppercase tracking-wider">
                      {log.src}:
                    </span>
                    <span
                      className={
                        log.level === "WARN" ? "text-[#FBBF24]/90" : "text-[#E2E8F0]/90"
                      }
                    >
                      {log.msg}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-[#64748B]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                ISRO TELEMETRY LINK LOCKED
              </span>
              <span>NVMe BUFFER: 12% UTILIZATION</span>
            </div>
          </HudPanel>
        </div>

      </div>
    </div>
  );
}
