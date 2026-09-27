"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { Heartbeat, WarningCircle } from "@phosphor-icons/react";

export default function DashboardOverview() {
  const [stationData, setStationData] = useState<any>(null);
  const [summaryData, setSummaryData] = useState<any>(null);

  useEffect(() => {
    // In a real app, this would be determined by a global station selector state
    api.getStationMetadata("MAITRI").then(setStationData);
    api.getDashboardSummary("MAITRI").then(setSummaryData);
  }, []);

  if (!stationData || !summaryData) {
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
            <span className="text-4xl font-bold text-[#00D4A0] drop-shadow-[0_0_10px_rgba(0,212,160,0.6)]">
              {stationData.healthScore}%
            </span>
            <Heartbeat size={24} className="text-[#00D4A0] animate-pulse" weight="bold" />
          </div>
        </div>
      </div>

      {/* TRAFFIC LIGHT MATRIX */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryData.domains.map((domain: any) => (
          <div 
            key={domain.name} 
            className={`bezel-shell p-0.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(13,185,208,0.1)] cursor-default ${domain.borderColor || 'border-[#0D3040]/50'}`}
          >
            <div className="bezel-core p-5 flex flex-col justify-between h-[110px] bg-gradient-to-br from-[#040A15] to-[#0A1A2E] group hover:bg-[#03060E]">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#4A7A8E] max-w-[70%] group-hover:text-[#7ABBD4] transition-colors">
                  {domain.name}
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-[#0DB9D0] shadow-[0_0_8px_#0DB9D0] animate-pulse" title="LIVE_SENSOR" />
              </div>
              <div>
                <span className={`font-bold text-lg ${domain.color || 'text-white'}`}>{domain.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ACTIVE ALERTS */}
      <div className="flex-1 min-h-[200px] border border-[#D93030]/30 bg-gradient-to-b from-[#D93030]/5 to-transparent rounded-2xl p-6 flex flex-col shadow-[0_0_30px_rgba(217,48,48,0.05)] relative overflow-hidden">
        {/* Subtle scanning laser line effect at top */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D93030] to-transparent opacity-50" />
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <WarningCircle size={20} className="text-[#D93030] animate-pulse" weight="fill" />
            <h2 className="font-mono text-sm uppercase tracking-widest text-[#D93030] font-bold">
              Active Priority Alerts ({summaryData.activeAlerts}) · Predictive Risks ({summaryData.predictiveRisks})
            </h2>
          </div>
        </div>
        
        <div className="space-y-3 relative z-10">
          {summaryData.alertsList.map((alert: any, i: number) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-[#D93030]/10 border border-[#D93030]/20 hover:bg-[#D93030]/20 hover:border-[#D93030]/40 transition-all duration-300">
              <span className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[#D93030] bg-[#D93030]/10 px-2 py-0.5 rounded shadow-[0_0_8px_rgba(217,48,48,0.2)]">
                {alert.type}
              </span>
              <div>
                <h3 className="text-white text-sm font-semibold mb-1">{alert.title}</h3>
                <p className="text-[#EBF5FC] text-sm opacity-80">{alert.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
