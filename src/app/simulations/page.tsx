"use client";

import { useState, useEffect } from "react";
import { DoubleBezel } from "@/components/DoubleBezel";
import { motion } from "framer-motion";
import { Graph, Warning, CheckCircle, ArrowClockwise, ShieldWarning, Lightning, Wind, Package, WifiSlash } from "@phosphor-icons/react";
import Link from "next/link";
import { fetchApi } from "@/lib/api-client";

interface SimulationData {
  scenarioId: string;
  scenarioName: string;
  baseline: {
    powerDemandKw: number;
    fuelConsumptionDayL: number;
    fuelAutonomyDays: number;
    survivabilityScore: number;
    stationHealth: string;
  };
  simulated: {
    powerDemandKw: number;
    fuelConsumptionDayL: number;
    fuelAutonomyDays: number;
    survivabilityScore: number;
    stationHealth: string;
    criticalAlerts: string[];
    recommendedActions: string[];
  };
}

const SCENARIOS = [
  { id: "EXTREME_WEATHER", name: "Scenario A — Extreme Katabatic Storm & Temperature Drop (-40°C)", icon: Wind },
  { id: "GENERATOR_FAILURE", name: "Scenario B — Primary Generator Trip / Failure", icon: Lightning },
  { id: "INCREASED_ENERGY_DEMAND", name: "Scenario C — Peak Scientific Campaign (+40% Power Load)", icon: Graph },
  { id: "SUPPLY_DELAY", name: "Scenario D — Austral Summer Sea-Ice Blockade (60-day delay)", icon: Package },
  { id: "COMMUNICATION_OUTAGE", name: "Scenario E — Orbital Satellite Link Interruption (Edge Sync)", icon: WifiSlash },
];

export default function SimulationsPage() {
  const [stationId, setStationId] = useState<"BHARATI" | "MAITRI">("BHARATI");
  const [activeScenario, setActiveScenario] = useState("EXTREME_WEATHER");
  const [simResult, setSimResult] = useState<SimulationData | null>(null);
  const [loading, setLoading] = useState(false);

  const runScenario = async (scId: string) => {
    setLoading(true);
    try {
      const data = await fetchApi<{ success: boolean; simulation: SimulationData }>("/api/simulation", {
        method: "POST",
        body: JSON.stringify({ stationId, scenarioId: scId })
      });
      if (data.success) {
        setSimResult(data.simulation);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runScenario(activeScenario);
  }, [stationId, activeScenario]);

  return (
    <main className="min-h-[100dvh] w-full bg-[#020305] text-white p-4 md:p-8 pt-28 md:pt-36 relative">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-8">
        
        {/* HEADER & STATION SELECTOR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0a0d14]/60 backdrop-blur-xl border border-white/[0.08] p-6 rounded-2xl">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">
                <Graph size={28} weight="light" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">What-If Simulation Engine</h1>
                <p className="text-xs font-mono text-zinc-400">Counterfactual Risk Projection & Decision Support</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-black/60 p-1.5 rounded-xl border border-white/10">
            <button
              onClick={() => setStationId("BHARATI")}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${stationId === "BHARATI" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_12px_rgba(34,211,238,0.3)]" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              BHARATI STATION (2012)
            </button>
            <button
              onClick={() => setStationId("MAITRI")}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${stationId === "MAITRI" ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              MAITRI STATION (1989)
            </button>
          </div>
        </div>

        {/* SCENARIO SELECTION GRID */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {SCENARIOS.map((sc) => {
            const Icon = sc.icon;
            const isSelected = activeScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => setActiveScenario(sc.id)}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-4 transition-all duration-300 ${isSelected ? "bg-fuchsia-500/10 border-fuchsia-500/40 text-white shadow-[0_0_20px_rgba(217,70,239,0.2)]" : "bg-[#0a0d14]/40 border-white/5 text-zinc-400 hover:border-white/20"}`}
              >
                <div className={`p-2 rounded-lg w-fit ${isSelected ? "bg-fuchsia-500/20 text-fuchsia-400" : "bg-white/5 text-zinc-500"}`}>
                  <Icon size={20} />
                </div>
                <span className="text-xs font-mono font-bold leading-snug">{sc.name}</span>
              </button>
            );
          })}
        </div>

        {/* COMPARISON RESULTS */}
        {simResult && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* BASELINE VS SIMULATED METRICS */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              <DoubleBezel innerClassName="p-8 bg-[#0a0d14]/70 backdrop-blur-xl flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-base font-bold font-mono text-fuchsia-400 uppercase tracking-widest flex items-center gap-2">
                    <Graph size={18} />
                    {simResult.scenarioName}
                  </h3>
                  {loading && <ArrowClockwise size={18} className="animate-spin text-fuchsia-400" />}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* BASELINE CARD */}
                  <div className="bg-[#050608] border border-white/10 rounded-2xl p-6 flex flex-col justify-between gap-6">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-zinc-500 tracking-widest uppercase">BASELINE STATE</span>
                      <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {simResult.baseline.stationHealth}
                      </span>
                    </div>

                    <div className="space-y-4 font-mono">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Power Load</span>
                        <span className="text-2xl font-bold text-white">{simResult.baseline.powerDemandKw} kW</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Daily Fuel Consumption</span>
                        <span className="text-2xl font-bold text-white">{simResult.baseline.fuelConsumptionDayL} L/day</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Fuel Autonomy</span>
                        <span className="text-2xl font-bold text-white">{simResult.baseline.fuelAutonomyDays} Days</span>
                      </div>
                    </div>
                  </div>

                  {/* SIMULATED CARD */}
                  <div className="bg-[#08050c] border border-fuchsia-500/30 rounded-2xl p-6 flex flex-col justify-between gap-6 relative overflow-hidden shadow-[inset_0_0_30px_rgba(217,70,239,0.1)]">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-fuchsia-400 tracking-widest uppercase">PROJECTED IMPACT</span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold ${simResult.simulated.stationHealth === 'NORMAL' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'}`}>
                        {simResult.simulated.stationHealth}
                      </span>
                    </div>

                    <div className="space-y-4 font-mono">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Simulated Power Load</span>
                        <span className="text-2xl font-bold text-fuchsia-300 flex items-center gap-2">
                          {simResult.simulated.powerDemandKw} kW
                          <span className="text-xs text-rose-400 font-normal">
                            ({simResult.simulated.powerDemandKw >= simResult.baseline.powerDemandKw ? '+' : ''}{simResult.simulated.powerDemandKw - simResult.baseline.powerDemandKw} kW)
                          </span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Simulated Daily Fuel</span>
                        <span className="text-2xl font-bold text-fuchsia-300">
                          {simResult.simulated.fuelConsumptionDayL} L/day
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Projected Fuel Autonomy</span>
                        <span className="text-2xl font-bold text-fuchsia-300">
                          {simResult.simulated.fuelAutonomyDays} Days
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </DoubleBezel>
            </div>

            {/* DECISION SUPPORT & ALERTS */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <DoubleBezel innerClassName="p-6 bg-[#0a0d14]/70 backdrop-blur-xl flex flex-col gap-6">
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <ShieldWarning size={20} className="text-amber-400" />
                  <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-200">Critical Simulation Alerts</h4>
                </div>

                <div className="space-y-3">
                  {simResult.simulated.criticalAlerts.map((alert, i) => (
                    <div key={i} className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
                      <Warning size={16} className="text-rose-400 shrink-0 mt-0.5" />
                      <span className="text-xs font-mono text-rose-200 leading-relaxed">{alert}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 border-b border-white/10 pb-3 pt-4">
                  <CheckCircle size={20} className="text-emerald-400" />
                  <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-200">Recommended Operator Actions</h4>
                </div>

                <div className="space-y-3">
                  {simResult.simulated.recommendedActions.map((action, i) => (
                    <div key={i} className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                      <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-xs font-mono text-emerald-200 leading-relaxed">{action}</span>
                    </div>
                  ))}
                </div>
              </DoubleBezel>
            </div>
          </div>
        )}
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
