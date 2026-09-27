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
    </main>
  );
}
