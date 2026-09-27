"use client";

import { useEffect, useState } from "react";
import { DoubleBezel } from "@/components/DoubleBezel";
import { motion } from "framer-motion";
import { BatteryCharging, Lightning, ShieldCheck, Drop, Thermometer } from "@phosphor-icons/react";
import { fetchApi } from "@/lib/api-client";

interface GeneratorAsset {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
  ratedCapacityKw: number;
  currentOutputKw: number;
  loadPercentage: number;
  fuelType: string;
  fuelConsumptionLh: number;
  runtimeHours: number;
  temperatureC: number;
  freqHz: number;
  status: string;
}

interface EnergyData {
  stationId: string;
  metrics: {
    totalCapacityKw: number;
    currentOutputKw: number;
    loadPercentage: number;
    currentFuelConsumptionLh: number;
    batteryUpsStatus: string;
    renewableSharePct: number;
  };
  generators: GeneratorAsset[];
}

export default function EnergyPage() {
  const [stationId, setStationId] = useState<"BHARATI" | "MAITRI">("BHARATI");
  const [data, setData] = useState<EnergyData | null>(null);

  useEffect(() => {
    fetchApi<{ success: boolean } & EnergyData>(`/api/energy?station=${stationId}`)
      .then(res => setData(res))
      .catch(err => console.error(err));
  }, [stationId]);

  return (
    <main className="min-h-[100dvh] w-full bg-[#020305] text-white px-4 py-8 pt-28 md:px-8 md:pt-36">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0a0d14]/60 backdrop-blur-xl border border-white/[0.08] p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <BatteryCharging size={32} weight="light" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Power & Energy Core</h1>
              <p className="text-xs font-mono text-zinc-400">Generator Groups, Load Distribution & Fuel Flow Telemetry</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-black/60 p-1.5 rounded-xl border border-white/10">
            <button
              onClick={() => setStationId("BHARATI")}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${stationId === "BHARATI" ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              BHARATI (MAN CHP 1-3)
            </button>
            <button
              onClick={() => setStationId("MAITRI")}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${stationId === "MAITRI" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_12px_rgba(34,211,238,0.3)]" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              MAITRI (RAVI/SURYA/ADITYA)
            </button>
          </div>
        </div>

        {/* METRICS CARDS */}
        {data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <DoubleBezel innerClassName="p-6 bg-[#0a0d14]/70 backdrop-blur-xl flex flex-col justify-between gap-4">
                <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Total Capacity</span>
                <span className="text-3xl font-mono font-bold text-white">{data.metrics.totalCapacityKw} <span className="text-sm font-normal text-zinc-500">kW</span></span>
              </DoubleBezel>
              <DoubleBezel innerClassName="p-6 bg-[#0a0d14]/70 backdrop-blur-xl flex flex-col justify-between gap-4">
                <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">Current Load Output</span>
                <span className="text-3xl font-mono font-bold text-amber-400">{data.metrics.currentOutputKw} <span className="text-sm font-normal text-zinc-500">kW ({data.metrics.loadPercentage}%)</span></span>
              </DoubleBezel>
              <DoubleBezel innerClassName="p-6 bg-[#0a0d14]/70 backdrop-blur-xl flex flex-col justify-between gap-4">
                <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">Fuel Consumption</span>
                <span className="text-3xl font-mono font-bold text-cyan-400">{data.metrics.currentFuelConsumptionLh} <span className="text-sm font-normal text-zinc-500">L/hr</span></span>
              </DoubleBezel>
              <DoubleBezel innerClassName="p-6 bg-[#0a0d14]/70 backdrop-blur-xl flex flex-col justify-between gap-4">
                <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">Renewable Share KPI</span>
                <span className="text-3xl font-mono font-bold text-emerald-400">{data.metrics.renewableSharePct}% <span className="text-sm font-normal text-zinc-500">Solar/Wind</span></span>
              </DoubleBezel>
            </div>

            {/* GENERATORS LIST */}
            <DoubleBezel innerClassName="p-8 bg-[#0a0d14]/70 backdrop-blur-xl flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-base font-bold font-mono text-white tracking-wider flex items-center gap-2">
                  <Lightning size={20} className="text-amber-400" />
                  Generator Array Digital Twin State
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.generators.map(gen => (
                  <div key={gen.id} className="bg-[#050608] border border-white/10 rounded-2xl p-6 flex flex-col justify-between gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono font-bold text-white">{gen.name}</span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold ${gen.status === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-500'}`}>
                        {gen.status}
                      </span>
                    </div>

                    <div className="space-y-3 font-mono text-xs">
                      <div className="flex justify-between"><span className="text-zinc-500">Type / Make</span><span>{gen.manufacturer} {gen.type}</span></div>
                      <div className="flex justify-between"><span className="text-zinc-500">Power Output</span><span className="text-white font-bold">{gen.currentOutputKw} kW / {gen.ratedCapacityKw} kW</span></div>
                      <div className="flex justify-between"><span className="text-zinc-500">Fuel Consumption</span><span>{gen.fuelConsumptionLh} L/hr</span></div>
                      <div className="flex justify-between"><span className="text-zinc-500">Engine Temp</span><span className="text-amber-400">{gen.temperatureC}°C</span></div>
                      <div className="flex justify-between"><span className="text-zinc-500">Frequency</span><span>{gen.freqHz} Hz</span></div>
                      <div className="flex justify-between"><span className="text-zinc-500">Runtime Hours</span><span>{gen.runtimeHours} hrs</span></div>
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
