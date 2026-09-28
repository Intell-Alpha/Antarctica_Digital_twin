"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Package,
  GasPump,
  CalendarCheck,
  ShieldCheck,
  ArrowLeft,
  Warning,
  FirstAid,
  ForkKnife,
  Wrench,
  CheckCircle,
} from "@phosphor-icons/react";
import { HudPanel } from "@/components/HudPanel";
import { HeartbeatDot } from "@/components/HeartbeatDot";
import { TelemetryValue } from "@/components/TelemetryValue";
import { TopographicBg } from "@/components/TopographicBg";
import { STATION_CONSTANTS } from "@/lib/telemetry";

const TANKS = [
  { id: "TANK-01", cap: 25000, current: 21400, temp: -12.4, status: "ACTIVE TRANSFER", isHeated: false },
  { id: "TANK-02", cap: 25000, current: 20800, temp: -14.1, status: "STANDBY RESERVE", isHeated: false },
  { id: "TANK-03", cap: 35000, current: 24100, temp: -15.0, status: "BULK STORAGE", isHeated: false },
  { id: "TANK-04", cap: 35000, current: 18320, temp: -15.2, status: "BULK STORAGE", isHeated: false },
  { id: "DAY-TANK", cap: 2000,  current: 1760,  temp: +14.2, status: "FEEDING GEN-01", isHeated: true },
];

const CRITICAL_SPARES = [
  { part: "Kirloskar Fuel Injector Assemblies", qty: 4, minReq: 2, tier: "TIER 1 (CRITICAL)", leadTime: "9 Months" },
  { part: "Automatic Voltage Regulator (AVR) Boards", qty: 2, minReq: 1, tier: "TIER 1 (CRITICAL)", leadTime: "9 Months" },
  { part: "Trace-Heat Cable Splice & Junction Kits", qty: 6, minReq: 3, tier: "TIER 1 (CRITICAL)", leadTime: "9 Months" },
  { part: "Submersible Lake Pump Impeller & Seals", qty: 2, minReq: 1, tier: "TIER 2 (ESSENTIAL)", leadTime: "9 Months" },
  { part: "Satellite Modem Transceiver Block Upconverter", qty: 1, minReq: 1, tier: "TIER 2 (ESSENTIAL)", leadTime: "9 Months" },
];

export default function LogisticsPage() {
  const [selectedTank, setSelectedTank] = useState(0);
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
                  DOMAIN // 03
                </span>
                <HeartbeatDot size="sm" status="LIVE" label="AUTONOMY SECURE" />
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-[#FFFFFF] mt-1">
                Logistics, Fuel Depot & Winter Autonomy
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-mono text-xs text-[#64748B]">
            <div className="px-3 py-1.5 rounded-md bg-[#06090E]/80 border border-white/[0.06]">
              USABLE JET A-1: <span className="text-[#10B981] font-semibold">84,620 L</span>
            </div>
            <div className="px-3 py-1.5 rounded-md bg-[#06090E]/80 border border-white/[0.06]">
              AUTONOMY: <span className="text-[#F8FAFC] font-semibold">142 Days Remaining</span>
            </div>
            <div className="px-3 py-1.5 rounded-md bg-[#06090E]/80 border border-white/[0.06]">
              NEXT VESSEL: <span className="text-[#94A3B8] font-semibold">T-214 Days</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══ SECTION 1: BULK FUEL FARM & JET A-1 TELEMETRY ═══ */}
      <section className="mb-8 relative z-10">
        <HudPanel
          tag="// FUEL-FARM-01"
          title="Arctic Fuel Depot & Storage Autonomy"
          subtitle="Jet A-1 (Aviation Turbine Fuel - Polar Blend with anti-icing additive) storage in double-walled insulated tanks"
          status="LIVE"
          hoverEffect={false}
          className="p-6 md:p-8"
        >
          {/* Top Vitals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-[#06090E]/90 border border-white/[0.06] mb-6">
            <div>
              <span className="text-[10px] font-mono text-[#64748B] uppercase block mb-1">
                Current Usable Fuel
              </span>
              <TelemetryValue value={84620} unit="L" size="md" isLive={true} />
              <span className="text-[9px] font-mono text-[#64748B] block mt-0.5">
                70.5% of 120,000 L capacity
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono text-[#64748B] uppercase block mb-1">
                Calculated Autonomy
              </span>
              <TelemetryValue value={142} unit="Days" size="md" isLive={true} />
              <span className="text-[9px] font-mono text-[#10B981] block mt-0.5">
                Target: &gt; 90 days reserve
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono text-[#64748B] uppercase block mb-1">
                Daily Burn Rate
              </span>
              <TelemetryValue value={412} unit="L/day" size="md" isLive={true} />
              <span className="text-[9px] font-mono text-[#64748B] block mt-0.5">
                Station load: 44.8 kW
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono text-[#64748B] uppercase block mb-1">
                Fuel Cloud Point
              </span>
              <TelemetryValue value={-51.0} unit="°C" size="md" isLive={false} />
              <span className="text-[9px] font-mono text-[#10B981] block mt-0.5">
                Margin: 22.6°C safe from freeze
              </span>
            </div>
          </div>

          {/* Tanks Individual Layout */}
          <div className="mb-4">
            <span className="text-xs font-mono text-[#64748B] uppercase tracking-wider block mb-3">
              INDIVIDUAL TANK INVENTORY & THERMAL LEVELS
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {TANKS.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTank(idx)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    selectedTank === idx
                      ? "bg-[#0E1626] border-white/30 shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
                      : "bg-[#070B12] border-white/[0.06] hover:border-white/15 hover:bg-[#0B101A]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-semibold text-[#FFFFFF]">{t.id}</span>
                    <span className="text-[9px] font-mono text-[#94A3B8]">
                      {Math.round((t.current / t.cap) * 100)}%
                    </span>
                  </div>

                  {/* Tank Level Bar */}
                  <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden border border-white/[0.08] p-[1px] mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-[#38BDF8] to-[#10B981] rounded-full"
                      style={{ width: `${(t.current / t.cap) * 100}%` }}
                    />
                  </div>

                  <div className="text-[10px] font-mono text-[#64748B] space-y-0.5">
                    <div>VOL: <span className="text-[#F8FAFC]">{t.current.toLocaleString()} L</span></div>
                    <div>TEMP: <span className="text-[#94A3B8]">{t.temp}°C</span></div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </HudPanel>
      </section>

      {/* ═══ SECTION 2: RESUPPLY WINDOW & EXPEDITION TIMELINE ═══ */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 relative z-10">
        {/* Resupply Vessel Timeline */}
        <HudPanel
          tag="// EXPEDITION-44"
          title="Indian Antarctic Expedition (IAE-44) Resupply Window"
          subtitle="Annual logistics corridor dictated by polar pack ice dynamics"
          status="LIVE"
          hoverEffect={false}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-[#06090E]/90 border border-white/[0.06]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-[#64748B] uppercase">Next Scheduled Vessel</span>
                <span className="text-xs font-mono text-[#10B981] font-semibold">ETA: 28 NOV 2026</span>
              </div>
              <h4 className="font-headline text-lg font-semibold text-[#FFFFFF]">
                MV Vasiliy Golovnin (Chartered Polar Vessel)
              </h4>
              <p className="text-xs text-[#94A3B8] font-body mt-2 leading-relaxed">
                Discharges bulk Jet A-1 fuel via offshore helicopter sling and barge at India Bay ice shelf (70 km north of Maitri), transported via PistenBully heavy snow convoys across continental ice shelf.
              </p>
            </div>

            <div className="space-y-2 font-mono text-xs text-[#64748B]">
              <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                <span>ISOLATION STATUS:</span>
                <span className="text-[#F59E0B] font-semibold">COMPLETE WINTER SHUTDOWN</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                <span>EMERGENCY AIR EVACUATION:</span>
                <span className="text-[#64748B]">UNAVAILABLE (POLAR NIGHT & SEA ICE)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span>SUMMER WINDOW DURATION:</span>
                <span className="text-[#F8FAFC]">75 Days (Dec 1 – Feb 15)</span>
              </div>
            </div>
          </div>
        </HudPanel>

        {/* Food & Medical Stockpiles */}
        <HudPanel
          tag="// RATIONS-01"
          title="Critical Consumables & Survival Buffers"
          subtitle="Calculated reserves strictly exceeding Antarctic wintering survival requirements"
          status="LIVE"
          hoverEffect={false}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-[#06090E]/90 border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#64748B] uppercase block">
                  Food Reserve Autonomy
                </span>
                <TelemetryValue value={180} unit="Days" size="lg" isLive={false} />
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-[#64748B] uppercase block">
                  Safety Margin
                </span>
                <span className="font-mono text-sm font-semibold text-[#10B981]">+38 Days Above Winter</span>
              </div>
            </div>

            <div className="space-y-2 font-mono text-xs text-[#64748B]">
              <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                <span>FREEZE-DRIED RATIONS:</span>
                <span className="text-[#F8FAFC]">4,200 kg (A-Grade Store)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                <span>MEDICAL SURGERY SUITE:</span>
                <span className="text-[#10B981] font-semibold">100% OPERATIONAL (1 DOCTOR)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span>POTABLE WATER RESERVE:</span>
                <span className="text-[#F8FAFC]">8,400 L (~9 Days At Current Ration)</span>
              </div>
            </div>
          </div>
        </HudPanel>
      </section>

      {/* ═══ SECTION 3: CRITICAL SPARES INVENTORY MATRIX ═══ */}
      <section className="mb-8 relative z-10">
        <HudPanel
          tag="// SPARES-01"
          title="Critical Mission Spares Inventory & Lead Times"
          subtitle="9-month mainland replacement lead time necessitates strict minimum safety inventory thresholds"
          status="LIVE"
          hoverEffect={false}
        >
          <div className="rounded-lg border border-white/[0.06] overflow-hidden bg-[#06090E]/80">
            <div className="divide-y divide-white/[0.06] font-mono text-xs">
              <div className="p-3 flex items-center justify-between text-[#64748B] text-[10px] uppercase">
                <span>Spare Component</span>
                <span>In Stock</span>
                <span>Minimum Required</span>
                <span>Classification</span>
                <span>Lead Time</span>
              </div>
              {CRITICAL_SPARES.map((s) => (
                <div key={s.part} className="p-3.5 flex items-center justify-between">
                  <span className="text-[#FFFFFF] font-medium">{s.part}</span>
                  <span className="text-[#F8FAFC] font-semibold">{s.qty} units</span>
                  <span className="text-[#64748B]">{s.minReq} min</span>
                  <span className="text-[#10B981] text-[10px] font-semibold px-2 py-0.5 rounded bg-[#10B981]/10 border border-[#10B981]/20">
                    {s.tier}
                  </span>
                  <span className="text-[#64748B] text-[10px]">{s.leadTime}</span>
                </div>
              ))}
            </div>
          </div>
        </HudPanel>
      </section>
    </div>
  );
}
