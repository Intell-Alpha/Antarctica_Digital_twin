"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BatteryCharging,
  Lightning,
  Flame,
  ArrowLeft,
  ArrowsClockwise,
  Gauge,
  SlidersHorizontal,
  Sun,
  ShieldCheck,
  CheckCircle,
} from "@phosphor-icons/react";
import { HudPanel } from "@/components/HudPanel";
import { HeartbeatDot } from "@/components/HeartbeatDot";
import { TelemetryValue } from "@/components/TelemetryValue";
import { TopographicBg } from "@/components/TopographicBg";
import { INITIAL_VITALS, STATION_CONSTANTS } from "@/lib/telemetry";

const GENERATORS_DATA = [
  {
    id: "gen-01",
    name: "Ravi",
    kva: "62.5 kVA",
    status: "ONLINE",
    loadPct: 74,
    powerKw: 46.2,
    voltage: 415.2,
    freq: 50.04,
    coolantC: 84.5,
    oilKpa: 395,
    burnRateLph: 16.4,
    hoursRun: 2840,
    hoursToService: 160,
    vibrationMmSec: 1.8,
  },
  {
    id: "gen-02",
    name: "Surya",
    kva: "62.5 kVA",
    status: "STANDBY",
    loadPct: 0,
    powerKw: 0.0,
    voltage: 0.0,
    freq: 0.0,
    coolantC: 38.0,
    oilKpa: 0,
    burnRateLph: 0.0,
    hoursRun: 120,
    hoursToService: 2880,
    vibrationMmSec: 0.1,
  },
  {
    id: "gen-03",
    name: "Aditya",
    kva: "62.5 kVA",
    status: "STANDBY",
    loadPct: 0,
    powerKw: 0.0,
    voltage: 0.0,
    freq: 0.0,
    coolantC: 22.0,
    oilKpa: 0,
    burnRateLph: 0.0,
    hoursRun: 4190,
    hoursToService: 810,
    vibrationMmSec: 0.0,
  },
];

const LOAD_TIERS = [
  {
    tier: "TIER 1",
    name: "Life-Support & Survival",
    kw: 24.6,
    loads: "Trace Heating Circuits, Lake Submersible Pump, Habitat Radiator Circulators",
    priority: "PROTECTED (NEVER SHED)",
    status: "ACTIVE",
    badgeColor: "bg-[#10B981]/15 text-[#6EE7B7] border border-[#10B981]/30",
  },
  {
    tier: "TIER 2",
    name: "Mission Science & Satellite Comms",
    kw: 11.2,
    loads: "ISRO Uplink Transceiver, Geomagnetic Riometer, Weather Mast, NVMe Server",
    priority: "ESSENTIAL",
    status: "ACTIVE",
    badgeColor: "bg-white/[0.08] text-[#E2E8F0] border border-white/20",
  },
  {
    tier: "TIER 3",
    name: "Domestic Comfort & Galley",
    kw: 9.0,
    loads: "Induction Cooktop, Galley Oven, Domestic Water Heaters, Cabin Fans",
    priority: "SHEDDABLE IN ANOMALY",
    status: "ACTIVE",
    badgeColor: "bg-white/[0.04] text-[#94A3B8] border border-white/[0.08]",
  },
  {
    tier: "TIER 4",
    name: "Auxiliary & Workshop",
    kw: 4.2,
    loads: "Snowcat Engine Block Heaters, Machine Tool Lathe, Battery Rechargers",
    priority: "DISCRETIONARY (AUTO-SHED)",
    status: "STANDBY",
    badgeColor: "bg-[#F59E0B]/15 text-[#FCD34D] border border-[#F59E0B]/30",
  },
];

export default function EnergyPage() {
  const [selectedGen, setSelectedGen] = useState(0);
  const easeEng = [0.32, 0.72, 0, 1] as const;

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#06090E] text-[#F8FAFC] px-4 sm:px-6 lg:px-10 py-6 max-w-7xl mx-auto">
      <TopographicBg showRadarRings={false} />

      {/* ═══ BREADCRUMB & HEADER ═══ */}
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
                  DOMAIN // 02
                </span>
                <HeartbeatDot size="sm" status="LIVE" label="MICROGRID SYNCHRONIZED" />
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-[#FFFFFF] mt-1">
                Power Generation & Microgrid
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-mono text-xs text-[#64748B]">
            <div className="px-3 py-1.5 rounded-md bg-[#06090E]/80 border border-white/[0.06]">
              BUS: <span className="text-[#F8FAFC] font-semibold">415V · 50.04 Hz</span>
            </div>
            <div className="px-3 py-1.5 rounded-md bg-[#06090E]/80 border border-white/[0.06]">
              STATION LOAD: <span className="text-[#F8FAFC] font-semibold">44.8 kW</span>
            </div>
            <div className="px-3 py-1.5 rounded-md bg-[#06090E]/80 border border-white/[0.06]">
              ROTATION IN: <span className="text-[#10B981] font-semibold">118 Hours</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══ SECTION 1: 3× KIRLOSKAR DIESEL GENERATOR ARRAY ═══ */}
      <section className="mb-8 relative z-10">
        <HudPanel
          tag="// GEN-ARRAY-01"
          title="3× 62.5 kVA Kirloskar Diesel Alternator Panel"
          subtitle="Prime power source for Maitri Station operating in n+2 redundant rotation with automated failover"
          status="LIVE"
          hoverEffect={false}
          className="p-6 md:p-8"
        >
          {/* Generator Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {GENERATORS_DATA.map((gen, idx) => (
              <button
                key={gen.id}
                onClick={() => setSelectedGen(idx)}
                className={`p-5 rounded-lg border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  selectedGen === idx
                    ? "bg-[#0E1626] border-white/30 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                    : "bg-[#070B12] border-white/[0.06] hover:border-white/15 hover:bg-[#0B101A]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-semibold text-[#FFFFFF]">
                      GEN-0{idx + 1} // {gen.name}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded tracking-widest font-semibold border ${
                        gen.status === "ONLINE"
                          ? "bg-[#10B981]/15 text-[#6EE7B7] border-[#10B981]/30"
                          : "bg-white/[0.04] text-[#64748B] border-white/[0.06]"
                      }`}
                    >
                      {gen.status}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mb-4">
                    <span className="text-[10px] font-mono uppercase text-[#64748B]">Load</span>
                    <TelemetryValue
                      value={gen.loadPct}
                      unit="%"
                      size="lg"
                      isLive={gen.status === "ONLINE"}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-white/[0.06] font-mono text-xs text-[#64748B] w-full">
                  <div className="flex justify-between">
                    <span>Active Output:</span>
                    <span className="text-[#F8FAFC] font-medium">{gen.powerKw} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coolant Jacket:</span>
                    <span className="text-[#F8FAFC] font-medium">{gen.coolantC}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fuel Consumption:</span>
                    <span className="text-[#94A3B8] font-medium">{gen.burnRateLph} L/h</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Deep Selected Generator Diagnostics */}
          <div className="p-5 rounded-lg bg-[#06090E]/90 border border-white/[0.06]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.06] text-xs font-mono text-[#64748B]">
              <span className="font-semibold text-[#FFFFFF]">
                DEEP ENGINE METRICS: {GENERATORS_DATA[selectedGen].name} (62.5 kVA Kirloskar HA694)
              </span>
              <span className="flex items-center gap-1.5 text-[#10B981]">
                <CheckCircle size={13} weight="bold" />
                PLC POLLING: 100ms
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#64748B] block mb-1">
                  Lubrication Oil Pressure
                </span>
                <TelemetryValue
                  value={GENERATORS_DATA[selectedGen].oilKpa}
                  unit="kPa"
                  size="md"
                  isLive={GENERATORS_DATA[selectedGen].status === "ONLINE"}
                />
                <span className="text-[9px] font-mono text-[#64748B] block mt-0.5">
                  Nominal range: 350–450 kPa
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-[#64748B] block mb-1">
                  Engine Coolant Jacket
                </span>
                <TelemetryValue
                  value={GENERATORS_DATA[selectedGen].coolantC}
                  unit="°C"
                  size="md"
                  isLive={GENERATORS_DATA[selectedGen].status === "ONLINE"}
                />
                <span className="text-[9px] font-mono text-[#64748B] block mt-0.5">
                  Thermostat set: 82–88°C
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-[#64748B] block mb-1">
                  Operating Hours Run
                </span>
                <TelemetryValue
                  value={GENERATORS_DATA[selectedGen].hoursRun}
                  unit="hrs"
                  size="md"
                  isLive={false}
                />
                <span className="text-[9px] font-mono text-[#10B981] block mt-0.5">
                  {GENERATORS_DATA[selectedGen].hoursToService}h until overhaul
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-[#64748B] block mb-1">
                  Crankcase Vibration
                </span>
                <TelemetryValue
                  value={GENERATORS_DATA[selectedGen].vibrationMmSec}
                  unit="mm/s"
                  size="md"
                  isLive={GENERATORS_DATA[selectedGen].status === "ONLINE"}
                />
                <span className="text-[9px] font-mono text-[#64748B] block mt-0.5">
                  ISO 10816 class 1 nominal
                </span>
              </div>
            </div>
          </div>
        </HudPanel>
      </section>

      {/* ═══ SECTION 2: 415V BUS DISTRIBUTION & LOAD SHEDDING TIERS ═══ */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 relative z-10">
        {/* Load Priority Tiers (Span 7) */}
        <div className="lg:col-span-7 flex flex-col">
          <HudPanel
            tag="// BUS-01"
            title="415V / 230V Microgrid Load Shedding Architecture"
            subtitle="Automated PLC contactors execute deterministic load shedding if generator frequency drops below 48.5 Hz"
            status="LIVE"
            hoverEffect={false}
            className="h-full"
          >
            <div className="space-y-3">
              {LOAD_TIERS.map((tier) => (
                <div
                  key={tier.tier}
                  className="p-4 rounded-lg bg-[#06090E]/80 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#FFFFFF]">{tier.tier}</span>
                      <span className="text-white/20">|</span>
                      <span className="text-[#F8FAFC]">{tier.name}</span>
                    </div>
                    <p className="text-[11px] text-[#94A3B8] font-body leading-relaxed">
                      {tier.loads}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <span className="text-sm font-semibold text-[#FFFFFF]">
                      {tier.kw} kW
                    </span>
                    <span className={`text-[9px] px-2 py-0.5 rounded tracking-wider ${tier.badgeColor}`}>
                      {tier.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </HudPanel>
        </div>

        {/* Renewable Pilots & BESS Battery Buffer (Span 5) */}
        <div className="lg:col-span-5 flex flex-col">
          <HudPanel
            tag="// PILOT-01"
            title="Renewable & Energy Storage Experiments"
            subtitle="Polar PV pilot and LiFePO4 battery energy storage system (BESS)"
            status="LIVE"
            hoverEffect={false}
            className="h-full"
          >
            <div className="space-y-4">
              {/* BESS Battery Storage */}
              <div className="p-4 rounded-lg bg-[#06090E]/80 border border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-semibold text-[#FFFFFF]">
                    LiFePO4 BESS Buffer (40 kWh)
                  </span>
                  <span className="font-mono text-xs text-[#10B981] font-bold">92% SOC</span>
                </div>

                <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden border border-white/[0.08] p-[1px] mb-3">
                  <div className="h-full bg-gradient-to-r from-[#38BDF8] to-[#10B981] rounded-full w-[92%]" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[#64748B]">
                  <div>DISCHARGE RATE: <span className="text-[#F8FAFC]">0.0 kW (STANDBY)</span></div>
                  <div>CELL TEMP: <span className="text-[#F8FAFC]">+18.4°C (HEATED)</span></div>
                </div>
              </div>

              {/* Solar Array (Polar Night Status) */}
              <div className="p-4 rounded-lg bg-[#06090E]/80 border border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-semibold text-[#FFFFFF]">
                    10 kW Bifacial Solar Array
                  </span>
                  <span className="font-mono text-[10px] text-[#64748B] px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                    POLAR WINTER DORMANT
                  </span>
                </div>

                <p className="text-xs text-[#94A3B8] font-body leading-relaxed mb-3">
                  Solar elevation is currently below the horizon (-14°). Solar array switches to active generation during the Antarctic summer expedition window (Nov–Feb).
                </p>

                <div className="flex justify-between text-xs font-mono text-[#64748B] pt-2 border-t border-white/[0.06]">
                  <span>CURRENT YIELD: <span className="text-[#F8FAFC]">0.0 kW</span></span>
                  <span>SUMMER PEAK: <span className="text-[#94A3B8]">8.4 kW</span></span>
                </div>
              </div>
            </div>
          </HudPanel>
        </div>

      </section>
    </div>
  );
}
