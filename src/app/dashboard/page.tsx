"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { Heartbeat, WarningCircle } from "@phosphor-icons/react";

export default function DashboardOverview() {
  const [stationData, setStationData] = useState<any>(null);

  useEffect(() => {
    // In a real app, this would be determined by a global station selector state
    api.getStationMetadata("MAITRI").then(setStationData);
  }, []);

  if (!stationData) {
    return (
      <div className="flex items-center justify-center h-full text-[#0DB9D0] font-mono text-sm uppercase tracking-widest animate-pulse">
        Initializing Cockpit Data Link...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full space-y-8 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex items-start justify-between border-b border-[#0D3040]/60 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-semibold text-white tracking-tight">
              {stationData.id} STATION
            </h1>
            <ProvenanceBadge type="OFFICIAL" />
          </div>
          <p className="text-[#7ABBD4] font-mono text-[11px] uppercase tracking-widest">
            Commissioned {stationData.commissioningYear} · Capacity: {stationData.capacity} Personnel
          </p>
        </div>
        
        <div className="flex flex-col items-end text-right">
          <span className="font-mono text-[10px] text-[#3A6A7A] uppercase tracking-widest mb-1">
            Overall Health Index
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[#00D4A0] drop-shadow-[0_0_10px_rgba(0,212,160,0.4)]">
              {stationData.healthScore}%
            </span>
            <Heartbeat size={24} className="text-[#00D4A0]" weight="bold" />
          </div>
        </div>
      </div>

      {/* TRAFFIC LIGHT MATRIX */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* We will map the 6 domains here in Phase 3 */}
        {["Energy & Power", "Water & Infrastructure", "Logistics & Supply", "Environment", "Communications", "Waste Management"].map((domain) => (
          <div key={domain} className="bezel-shell p-0.5">
            <div className="bezel-core p-5 flex flex-col justify-between h-[120px]">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#4A7A8E]">
                  {domain}
                </span>
                <ProvenanceBadge type="LIVE_SENSOR" />
              </div>
              <div>
                <span className="font-bold text-lg text-white">NOMINAL</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ACTIVE ALERTS STUB */}
      <div className="flex-1 min-h-[200px] border border-[#D93030]/20 bg-[#D93030]/[0.02] rounded-2xl p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <WarningCircle size={20} className="text-[#D93030]" weight="fill" />
          <h2 className="font-mono text-sm uppercase tracking-widest text-[#D93030] font-bold">
            Active Priority Alerts (0)
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center border border-dashed border-[#0D3040] rounded-xl text-[#3A6A7A] font-mono text-[11px] uppercase tracking-widest">
          No active threshold breaches.
        </div>
      </div>
    </div>
  );
}
