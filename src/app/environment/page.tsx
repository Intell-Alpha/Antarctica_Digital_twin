"use client";

import { useEffect, useState } from "react";
import { DoubleBezel } from "@/components/DoubleBezel";
import { motion } from "framer-motion";
import { Thermometer, Wind, Radio, Sun, Compass } from "@phosphor-icons/react";
import { fetchApi } from "@/lib/api-client";

interface EnvironmentData {
  stationId: string;
  telemetry: {
    tempC: number;
    tempMinC: number;
    tempMaxC: number;
    windSpeedKmh: number;
    windDirectionDeg: number;
    windStatus: string;
    pressureHpa: number;
    humidityPct: number;
    blizzardHoursYtd: number;
    solarRadiationWm2: number;
    radiationGammaNgyh: number;
    blackCarbonUgM3: number;
    magneticFieldnT: number;
    seaIceThicknessM: number;
    resupplyWindowStatus: string;
  };
  scientificInstruments: {
    name: string;
    status: string;
    parameter: string;
  }[];
}

export default function EnvironmentPage() {
  const [stationId, setStationId] = useState<"BHARATI" | "MAITRI">("BHARATI");
  const [data, setData] = useState<EnvironmentData | null>(null);

  useEffect(() => {
    fetchApi<{ success: boolean } & EnvironmentData>(`/api/environment?station=${stationId}`)
      .then(res => setData(res))
      .catch(err => console.error(err));
  }, [stationId]);

  return (
    <main className="min-h-[100dvh] w-full bg-[#020305] text-white px-4 py-8 pt-28 md:px-8 md:pt-36">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0a0d14]/60 backdrop-blur-xl border border-white/[0.08] p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Thermometer size={32} weight="light" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Environmental & Scientific Twin</h1>
              <p className="text-xs font-mono text-zinc-400">Meteorology, BARC Radiation, ISRO Ground Telemetry & Magnetometers</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-black/60 p-1.5 rounded-xl border border-white/10">
            <button
              onClick={() => setStationId("BHARATI")}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${stationId === "BHARATI" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]" : "text-zinc-500 hover:text-zinc-300"}`}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <DoubleBezel innerClassName="p-6 bg-[#0a0d14]/70 backdrop-blur-xl flex flex-col justify-between gap-4">
                <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">Outside Temperature</span>
                <span className="text-3xl font-mono font-bold text-white">{data.telemetry.tempC}°C <span className="text-xs font-normal text-zinc-500">Min {data.telemetry.tempMinC}°C</span></span>
              </DoubleBezel>
              <DoubleBezel innerClassName="p-6 bg-[#0a0d14]/70 backdrop-blur-xl flex flex-col justify-between gap-4">
                <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase">Katabatic Wind Speed</span>
                <span className="text-3xl font-mono font-bold text-indigo-400">{data.telemetry.windSpeedKmh} <span className="text-xs font-normal text-zinc-500">km/h</span></span>
              </DoubleBezel>
              <DoubleBezel innerClassName="p-6 bg-[#0a0d14]/70 backdrop-blur-xl flex flex-col justify-between gap-4">
                <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">BARC Radiation IERMON</span>
                <span className="text-3xl font-mono font-bold text-amber-400">{data.telemetry.radiationGammaNgyh} <span className="text-xs font-normal text-zinc-500">nGy/h</span></span>
              </DoubleBezel>
              <DoubleBezel innerClassName="p-6 bg-[#0a0d14]/70 backdrop-blur-xl flex flex-col justify-between gap-4">
                <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">Geomagnetic Field</span>
                <span className="text-3xl font-mono font-bold text-cyan-400">{data.telemetry.magneticFieldnT} <span className="text-xs font-normal text-zinc-500">nT</span></span>
              </DoubleBezel>
            </div>

            {/* SCIENTIFIC INSTRUMENTS */}
            <DoubleBezel innerClassName="p-8 bg-[#0a0d14]/70 backdrop-blur-xl flex flex-col gap-6">
              <h3 className="text-base font-bold font-mono text-white tracking-wider flex items-center gap-2 border-b border-white/10 pb-4">
                <Radio size={20} className="text-emerald-400" />
                Active Scientific Instrument Network
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.scientificInstruments.map((inst, i) => (
                  <div key={i} className="bg-[#050608] border border-white/10 rounded-2xl p-6 flex flex-col justify-between gap-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold text-white">{inst.name}</h4>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {inst.status}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-zinc-400">Parameters: {inst.parameter}</span>
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
