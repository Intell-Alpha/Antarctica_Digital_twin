"use client";

import { useEffect, useState } from "react";
import { DoubleBezel } from "@/components/DoubleBezel";
import { motion } from "framer-motion";
import { WifiHigh, Broadcast, ShieldCheck, Database } from "@phosphor-icons/react";
import { fetchApi } from "@/lib/api-client";

interface NetworkData {
  stationId: string;
  uplink: {
    satelliteName: string;
    linkStatus: string;
    latencyMs: number;
    bandwidthMbps: number;
    edgeBufferUsedPct: number;
    queuedPriorityLogs: number;
    nextWindowMinutes: number;
  };
  priorityQueues: {
    priority: string;
    label: string;
    status: string;
  }[];
}

export default function NetworkPage() {
  const [stationId, setStationId] = useState<"BHARATI" | "MAITRI">("BHARATI");
  const [data, setData] = useState<NetworkData | null>(null);

  useEffect(() => {
    fetchApi<{ success: boolean } & NetworkData>(`/api/network?station=${stationId}`)
      .then(res => setData(res))
      .catch(err => console.error(err));
  }, [stationId]);

  return (
    <main className="min-h-[100dvh] w-full bg-[#020305] text-white px-4 py-8 pt-28 md:px-8 md:pt-36">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0a0d14]/60 backdrop-blur-xl border border-white/[0.08] p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.2)]">
              <WifiHigh size={32} weight="light" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Communications & Edge Sync</h1>
              <p className="text-xs font-mono text-zinc-400">ISRO Satellite Uplink, Edge Gateway Buffer & Prioritized Telemetry Queue</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-black/60 p-1.5 rounded-xl border border-white/10">
            <button
              onClick={() => setStationId("BHARATI")}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${stationId === "BHARATI" ? "bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-[0_0_12px_rgba(14,165,233,0.3)]" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              BHARATI (ISRO NRSC)
            </button>
            <button
              onClick={() => setStationId("MAITRI")}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${stationId === "MAITRI" ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              MAITRI (INSAT / DROMLAN)
            </button>
          </div>
        </div>

        {/* METRICS */}
        {data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <DoubleBezel innerClassName="p-6 bg-[#0a0d14]/70 backdrop-blur-xl flex flex-col justify-between gap-4">
                <span className="text-[10px] font-mono tracking-widest text-sky-400 uppercase">Primary Orbital Link</span>
                <span className="text-lg font-mono font-bold text-white leading-snug">{data.uplink.satelliteName}</span>
              </DoubleBezel>
              <DoubleBezel innerClassName="p-6 bg-[#0a0d14]/70 backdrop-blur-xl flex flex-col justify-between gap-4">
                <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">Uplink Latency</span>
                <span className="text-3xl font-mono font-bold text-emerald-400">{data.uplink.latencyMs} <span className="text-xs font-normal text-zinc-500">ms</span></span>
              </DoubleBezel>
              <DoubleBezel innerClassName="p-6 bg-[#0a0d14]/70 backdrop-blur-xl flex flex-col justify-between gap-4">
                <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase">Uplink Bandwidth</span>
                <span className="text-3xl font-mono font-bold text-indigo-400">{data.uplink.bandwidthMbps} <span className="text-xs font-normal text-zinc-500">Mbps</span></span>
              </DoubleBezel>
              <DoubleBezel innerClassName="p-6 bg-[#0a0d14]/70 backdrop-blur-xl flex flex-col justify-between gap-4">
                <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">Edge Buffer Utilization</span>
                <span className="text-3xl font-mono font-bold text-amber-400">{data.uplink.edgeBufferUsedPct}% <span className="text-xs font-normal text-zinc-500">NVMe Storage</span></span>
              </DoubleBezel>
            </div>

            {/* QUEUE */}
            <DoubleBezel innerClassName="p-8 bg-[#0a0d14]/70 backdrop-blur-xl flex flex-col gap-6">
              <h3 className="text-base font-bold font-mono text-white tracking-wider flex items-center gap-2 border-b border-white/10 pb-4">
                <Broadcast size={20} className="text-sky-400" />
                Store-and-Forward Telemetry Prioritization Matrix
              </h3>

              <div className="space-y-4">
                {data.priorityQueues.map((q, i) => (
                  <div key={i} className="bg-[#050608] border border-white/10 rounded-xl p-4 flex justify-between items-center font-mono text-xs">
                    <div className="flex items-center gap-4">
                      <span className="px-2.5 py-1 rounded bg-sky-500/20 text-sky-400 font-bold border border-sky-500/30">{q.priority}</span>
                      <span className="text-white">{q.label}</span>
                    </div>
                    <span className="text-zinc-400">{q.status}</span>
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
