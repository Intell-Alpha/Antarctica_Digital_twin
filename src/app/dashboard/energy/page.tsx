"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { BatteryCharging, Lightning, Thermometer } from "@phosphor-icons/react";

export default function EnergyDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.getEnergy("MAITRI").then(setData);
  }, []);

  if (!data) return <div className="text-[#0DB9D0] font-mono text-sm uppercase tracking-widest animate-pulse">Establishing Power Grid Link...</div>;

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end border-b border-[#0D3040]/60 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-semibold text-white tracking-tight">Power Grid & Energy</h1>
            <ProvenanceBadge type="LIVE_SENSOR" />
          </div>
          <p className="text-[#7ABBD4] font-mono text-[11px] uppercase tracking-widest">
            Combined Heat & Power (CHP) Telemetry
          </p>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bezel-shell p-0.5">
          <div className="bezel-core p-6 h-full flex flex-col justify-between bg-gradient-to-br from-[#040A15] to-[#0A1A2E]">
            <span className="font-mono text-[10px] text-[#3A6A7A] uppercase tracking-widest">Active Output</span>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-bold text-white">{data.currentOutputKw}</span>
              <span className="text-[#0DB9D0] font-mono">kW</span>
            </div>
            <div className="w-full bg-[#030812] h-1.5 mt-4 rounded-full overflow-hidden border border-white/5">
              <div 
                className="bg-[#0DB9D0] h-full shadow-[0_0_15px_#0DB9D0]" 
                style={{ width: `${(data.currentOutputKw / data.totalCapacityKw) * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="bezel-shell p-0.5">
          <div className="bezel-core p-6 h-full flex flex-col justify-between bg-gradient-to-br from-[#040A15] to-[#0A1A2E]">
            <span className="font-mono text-[10px] text-[#3A6A7A] uppercase tracking-widest">Fuel Consumption</span>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-bold text-white">{data.currentFuelConsumptionLh}</span>
              <span className="text-[#D49020] font-mono">L/hr</span>
            </div>
            <div className="mt-4 text-[10px] text-[#4A7A8E] font-mono uppercase tracking-widest flex items-center gap-2">
              <ProvenanceBadge type="OFFICIAL" /> Diesel HSD Burn Rate
            </div>
          </div>
        </div>

        <div className="bezel-shell p-0.5">
          <div className="bezel-core p-6 h-full flex flex-col justify-between bg-gradient-to-br from-[#040A15] to-[#0A1A2E]">
            <span className="font-mono text-[10px] text-[#3A6A7A] uppercase tracking-widest">Renewable Share</span>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-bold text-white">{data.renewablePct || "0.0"}</span>
              <span className="text-[#00D4A0] font-mono">%</span>
            </div>
            <div className="mt-4 text-[10px] text-[#4A7A8E] font-mono uppercase tracking-widest flex items-center gap-2">
              <ProvenanceBadge type="PROJECT_ASSUMPTION" /> Target: 15%
            </div>
          </div>
        </div>
      </div>

      {/* Generators List */}
      <div>
        <h2 className="text-sm font-mono text-[#7ABBD4] uppercase tracking-widest mb-4">Generator Telemetry (MAN CHP)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.generators.map((gen: any) => (
            <div key={gen.id} className="bezel-shell p-0.5 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className={`bezel-core p-5 transition-colors h-full ${gen.status === 'RUNNING' ? 'bg-gradient-to-br from-[#0DB9D0]/5 to-transparent' : 'bg-[#03060E]'}`}>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold text-lg">{gen.name}</h3>
                      {gen.status === 'RUNNING' && <div className="w-1.5 h-1.5 rounded-full bg-[#0DB9D0] shadow-[0_0_8px_#0DB9D0] animate-pulse" />}
                    </div>
                    <span className="text-[10px] font-mono text-[#4A7A8E]">{gen.id}</span>
                  </div>
                  <div className={`px-2 py-0.5 rounded border font-mono text-[9px] uppercase tracking-widest ${
                    gen.status === 'RUNNING' ? 'border-[#00D4A0]/40 text-[#00D4A0] bg-[#00D4A0]/10 shadow-[0_0_10px_rgba(0,212,160,0.2)]' : 'border-[#3A6A7A] text-[#4A7A8E]'
                  }`}>
                    {gen.status}
                  </div>
                </div>

                <div className="space-y-4 font-mono text-xs text-[#EBF5FC]">
                  <div className="flex justify-between border-b border-white/5 pb-2 hover:border-[#0DB9D0]/30 transition-colors">
                    <span className="text-[#4A7A8E]">Output</span>
                    <span className={gen.status === 'RUNNING' ? 'text-[#0DB9D0] font-bold' : ''}>{gen.outputKw.toFixed(1)} kW</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2 hover:border-[#0DB9D0]/30 transition-colors">
                    <span className="text-[#4A7A8E]">Engine Temp</span>
                    <span className={gen.tempC > 90 ? "text-[#D93030] font-bold" : ""}>{gen.tempC}°C</span>
                  </div>
                  <div className="flex justify-between pb-1 hover:border-[#0DB9D0]/30 transition-colors border-b border-transparent">
                    <span className="text-[#4A7A8E]">Frequency</span>
                    <span>{gen.hz.toFixed(2)} Hz</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
