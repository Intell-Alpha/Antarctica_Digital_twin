"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Cpu,
  SlidersHorizontal,
  Flame,
  Warning,
  CheckCircle,
  ArrowLeft,
  ArrowsClockwise,
  Lightning,
  Waves,
  ShieldCheck,
  Flask,
} from "@phosphor-icons/react";
import { HudPanel } from "@/components/HudPanel";
import { HeartbeatDot } from "@/components/HeartbeatDot";
import { TelemetryValue } from "@/components/TelemetryValue";
import { TopographicBg } from "@/components/TopographicBg";
import { INITIAL_VITALS, STATION_CONSTANTS } from "@/lib/telemetry";

export default function SimulationsPage() {
  const [activeTab, setActiveTab] = useState<"BLIZZARD" | "GEN_TRIP" | "FUEL_MODEL" | "PIPE_FREEZE">("BLIZZARD");

  // Blizzard simulation parameters
  const [stormTemp, setStormTemp] = useState(-38);
  const [stormWind, setStormWind] = useState(72);
  const [stormHours, setStormHours] = useState(24);

  // Generator trip state
  const [isGen1Tripped, setIsGen1Tripped] = useState(false);

  // Fuel scenario
  const [fuelScenario, setFuelScenario] = useState<"MILD" | "AVERAGE" | "SEVERE">("AVERAGE");

  // Calculations for Blizzard Simulation
  const calculatedWindChill = Math.round(
    13.12 +
      0.6215 * stormTemp -
      11.37 * Math.pow(Math.max(stormWind, 5), 0.16) +
      0.3965 * stormTemp * Math.pow(Math.max(stormWind, 5), 0.16)
  );
  const traceHeatRequiredKw = Math.round(
    Math.max(12, 14 + Math.abs(stormTemp) * 0.44 + (stormWind / 30) * 5)
  );
  const projectedTotalFuelBurn = Math.round(
    (410 + Math.abs(stormTemp) * 4.5 + (stormWind / 20) * 7) * (stormHours / 24)
  );
  const stormFreezeHorizonMins = Math.max(
    14,
    Math.round(145 - Math.abs(stormTemp) * 2.2 - stormWind * 0.4)
  );

  // Fuel Autonomy calculations based on scenario
  const fuelBurnRates = {
    MILD: { lpd: 375, days: 225, criticalDate: "15 Oct 2026" },
    AVERAGE: { lpd: 412, days: 142, criticalDate: "18 Aug 2026" },
    SEVERE: { lpd: 540, days: 110, criticalDate: "12 Jul 2026" },
  }[fuelScenario];

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
                  WHAT-IF ENGINE // MONTE CARLO
                </span>
                <HeartbeatDot size="sm" status="LIVE" label="TWIN ENGINE READY" />
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-[#FFFFFF] mt-1">
                Physics Simulation & Counterfactual Studio
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-mono text-xs text-[#64748B]">
            <div className="px-3 py-1.5 rounded-md bg-[#06090E]/80 border border-white/[0.06]">
              MODEL: <span className="text-[#10B981] font-semibold">Thermodynamically Coupled</span>
            </div>
            <div className="px-3 py-1.5 rounded-md bg-[#06090E]/80 border border-white/[0.06]">
              PROVENANCE: <span className="text-[#94A3B8] font-semibold">SIMULATED</span>
            </div>
            <div className="px-3 py-1.5 rounded-md bg-[#06090E]/80 border border-white/[0.06]">
              HORIZON: <span className="text-[#F8FAFC] font-semibold">Winter 2026</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══ SIMULATION WORKSPACE SELECTOR TABS ═══ */}
      <div className="flex items-center gap-2 mb-6 border-b border-white/[0.06] pb-3 relative z-10 overflow-x-auto no-scrollbar">
        {[
          { id: "BLIZZARD", label: "Katabatic Blizzard Stress Test" },
          { id: "GEN_TRIP", label: "Generator Trip & Load Shedding" },
          { id: "FUEL_MODEL", label: "Fuel Burn & Winter Autonomy" },
          { id: "PIPE_FREEZE", label: "Pipeline Freeze Horizon Engine" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-md font-mono text-xs tracking-wider uppercase transition-all whitespace-nowrap border ${
              activeTab === tab.id
                ? "bg-white/[0.08] border-white/25 text-[#FFFFFF] font-semibold shadow-[0_1px_4px_rgba(0,0,0,0.5)]"
                : "bg-white/[0.02] border-white/[0.06] text-[#94A3B8] hover:text-[#FFFFFF] hover:border-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ WORKSPACE 1: KATABATIC BLIZZARD STRESS TEST ═══ */}
      {activeTab === "BLIZZARD" && (
        <section className="relative z-10 space-y-6">
          <HudPanel
            tag="// SIM-BLIZZARD-01"
            title="Monte Carlo Katabatic Storm Physics Engine"
            subtitle="Simulate convection heat loss, electrical peak demand, and fuel consumption under severe polar gales"
            status="LIVE"
            hoverEffect={false}
            className="p-6 md:p-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Controls */}
              <div className="lg:col-span-6 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <span className="text-xs font-mono uppercase text-[#64748B] flex items-center gap-2">
                    <SlidersHorizontal size={14} className="text-[#94A3B8]" />
                    Storm Boundary Parameters
                  </span>
                  <button
                    onClick={() => {
                      setStormTemp(-45);
                      setStormWind(105);
                      setStormHours(48);
                    }}
                    className="text-[10px] font-mono text-[#CBD5E1] hover:text-[#FFFFFF] hover:underline"
                  >
                    Preset: Historical Worst-Case (1996 Gale)
                  </button>
                </div>

                {/* Temp */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#64748B]">Ambient Temperature</span>
                    <span className="text-[#FFFFFF] font-semibold">{stormTemp} °C</span>
                  </div>
                  <input
                    type="range"
                    min={-55}
                    max={0}
                    step={1}
                    value={stormTemp}
                    onChange={(e) => setStormTemp(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#94A3B8]"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[#64748B]">
                    <span>-55°C (Extreme Polar Min)</span>
                    <span>0°C (Summer Melting)</span>
                  </div>
                </div>

                {/* Wind */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#64748B]">Katabatic Wind Velocity</span>
                    <span className="text-[#FFFFFF] font-semibold">{stormWind} knots</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={130}
                    step={1}
                    value={stormWind}
                    onChange={(e) => setStormWind(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#94A3B8]"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[#64748B]">
                    <span>10 kts (Breeze)</span>
                    <span>130 kts (Catastrophic Hurricanic Gale)</span>
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#64748B]">Storm Duration</span>
                    <span className="text-[#FFFFFF] font-semibold">{stormHours} Hours</span>
                  </div>
                  <input
                    type="range"
                    min={6}
                    max={72}
                    step={6}
                    value={stormHours}
                    onChange={(e) => setStormHours(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#94A3B8]"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[#64748B]">
                    <span>6 Hours (Quick Squall)</span>
                    <span>72 Hours (3-Day Multi-System Blizzard)</span>
                  </div>
                </div>
              </div>

              {/* Right Prognosis Results */}
              <div className="lg:col-span-6 space-y-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#64748B] block">
                  Simulated Physical Prognosis
                </span>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-[#06090E]/90 border border-white/[0.06] flex flex-col">
                    <span className="text-[10px] font-mono text-[#64748B] uppercase">Convective Wind Chill</span>
                    <TelemetryValue value={calculatedWindChill} unit="°C" size="lg" isLive={true} />
                    <span className="text-[10px] font-mono text-[#F59E0B] mt-1">Extreme convective cooling</span>
                  </div>

                  <div className="p-4 rounded-lg bg-[#06090E]/90 border border-white/[0.06] flex flex-col">
                    <span className="text-[10px] font-mono text-[#64748B] uppercase">Trace Heat Required</span>
                    <TelemetryValue value={traceHeatRequiredKw} unit="kW" size="lg" isLive={true} />
                    <span className="text-[10px] font-mono text-[#64748B] mt-1">Anti-freeze pipe demand</span>
                  </div>

                  <div className="p-4 rounded-lg bg-[#06090E]/90 border border-white/[0.06] flex flex-col">
                    <span className="text-[10px] font-mono text-[#64748B] uppercase">Event Diesel Burn</span>
                    <TelemetryValue value={projectedTotalFuelBurn} unit="Liters" size="lg" isLive={true} />
                    <span className="text-[10px] font-mono text-[#64748B] mt-1">Over {stormHours}h blizzard</span>
                  </div>

                  <div className="p-4 rounded-lg bg-[#06090E]/90 border border-white/[0.06] flex flex-col">
                    <span className="text-[10px] font-mono text-[#64748B] uppercase">Line Freeze Horizon</span>
                    <TelemetryValue
                      value={stormFreezeHorizonMins}
                      unit="min"
                      size="lg"
                      status={stormFreezeHorizonMins < 45 ? "CRITICAL" : "NORMAL"}
                      isLive={true}
                    />
                    <span className="text-[10px] font-mono text-[#64748B] mt-1">
                      {stormFreezeHorizonMins < 45 ? "DANGER: Pipe freeze risk" : "Safe fluid margin"}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs font-mono text-[#94A3B8]">
                  <span className="text-[#10B981] font-semibold block mb-1">
                    TWIN MITIGATION RECOMMENDATION:
                  </span>
                  Pre-start Generator Surya to standby mode. Pre-heat day tanks 2 hours prior to wind peak. Stage backup trace heat circuit A on manual bypass.
                </div>
              </div>
            </div>
          </HudPanel>
        </section>
      )}

      {/* ═══ WORKSPACE 2: GENERATOR TRIP & LOAD SHEDDING SIMULATOR ═══ */}
      {activeTab === "GEN_TRIP" && (
        <section className="relative z-10 space-y-6">
          <HudPanel
            tag="// SIM-FAILOVER-01"
            title="Generator Trip & Automatic Load Shedding Simulator"
            subtitle="Trigger a sudden electrical trip of the online generator to observe microgrid bus frequency and automated priority shedding"
            status={isGen1Tripped ? "CRITICAL" : "LIVE"}
            hoverEffect={false}
            className="p-6 md:p-8"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg bg-[#06090E]/90 border border-white/[0.06] mb-6 gap-4">
              <div>
                <span className="text-xs font-mono text-[#64748B] uppercase block mb-1">
                  Active Prime Alternator
                </span>
                <h4 className="font-headline text-lg font-semibold text-[#FFFFFF]">
                  {isGen1Tripped ? "GEN-01 (Ravi) TRIPPED — FAULT CONDITION" : "GEN-01 (Ravi) ONLINE — 44.8 kW LOAD"}
                </h4>
              </div>

              <button
                onClick={() => setIsGen1Tripped(!isGen1Tripped)}
                className={`px-5 py-2.5 rounded-md font-mono text-xs tracking-wider uppercase font-semibold transition-all border ${
                  isGen1Tripped
                    ? "bg-[#10B981] text-black border-[#10B981] hover:bg-[#10B981]/90 shadow-[0_0_16px_rgba(16,185,129,0.3)]"
                    : "bg-[#EF4444] text-white border-[#EF4444] hover:bg-[#EF4444]/90 shadow-[0_0_16px_rgba(239,68,68,0.3)]"
                }`}
              >
                {isGen1Tripped ? "Clear Fault & Reset" : "Simulate Sudden Trip of Gen-01"}
              </button>
            </div>

            {/* Sequence of events */}
            <div className="space-y-3 font-mono text-xs">
              <span className="text-[10px] text-[#64748B] uppercase tracking-widest block mb-2">
                AUTOMATED PLC LOAD SHEDDING SEQUENCE
              </span>

              {[
                {
                  time: "T+0.00s",
                  event: "Generator Ravi circuit breaker opens on overcurrent / mechanical fault.",
                  state: isGen1Tripped ? "TRIGGERED" : "NOMINAL",
                  badge: isGen1Tripped ? "bg-[#EF4444]/15 text-[#FCA5A5] border border-[#EF4444]/30" : "bg-white/[0.04] text-[#64748B] border border-white/[0.06]",
                },
                {
                  time: "T+0.12s",
                  event: "Tier 4 (Auxiliary workshop & vehicle heaters: 4.2 kW) instantly shed by PLC contactor.",
                  state: isGen1Tripped ? "SHED COMPLETE" : "STANDBY",
                  badge: isGen1Tripped ? "bg-[#10B981]/15 text-[#6EE7B7] border border-[#10B981]/30" : "bg-white/[0.04] text-[#64748B] border border-white/[0.06]",
                },
                {
                  time: "T+0.45s",
                  event: "Tier 3 (Domestic comfort heaters & galley cooktop: 9.0 kW) shed to protect bus voltage.",
                  state: isGen1Tripped ? "SHED COMPLETE" : "STANDBY",
                  badge: isGen1Tripped ? "bg-[#10B981]/15 text-[#6EE7B7] border border-[#10B981]/30" : "bg-white/[0.04] text-[#64748B] border border-white/[0.06]",
                },
                {
                  time: "T+1.20s",
                  event: "LiFePO4 BESS Battery Buffer seamlessly bridges Tier 1 & Tier 2 life-critical loads.",
                  state: isGen1Tripped ? "BATTERY DISCHARGE ACTIVE" : "STANDBY",
                  badge: isGen1Tripped ? "bg-white/[0.08] text-[#E2E8F0] border border-white/20" : "bg-white/[0.04] text-[#64748B] border border-white/[0.06]",
                },
                {
                  time: "T+15.0s",
                  event: "Automated starter engages Generator Surya (Gen-02). Synchronized to bus at T+24s.",
                  state: isGen1Tripped ? "SURYA ONLINE & TAKING LOAD" : "STANDBY",
                  badge: isGen1Tripped ? "bg-[#10B981]/15 text-[#6EE7B7] border border-[#10B981]/30" : "bg-white/[0.04] text-[#64748B] border border-white/[0.06]",
                },
              ].map((s) => (
                <div
                  key={s.time}
                  className="p-3.5 rounded-lg bg-[#06090E]/80 border border-white/[0.06] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#FFFFFF]">{s.time}</span>
                    <span className="text-[#F8FAFC]">{s.event}</span>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold tracking-wider ${s.badge}`}>
                    {s.state}
                  </span>
                </div>
              ))}
            </div>
          </HudPanel>
        </section>
      )}

      {/* ═══ WORKSPACE 3: FUEL BURN & WINTER AUTONOMY ═══ */}
      {activeTab === "FUEL_MODEL" && (
        <section className="relative z-10 space-y-6">
          <HudPanel
            tag="// SIM-FUEL-01"
            title="Winter Fuel Autonomy Projection Model"
            subtitle="Correlate remaining Jet A-1 fuel stockpiles against varying seasonal climate severity scenarios"
            status="LIVE"
            hoverEffect={false}
            className="p-6 md:p-8"
          >
            {/* Scenario Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {(["MILD", "AVERAGE", "SEVERE"] as const).map((scen) => (
                <button
                  key={scen}
                  onClick={() => setFuelScenario(scen)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    fuelScenario === scen
                      ? "bg-[#0E1626] border-white/30 shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
                      : "bg-[#070B12] border-white/[0.06] hover:border-white/15 hover:bg-[#0B101A]"
                  }`}
                >
                  <span className="text-[10px] font-mono uppercase text-[#64748B] block mb-1">
                    Scenario Model
                  </span>
                  <h4 className="font-headline text-sm font-semibold text-[#FFFFFF] mb-2">
                    {scen === "MILD" && "Mild Winter (Avg -20°C, 35 kts)"}
                    {scen === "AVERAGE" && "Historical Baseline (Avg -28°C, 48 kts)"}
                    {scen === "SEVERE" && "Severe Winter (Avg -38°C, 68 kts)"}
                  </h4>
                  <div className="font-mono text-xs text-[#94A3B8]">
                    Burn: {scen === "MILD" ? "375 L/d" : scen === "AVERAGE" ? "412 L/d" : "540 L/d"}
                  </div>
                </button>
              ))}
            </div>

            {/* Scenario Prognosis Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-lg bg-[#06090E]/90 border border-white/[0.06] mb-6">
              <div>
                <span className="text-[10px] font-mono text-[#64748B] uppercase block mb-1">
                  Projected Autonomy
                </span>
                <TelemetryValue value={fuelBurnRates.days} unit="Days" size="lg" isLive={true} />
                <span className="text-[10px] font-mono text-[#10B981] block mt-1">
                  At {fuelBurnRates.lpd} L/day burn rate
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-[#64748B] uppercase block mb-1">
                  30-Day Critical Threshold
                </span>
                <div className="font-mono text-xl font-bold text-[#FFFFFF] mt-1">
                  {fuelBurnRates.criticalDate}
                </div>
                <span className="text-[10px] font-mono text-[#64748B] block mt-1">
                  Reserve safety floor
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-[#64748B] uppercase block mb-1">
                  Resupply Ship Arrival Window
                </span>
                <div className="font-mono text-xl font-bold text-[#FFFFFF] mt-1">
                  28 Nov 2026
                </div>
                <span className="text-[10px] font-mono text-[#10B981] block mt-1">
                  {fuelBurnRates.days > 214 ? "SUFFICIENT FUEL AUTONOMY" : "DEFICIT PREVENTED VIA RATIONING"}
                </span>
              </div>
            </div>
          </HudPanel>
        </section>
      )}

      {/* ═══ WORKSPACE 4: PIPELINE FREEZE HORIZON ENGINE ═══ */}
      {activeTab === "PIPE_FREEZE" && (
        <section className="relative z-10 space-y-6">
          <HudPanel
            tag="// SIM-FREEZE-01"
            title="Priyadarshini Heated Pipeline Thermal Decay Simulator"
            subtitle="Thermodynamic model calculating time-to-solid-freeze under trace-heating loss"
            status="LIVE"
            hoverEffect={false}
            className="p-6 md:p-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center mb-6">
              <div className="p-4 rounded-lg bg-[#06090E]/90 border border-white/[0.06] space-y-3">
                <span className="text-xs font-mono text-[#64748B] uppercase block">
                  THERMAL DECAY CONSTANTS (2.5 KM STEEL JACKET)
                </span>
                <div className="flex justify-between font-mono text-xs text-[#64748B] py-1.5 border-b border-white/[0.06]">
                  <span>PIPE DIAMETER / WALL:</span>
                  <span className="text-[#F8FAFC]">DN80 (3-inch) / 4.5mm Polyurethane foam</span>
                </div>
                <div className="flex justify-between font-mono text-xs text-[#64748B] py-1.5 border-b border-white/[0.06]">
                  <span>HEAT TRANSFER COEFF (U):</span>
                  <span className="text-[#F8FAFC]">0.28 W/(m²·K)</span>
                </div>
                <div className="flex justify-between font-mono text-xs text-[#64748B] py-1.5">
                  <span>CONVECTIVE ACCELERATION:</span>
                  <span className="text-[#F59E0B]">+1.8% cooling per 5 kts wind increase</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#06090E]/90 border border-white/[0.06] flex flex-col justify-between h-full">
                <div>
                  <span className="text-[10px] font-mono text-[#64748B] uppercase block mb-1">
                    Emergency Glycol Backflush Protocol
                  </span>
                  <p className="text-xs text-[#94A3B8] font-body leading-relaxed">
                    If trace heating is cut and freeze horizon drops below 25 minutes, the emergency pneumatic valve injects food-grade propylene glycol from the 500 L holding tank to depress the freezing point to -30°C.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#64748B]">GLYCOL TANK LEVEL:</span>
                  <span className="text-[#10B981] font-bold">500 L (100% READY)</span>
                </div>
              </div>
            </div>
          </HudPanel>
        </section>
      )}
    </div>
  );
}
