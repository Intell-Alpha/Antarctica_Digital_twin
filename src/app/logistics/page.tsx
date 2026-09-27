"use client";

import { useEffect, useState } from "react";
import { DoubleBezel } from "@/components/DoubleBezel";
import { motion } from "framer-motion";
import { Package, Truck, ShieldCheck, Clock, Drop } from "@phosphor-icons/react";
import { fetchApi } from "@/lib/api-client";

interface InventoryItem {
  id: string;
  name: string;
  itemCount: number;
  currentStockUnits: number;
  dailyConsumptionUnits: number;
  daysRemaining: number;
  status: string;
  storageLocation: string;
}

interface LogisticsData {
  stationId: string;
  metrics: {
    fuelReservesL: number;
    dailyFuelConsumptionL: number;
    fuelAutonomyDays: number;
    survivabilityDays: number;
    resupplyWindow: string;
  };
  inventory: InventoryItem[];
}

export default function LogisticsPage() {
  const [stationId, setStationId] = useState<"BHARATI" | "MAITRI">("BHARATI");
  const [data, setData] = useState<LogisticsData | null>(null);

  useEffect(() => {
    fetchApi<{ success: boolean } & LogisticsData>(`/api/logistics?station=${stationId}`)
      .then(res => setData(res))
      .catch(err => console.error(err));
  }, [stationId]);

  return (
    <main className="min-h-[100dvh] w-full bg-[#020305] text-white px-4 py-8 pt-28 md:px-8 md:pt-36">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0a0d14]/60 backdrop-blur-xl border border-white/[0.08] p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <Package size={32} weight="light" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Logistics & Supply Chain Twin</h1>
              <p className="text-xs font-mono text-zinc-400">Fuel Farm, Rations, Medical Supplies & Resupply Operations</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-black/60 p-1.5 rounded-xl border border-white/10">
            <button
              onClick={() => setStationId("BHARATI")}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${stationId === "BHARATI" ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.3)]" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              BHARATI (2012)
            </button>
            <button
              onClick={() => setStationId("MAITRI")}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${stationId === "MAITRI" ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              MAITRI (1989)
            </button>
          </div>
        </div>

        {/* METRICS */}
        {data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DoubleBezel innerClassName="p-6 bg-[#0a0d14]/70 backdrop-blur-xl flex flex-col justify-between gap-4">
                <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase">Fuel Autonomy Horizon</span>
                <span className="text-4xl font-mono font-bold text-indigo-400">{data.metrics.fuelAutonomyDays} <span className="text-sm font-normal text-zinc-500">Days</span></span>
              </DoubleBezel>
              <DoubleBezel innerClassName="p-6 bg-[#0a0d14]/70 backdrop-blur-xl flex flex-col justify-between gap-4">
                <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Current Fuel Tank Reserves</span>
                <span className="text-4xl font-mono font-bold text-white">{data.metrics.fuelReservesL.toLocaleString()} <span className="text-sm font-normal text-zinc-500">Liters</span></span>
              </DoubleBezel>
              <DoubleBezel innerClassName="p-6 bg-[#0a0d14]/70 backdrop-blur-xl flex flex-col justify-between gap-4">
                <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">Active Resupply Corridor</span>
                <span className="text-xs font-mono text-emerald-300 leading-relaxed mt-1">{data.metrics.resupplyWindow}</span>
              </DoubleBezel>
            </div>

            {/* INVENTORY TABLE */}
            <DoubleBezel innerClassName="p-8 bg-[#0a0d14]/70 backdrop-blur-xl flex flex-col gap-6">
              <h3 className="text-base font-bold font-mono text-white tracking-wider flex items-center gap-2 border-b border-white/10 pb-4">
                <Package size={20} className="text-indigo-400" />
                Critical Resource Stock & Depletion Forecast (TTCF)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.inventory.map(item => (
                  <div key={item.id} className="bg-[#050608] border border-white/10 rounded-2xl p-6 flex flex-col justify-between gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-white">{item.name}</h4>
                        <span className="text-[10px] font-mono text-zinc-500 block">{item.storageLocation}</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${item.status === 'NORMAL' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'}`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="space-y-2 font-mono text-xs border-t border-b border-white/5 py-3">
                      <div className="flex justify-between"><span className="text-zinc-500">Stock Level</span><span className="text-white font-bold">{item.currentStockUnits.toLocaleString()} units</span></div>
                      <div className="flex justify-between"><span className="text-zinc-500">Daily Consumption</span><span>{item.dailyConsumptionUnits} units/day</span></div>
                      <div className="flex justify-between"><span className="text-zinc-500">Days Remaining</span><span className="text-indigo-400 font-bold">{item.daysRemaining} days</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </DoubleBezel>
          </>
        )}
      </div>
    </main>
  );
}
