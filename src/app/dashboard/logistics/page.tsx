"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { Package, Drop, ShieldWarning } from "@phosphor-icons/react";

export default function LogisticsDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.getLogistics("BHARATI").then(setData);
  }, []);

  if (!data) return <div className="text-[#0DB9D0] font-mono text-sm uppercase tracking-widest animate-pulse">Computing TTCF Horizon...</div>;

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end border-b border-[#0D3040]/60 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-semibold text-white tracking-tight">Logistics & Supply</h1>
            <ProvenanceBadge type="OFFICIAL" />
          </div>
          <p className="text-[#7ABBD4] font-mono text-[11px] uppercase tracking-widest">
            Inventory reserves and autonomy prediction
          </p>
        </div>
      </header>

      {/* Main KPI: Fuel Autonomy (TTCF) */}
      <div className="bezel-shell p-0.5 animate-pulse relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-[#D49020]/20 via-transparent to-transparent opacity-50 transition-opacity group-hover:opacity-100" />
        <div className="bezel-core p-8 flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-br from-[#040A15] to-[#D49020]/10 border-l-4 border-l-[#D49020] relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <ShieldWarning size={24} className="text-[#D49020] animate-bounce" />
              <span className="font-mono text-xs text-[#D49020] uppercase tracking-widest font-bold drop-shadow-[0_0_8px_rgba(212,144,32,0.6)]">
                Time To Critical Failure (TTCF)
              </span>
              <ProvenanceBadge type="INFERENCE" />
            </div>
            <p className="text-[#EBF5FC] text-sm max-w-md leading-relaxed opacity-80">
              Calculated station autonomy based on current fuel reserves divided by the 14-day rolling average fuel consumption rate.
            </p>
          </div>
          <div className="flex flex-col items-end text-right">
            <span className="text-5xl font-bold text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              {data.fuelAutonomyDays} <span className="text-2xl text-[#D49020] font-normal">Days</span>
            </span>
            <div className="mt-2 px-3 py-1 bg-[#D49020]/10 border border-[#D49020]/30 rounded font-mono text-[10px] text-[#EBF5FC] uppercase tracking-widest shadow-[0_0_10px_rgba(212,144,32,0.1)]">
              Resupply Window: <span className="text-[#00D4A0]">{data.resupplyWindow}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bezel-shell p-0.5 transition-transform duration-300 hover:-translate-y-1">
          <div className="bezel-core p-6 h-full flex flex-col justify-between bg-[#03060E]">
            <span className="font-mono text-[10px] text-[#3A6A7A] uppercase tracking-widest">Fuel Tank Reserves (Jet A-1 / HSD)</span>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-bold text-white">{(data.fuelReservesL / 1000).toFixed(1)}k</span>
              <span className="text-[#0DB9D0] font-mono">Liters</span>
            </div>
            <div className="w-full bg-[#040A15] h-2 mt-4 rounded-full overflow-hidden border border-[#0D3040]/50 relative">
              <div 
                className="bg-[#0DB9D0] h-full shadow-[0_0_15px_#0DB9D0] rounded-full relative" 
                style={{ width: `${(data.fuelReservesL / 400000) * 100}%` }}
              >
                <div className="absolute top-0 right-0 bottom-0 w-2 bg-white/50 blur-[2px]" />
              </div>
            </div>
            <div className="mt-4 text-[10px] text-[#4A7A8E] font-mono uppercase tracking-widest flex items-center justify-between">
              <div className="flex items-center gap-2"><ProvenanceBadge type="LIVE_SENSOR" /> Tank Level Monitor</div>
              <span className="text-[#0DB9D0]">72% FULL</span>
            </div>
          </div>
        </div>

        <div className="bezel-shell p-0.5 transition-transform duration-300 hover:-translate-y-1">
          <div className="bezel-core p-6 h-full flex flex-col justify-between bg-[#03060E]">
            <span className="font-mono text-[10px] text-[#3A6A7A] uppercase tracking-widest">Daily Burn Rate</span>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-bold text-white">{data.dailyFuelConsumptionL}</span>
              <span className="text-[#D93030] font-mono">L/Day</span>
            </div>
            <div className="mt-6 text-[10px] text-[#4A7A8E] font-mono uppercase tracking-widest flex items-center gap-2">
              <ProvenanceBadge type="INFERENCE" /> Derived from generator output
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
