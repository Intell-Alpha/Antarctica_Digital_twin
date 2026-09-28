"use client";

import { useEffect, useState } from "react";
import { DoubleBezel } from "@/components/DoubleBezel";
import { motion } from "framer-motion";
import { Buildings, ShieldCheck, Wrench, Warning } from "@phosphor-icons/react";
import { fetchApi } from "@/lib/api-client";

interface Asset {
  id: string;
  name: string;
  category: string;
  location: string;
  conditionScore: number;
  conditionState: string;
  thermalStress?: string;
  pipelineCondition?: string;
  lastInspection: string;
  provenance: {
    sourceType: string;
    sourceName: string;
    confidence: string;
  };
}

export default function InfrastructurePage() {
  const [stationId, setStationId] = useState<"BHARATI" | "MAITRI">("BHARATI");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [overallScore, setOverallScore] = useState(0);

  useEffect(() => {
    fetchApi<{ success: boolean; overallConditionScore: number; assets: Asset[] }>(`/api/infrastructure?station=${stationId}`)
      .then(res => {
        setAssets(res.assets);
        setOverallScore(res.overallConditionScore);
      })
      .catch(err => console.error(err));
  }, [stationId]);

  return (
    <main className="min-h-[100dvh] w-full bg-[#020305] text-white px-4 py-8 pt-28 md:px-8 md:pt-36">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0a0d14]/60 backdrop-blur-xl border border-white/[0.08] p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <Buildings size={32} weight="light" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Physical Infrastructure Twin</h1>
              <p className="text-xs font-mono text-zinc-400">Structural Integrity, Utilities, Sea/Lake Water Intake & Laboratories</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-black/60 p-1.5 rounded-xl border border-white/10">
            <button
              onClick={() => setStationId("BHARATI")}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${stationId === "BHARATI" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_12px_rgba(34,211,238,0.3)]" : "text-zinc-500 hover:text-zinc-300"}`}
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

        {/* OVERALL HEALTH */}
        <DoubleBezel innerClassName="p-8 bg-[#0a0d14]/70 backdrop-blur-xl flex justify-between items-center">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">Overall Infrastructure Health Index</span>
            <div className="text-4xl font-mono font-bold text-white mt-1">{overallScore}%</div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-xs font-bold">
            <ShieldCheck size={18} />
            ALL CRITICAL UTILITIES FUNCTIONAL
          </div>
        </DoubleBezel>

        {/* ASSET GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map(asset => (
            <DoubleBezel key={asset.id} innerClassName="p-6 bg-[#0a0d14]/70 backdrop-blur-xl flex flex-col justify-between gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">{asset.category}</span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{asset.name}</h3>
                  <span className="text-[11px] font-mono text-zinc-500 block">{asset.location}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${asset.conditionState === 'NORMAL' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'}`}>
                  {asset.conditionState}
                </span>
              </div>

              <div className="space-y-2 font-mono text-xs border-t border-b border-white/5 py-3">
                <div className="flex justify-between"><span className="text-zinc-500">Condition Score</span><span className="text-white font-bold">{asset.conditionScore}/100</span></div>
                {asset.thermalStress && <div className="flex justify-between"><span className="text-zinc-500">Thermal Stress</span><span>{asset.thermalStress}</span></div>}
                {asset.pipelineCondition && <div className="flex justify-between"><span className="text-zinc-500">Pipeline State</span><span>{asset.pipelineCondition}</span></div>}
                <div className="flex justify-between"><span className="text-zinc-500">Last Inspection</span><span>{asset.lastInspection}</span></div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span>Source: {asset.provenance.sourceName}</span>
                <span className="text-cyan-400">{asset.provenance.confidence}</span>
              </div>
            </DoubleBezel>
          ))}
        </div>
      </div>
    </main>
  );
}
