"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { MapTrifold, Buildings, Wrench } from "@phosphor-icons/react";

export default function InfrastructureDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.getInfrastructure("MAITRI").then(setData);
  }, []);

  if (!data) return <div className="text-[#0DB9D0] font-mono text-sm uppercase tracking-widest animate-pulse">Scanning Structural Integrity...</div>;

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end border-b border-[#0D3040]/60 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-semibold text-white tracking-tight">Infrastructure & Life Support</h1>
            <ProvenanceBadge type="OFFICIAL" />
          </div>
          <p className="text-[#7ABBD4] font-mono text-[11px] uppercase tracking-widest">
            Station Modules & Structural Integrity
          </p>
        </div>
        <div className="text-right">
          <span className="font-mono text-[10px] text-[#3A6A7A] uppercase tracking-widest mb-1">Overall Condition</span>
          <div className="text-4xl font-bold text-[#00D4A0] drop-shadow-[0_0_10px_rgba(0,212,160,0.4)]">
            {data.overallConditionScore}%
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {data.assets.map((asset: any) => (
          <div key={asset.id} className="bezel-shell p-0.5">
            <div className="bezel-core p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-[#4A7A8E]">
                  <Buildings size={24} weight="duotone" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{asset.name}</h3>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#3A6A7A]">Asset ID: {asset.id}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#3A6A7A] mb-1">Status</span>
                  <div className={`px-3 py-1 rounded font-mono text-xs font-bold uppercase tracking-widest ${
                    asset.condition === 'NORMAL' ? 'bg-[#00D4A0]/10 text-[#00D4A0] border border-[#00D4A0]/30' :
                    asset.condition === 'WATCH' ? 'bg-[#D49020]/10 text-[#D49020] border border-[#D49020]/30' :
                    'bg-[#D93030]/10 text-[#D93030] border border-[#D93030]/30'
                  }`}>
                    {asset.condition}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
