"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { Cpu, Wind, WarningCircle, CaretRight, ShieldCheck, ThermometerCold } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export default function SimulationsEngine() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeScenario, setActiveScenario] = useState("EXTREME_WEATHER");

  const runSimulation = async () => {
    setRunning(true);
    setResult(null);
    const data = await api.runSimulation("MAITRI", activeScenario);
    setResult(data.simulation);
    setRunning(false);
  };

  return (
    <div className="flex flex-col space-y-8 h-full animate-in fade-in duration-700">
      <header className="flex justify-between items-end border-b border-[#0D3040]/60 pb-6 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-semibold text-white tracking-tight">What-If Risk Engine</h1>
            <ProvenanceBadge type="INFERENCE" />
          </div>
          <p className="text-[#7ABBD4] font-mono text-[11px] uppercase tracking-widest max-w-xl">
            Calculates cross-domain impact comparing baseline state vs projected state under extreme operational stress.
          </p>
        </div>
      </header>

      <div className="flex gap-8 flex-1 min-h-0">
        {/* Scenarios Panel */}
        <div className="w-80 flex flex-col gap-3 shrink-0">
          <span className="font-mono text-[10px] text-[#3A6A7A] uppercase tracking-widest mb-2 px-1">Select Scenario</span>
          
          <ScenarioButton 
            id="EXTREME_WEATHER" 
            title="Scenario A: Extreme Weather" 
            desc="-40°C Drop & Katabatic Storm" 
            icon={Wind}
            active={activeScenario === "EXTREME_WEATHER"} 
            onClick={() => { setActiveScenario("EXTREME_WEATHER"); setResult(null); }} 
          />
          <ScenarioButton 
            id="GENERATOR_FAILURE" 
            title="Scenario B: Generator Failure" 
            desc="Primary CHP unit trip" 
            icon={Cpu}
            active={activeScenario === "GENERATOR_FAILURE"} 
            onClick={() => { setActiveScenario("GENERATOR_FAILURE"); setResult(null); }} 
          />
          
          <button 
            onClick={runSimulation}
            disabled={running}
            className="mt-6 w-full py-4 rounded-xl font-mono text-sm font-bold uppercase tracking-widest transition-all
              bg-[#0DB9D0]/10 border border-[#0DB9D0]/30 text-[#0DB9D0] hover:bg-[#0DB9D0]/20 hover:border-[#0DB9D0]/50 shadow-[0_0_15px_rgba(13,185,208,0.1)]
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {running ? "COMPUTING IMPACT..." : "EXECUTE SIMULATION"}
          </button>
        </div>

        {/* Results Panel */}
        <div className="flex-1 bg-[#040A15] border border-[#0D3040]/40 rounded-2xl p-8 overflow-y-auto">
          {!result && !running && (
            <div className="h-full flex flex-col items-center justify-center text-[#3A6A7A]">
              <Cpu size={48} weight="thin" className="mb-4 opacity-50" />
              <p className="font-mono text-xs uppercase tracking-widest">Simulation Engine Idle</p>
              <p className="font-sans text-sm mt-2 opacity-60">Select a scenario and execute to project cross-domain impact.</p>
            </div>
          )}

          {running && (
            <div className="h-full flex flex-col items-center justify-center text-[#0DB9D0]">
              <div className="w-16 h-16 border-2 border-[#0DB9D0]/20 border-t-[#0DB9D0] rounded-full animate-spin mb-6" />
              <p className="font-mono text-sm uppercase tracking-widest animate-pulse">Running Counterfactual Models...</p>
            </div>
          )}

          {result && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-8">
                <ThermometerCold size={32} className="text-[#D93030]" />
                <div>
                  <h2 className="text-xl font-semibold text-white">{result.scenarioName}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-[10px] text-[#D93030] uppercase tracking-widest font-bold">CRITICAL IMPACT PREDICTION</span>
                  </div>
                </div>
              </div>

              {/* Diff View */}
              <div className="grid grid-cols-2 gap-px bg-[#0D3040]/40 rounded-xl overflow-hidden mb-8 border border-[#0D3040]/50">
                <div className="bg-[#03060E] p-6">
                  <h3 className="font-mono text-[11px] text-[#4A7A8E] uppercase tracking-widest mb-6 border-b border-[#0D3040]/50 pb-2">Baseline State</h3>
                  <div className="space-y-4">
                    <DiffRow label="Power Demand" value={`${result.baseline.powerDemandKw} kW`} />
                    <DiffRow label="Fuel Consumption" value={`${result.baseline.fuelConsumptionDayL} L/day`} />
                    <DiffRow label="Fuel Autonomy" value={`${result.baseline.fuelAutonomyDays} Days`} />
                    <DiffRow label="Survivability Score" value={`${result.baseline.survivabilityScore}%`} color="text-[#00D4A0]" />
                  </div>
                </div>
                
                <div className="bg-[#0A0202] p-6">
                  <h3 className="font-mono text-[11px] text-[#D93030] uppercase tracking-widest mb-6 border-b border-[#D93030]/20 pb-2 flex items-center justify-between">
                    <span>Simulated State</span>
                    <WarningCircle size={14} className="text-[#D93030]" weight="fill" />
                  </h3>
                  <div className="space-y-4">
                    <DiffRow label="Power Demand" value={`${result.simulated.powerDemandKw} kW`} color="text-[#D49020]" />
                    <DiffRow label="Fuel Consumption" value={`${result.simulated.fuelConsumptionDayL} L/day`} color="text-[#D49020]" />
                    <DiffRow label="Fuel Autonomy" value={`${result.simulated.fuelAutonomyDays} Days`} color="text-[#D93030]" />
                    <DiffRow label="Survivability Score" value={`${result.simulated.survivabilityScore}%`} color="text-[#D93030]" />
                  </div>
                </div>
              </div>

              {/* Recommended Actions */}
              <div className="bg-[#0DB9D0]/5 border border-[#0DB9D0]/20 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck size={20} className="text-[#0DB9D0]" weight="fill" />
                  <h3 className="font-mono text-xs text-[#0DB9D0] uppercase tracking-widest font-bold">Decision Support / Actions</h3>
                </div>
                <ul className="space-y-3">
                  {result.recommendedActions.map((action: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#EBF5FC]">
                      <CaretRight size={16} className="text-[#0DB9D0] shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ScenarioButton({ id, title, desc, icon: Icon, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "text-left p-4 rounded-xl border transition-all duration-200 flex gap-4 items-center group",
        active 
          ? "bg-[#0DB9D0]/10 border-[#0DB9D0]/30 shadow-[0_0_15px_rgba(13,185,208,0.1)]" 
          : "bg-[#040A15]/50 border-[#0D3040]/50 hover:bg-white/[0.02]"
      )}
    >
      <div className={cn(
        "shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors",
        active ? "bg-[#0DB9D0]/20 text-[#0DB9D0]" : "bg-white/5 text-[#4A7A8E] group-hover:text-white"
      )}>
        <Icon size={20} weight={active ? "fill" : "regular"} />
      </div>
      <div>
        <h3 className={cn("font-bold text-sm mb-1", active ? "text-white" : "text-[#7ABBD4]")}>{title}</h3>
        <p className="text-xs text-[#4A7A8E]">{desc}</p>
      </div>
    </button>
  );
}

function DiffRow({ label, value, color = "text-white" }: { label: string, value: string, color?: string }) {
  return (
    <div className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0">
      <span className="font-sans text-xs text-[#7ABBD4]">{label}</span>
      <span className={`font-mono font-bold ${color}`}>{value}</span>
    </div>
  );
}
