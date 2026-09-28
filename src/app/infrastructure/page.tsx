"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  MapTrifold,
  Waves,
  Thermometer,
  Warning,
  CheckCircle,
  ArrowLeft,
  Flame,
  House,
  SlidersHorizontal,
  Drop,
} from "@phosphor-icons/react";
import { HudPanel } from "@/components/HudPanel";
import { HeartbeatDot } from "@/components/HeartbeatDot";
import { TelemetryValue } from "@/components/TelemetryValue";
import { TopographicBg } from "@/components/TopographicBg";
import { STATION_CONSTANTS, INITIAL_VITALS } from "@/lib/telemetry";

const PIPELINE_NODES = [
  { km: "0.0 km", name: "Lake Submersible Pump", temp: "+1.4°C", status: "NOMINAL", heaterKw: "0.0" },
  { km: "0.8 km", name: "Ridge Elevation Point", temp: "+3.8°C", status: "NOMINAL", heaterKw: "6.2" },
  { km: "1.6 km", name: "Junction Box BJ-04", temp: "+4.1°C", status: "WATCH", heaterKw: "4.8" },
  { km: "2.5 km", name: "Station Boiler Header", temp: "+8.4°C", status: "NOMINAL", heaterKw: "7.4" },
];

const HABITAT_ZONES = [
  { name: "Living Quarters (A-Block)", temp: 21.2, rh: 38, co2: 460, status: "NOMINAL" },
  { name: "Galley & Crew Mess", temp: 20.8, rh: 42, co2: 510, status: "NOMINAL" },
  { name: "Atmospheric & Magnetics Lab", temp: 19.5, rh: 32, co2: 440, status: "NOMINAL" },
  { name: "Main Powerhouse & Workshop", temp: 16.4, rh: 28, co2: 470, status: "NOMINAL" },
];

export default function InfrastructurePage() {
  const [selectedPipeNode, setSelectedPipeNode] = useState(2);
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
                  DOMAIN // 01
                </span>
                <HeartbeatDot size="sm" status="WATCH" label="TRACE HEAT CIRCUIT WATCH" />
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-[#FFFFFF] mt-1">
                Infrastructure & Life Support
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-mono text-xs text-[#64748B]">
            <div className="px-3 py-1.5 rounded-md bg-[#06090E]/80 border border-white/[0.06]">
              SOURCE: <span className="text-[#F8FAFC] font-semibold">Lake Priyadarshini</span>
            </div>
            <div className="px-3 py-1.5 rounded-md bg-[#06090E]/80 border border-white/[0.06]">
              CONDUIT: <span className="text-[#F8FAFC] font-semibold">2.5 km Heated</span>
            </div>
            <div className="px-3 py-1.5 rounded-md bg-[#06090E]/80 border border-white/[0.06]">
              HABITAT: <span className="text-[#10B981] font-semibold">23 Winter Crew</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══ SECTION 1: PRIYADARSHINI WATER INTAKE & TRACE-HEATED PIPELINE ═══ */}
      <section className="mb-8 relative z-10">
        <HudPanel
          tag="// LIFE-01"
          title="Lake Priyadarshini Freshwater Pipeline & Trace Heating"
          subtitle="2.5 km heated intake line preventing freezing at -40°C ambient through twin redundant heat-trace elements"
          status="WATCH"
          hoverEffect={false}
          className="p-6 md:p-8"
        >
          {/* Top Telemetry Numbers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-[#06090E]/90 border border-white/[0.06] mb-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-[#64748B] uppercase">Intake Temp</span>
              <TelemetryValue value={1.4} unit="°C" size="md" isLive={true} />
              <span className="text-[9px] font-mono text-[#64748B] mt-0.5">Lake bottom sensor</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-[#64748B] uppercase">Pumping Flow Rate</span>
              <TelemetryValue value={620} unit="L/h" size="md" isLive={true} />
              <span className="text-[9px] font-mono text-[#64748B] mt-0.5">Pump #1 online</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-[#64748B] uppercase">Trace Heat Load</span>
              <TelemetryValue value={18.4} unit="kW" size="md" status="WATCH" isLive={true} />
              <span className="text-[9px] font-mono text-[#F59E0B] mt-0.5">Circuit B -12% draw</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-[#64748B] uppercase">Buffer Storage</span>
              <TelemetryValue value={8400} unit="L" size="md" isLive={true} />
              <span className="text-[9px] font-mono text-[#10B981] mt-0.5">8.9 days reserve</span>
            </div>
          </div>

          {/* Interactive Pipeline Nodes */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3 text-xs font-mono text-[#64748B]">
              <span className="tracking-wider uppercase">Pipeline Sensor Nodes (2.5 km Span)</span>
              <span>Click node to inspect convective state</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {PIPELINE_NODES.map((node, i) => (
                <button
                  key={node.km}
                  onClick={() => setSelectedPipeNode(i)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    selectedPipeNode === i
                      ? "bg-[#0E1626] border-white/30 shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
                      : "bg-[#070B12] border-white/[0.06] hover:border-white/15 hover:bg-[#0B101A]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase text-[#64748B]">{node.km}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                        node.status === "WATCH"
                          ? "bg-[#F59E0B]/15 text-[#FCD34D] border-[#F59E0B]/30"
                          : "bg-[#10B981]/15 text-[#6EE7B7] border-[#10B981]/30"
                      }`}
                    >
                      {node.status}
                    </span>
                  </div>
                  <h4 className="font-headline text-sm font-semibold text-[#FFFFFF] mb-1">
                    {node.name}
                  </h4>
                  <div className="flex items-baseline justify-between mt-2 font-mono text-xs">
                    <span className="text-[#64748B]">Water Temp:</span>
                    <span className="text-[#F8FAFC] font-semibold">{node.temp}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Trace Heating Circuit Table */}
          <div className="rounded-lg border border-white/[0.06] overflow-hidden bg-[#06090E]/80">
            <div className="p-3 border-b border-white/[0.06] font-mono text-xs font-semibold text-[#FFFFFF] flex items-center justify-between">
              <span>TRACE HEATING ELECTRICAL ALLOCATION (415V BUS C)</span>
              <span className="text-[#64748B] font-normal text-[10px]">PARALLEL CONSTANT-WATTAGE CABLE</span>
            </div>

            <div className="divide-y divide-white/[0.06] font-mono text-xs">
              <div className="p-3 flex items-center justify-between text-[#64748B] text-[10px] uppercase">
                <span>Circuit</span>
                <span>Coverage</span>
                <span>Current Draw</span>
                <span>Baseline</span>
                <span>Status</span>
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="text-[#FFFFFF] font-medium">Circuit A (Primary Trace)</span>
                <span className="text-[#94A3B8]">0.0 – 2.5 km (Full length)</span>
                <span className="text-[#F8FAFC] font-semibold">8.1 A</span>
                <span className="text-[#64748B]">8.0 A nominal</span>
                <span className="text-[#10B981] text-[10px] font-semibold">NOMINAL</span>
              </div>
              <div className="p-3 flex items-center justify-between bg-[#F59E0B]/[0.03]">
                <span className="text-[#FBBF24] font-medium">Circuit B (Secondary Trace)</span>
                <span className="text-[#94A3B8]">1.0 – 2.5 km (Exposed Ridge)</span>
                <span className="text-[#FBBF24] font-semibold">6.2 A</span>
                <span className="text-[#64748B]">8.0 A nominal (-22%)</span>
                <span className="text-[#F59E0B] text-[10px] font-semibold">WATCH (INSPECT BJ-04)</span>
              </div>
            </div>
          </div>
        </HudPanel>
      </section>

      {/* ═══ SECTION 2: BIOLOGICAL DIGESTION & ANTARCTIC TREATY WASTE COMPLIANCE ═══ */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 relative z-10">
        {/* Waste Subsystem 1: Biological Anaerobic Digester */}
        <HudPanel
          tag="// BIO-01"
          title="Anaerobic Biological Digester"
          subtitle="Mesophilic waste digestion operating continuously under sealed thermal blanket"
          status="LIVE"
          hoverEffect={false}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-[#06090E]/90 border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#64748B] uppercase block">
                  Bacterial Chamber Temp
                </span>
                <TelemetryValue value={36.8} unit="°C" size="lg" isLive={true} />
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-[#64748B] uppercase block">
                  Optimal Target
                </span>
                <span className="font-mono text-sm font-semibold text-[#10B981]">37.0°C ± 1.0</span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono text-[#64748B]">
              <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                <span>METHANE PRESSURE:</span>
                <span className="text-[#F8FAFC]">14.2 kPa (VENTED)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                <span>BIOMASS RETENTION TIME:</span>
                <span className="text-[#F8FAFC]">28 Days</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span>EFFLUENT PURITY:</span>
                <span className="text-[#10B981] font-semibold">BOD &lt; 15 mg/L (COMPLIANT)</span>
              </div>
            </div>
          </div>
        </HudPanel>

        {/* Waste Subsystem 2: Incinerator & Treaty Protocol */}
        <HudPanel
          tag="// TREATY-01"
          title="Waste Incineration & Treaty Compliance"
          subtitle="Madrid Protocol on Environmental Protection — 100% ash containment and mainland retrograde"
          status="LIVE"
          hoverEffect={false}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-[#06090E]/90 border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#64748B] uppercase block">
                  Total Retained Ash
                </span>
                <TelemetryValue value={42.5} unit="kg" size="lg" isLive={true} />
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-[#64748B] uppercase block">
                  Vessel Retrograde
                </span>
                <span className="font-mono text-sm font-semibold text-[#F8FAFC]">Nov 2026</span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono text-[#64748B]">
              <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                <span>PRIMARY CHAMBER TEMP:</span>
                <span className="text-[#F8FAFC]">860°C (DORMANT)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                <span>SECONDARY BURNER:</span>
                <span className="text-[#F8FAFC]">1,050°C (DIESEL FIRED)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span>CONTAINMENT DRUMS:</span>
                <span className="text-[#F8FAFC]">4 Sealed Steel Units</span>
              </div>
            </div>
          </div>
        </HudPanel>
      </section>

      {/* ═══ SECTION 3: HABITAT MODULE HVAC ZONES ═══ */}
      <section className="mb-8 relative z-10">
        <HudPanel
          tag="// HVAC-01"
          title="Station Module Climate & Air Quality Zoning"
          subtitle="Four independent air circulation zones with hydronic radiator heating and CO2 scrubbing"
          status="LIVE"
          hoverEffect={false}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HABITAT_ZONES.map((zone) => (
              <div
                key={zone.name}
                className="p-4 rounded-lg bg-[#070B12] border border-white/[0.06] flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#10B981] font-medium block mb-1">
                    {zone.status}
                  </span>
                  <h4 className="font-headline text-sm font-semibold text-[#FFFFFF] mb-3">
                    {zone.name}
                  </h4>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Temp:</span>
                    <span className="text-[#F8FAFC] font-semibold">+{zone.temp}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Humidity:</span>
                    <span className="text-[#94A3B8]">{zone.rh}% RH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">CO2:</span>
                    <span className="text-[#10B981]">{zone.co2} ppm</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </HudPanel>
      </section>
    </div>
  );
}
