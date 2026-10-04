"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { Heartbeat, WarningCircle } from "@phosphor-icons/react";

export default function DashboardOverview() {
  const [stationData, setStationData] = useState<any>(null);
  const [summaryData, setSummaryData] = useState<any>(null);

  useEffect(() => {
    api.getStationMetadata("MAITRI").then(setStationData);
    api.getDashboardSummary("MAITRI").then(setSummaryData);
  }, []);

  if (!stationData || !summaryData) {
    return (
      <div className="flex items-center justify-center h-full text-accent font-mono text-sm uppercase tracking-widest animate-pulse">
        Initializing Cockpit Data Link...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full space-y-8 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex items-start justify-between border-b border-theme pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {stationData.id} STATION
            </h1>
            <ProvenanceBadge type="OFFICIAL" />
          </div>
          <p className="text-muted font-mono text-[11px] uppercase tracking-widest font-semibold">
            Commissioned {stationData.commissioningYear} · Capacity: {stationData.capacity} Personnel
          </p>
        </div>
        
        <div className="flex flex-col items-end text-right">
          <span className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1 font-semibold">
            Overall Health Index
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-[#00D4A0] dark:text-[#00D4A0] drop-shadow-sm">
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
            className={`bezel-shell p-0.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default ${domain.borderColor || 'border-theme'}`}
          >
            <div className="bezel-core p-5 flex flex-col justify-between h-[110px] bg-theme-panel group hover:bg-theme-base">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted max-w-[75%] group-hover:text-foreground font-bold transition-colors">
                  {domain.name}
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent-primary)] animate-pulse" title="LIVE_SENSOR" />
              </div>
              <div>
                <span className={`font-bold text-lg ${domain.color || 'text-foreground'}`}>{domain.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ACTIVE ALERTS */}
      <div className="flex-1 min-h-[200px] border border-rose-500/40 bg-rose-500/10 dark:bg-rose-500/5 rounded-2xl p-6 flex flex-col shadow-sm relative overflow-hidden">
        {/* Subtle scanning laser line effect at top */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-60" />
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <WarningCircle size={20} className="text-rose-600 dark:text-rose-400 animate-pulse" weight="fill" />
            <h2 className="font-mono text-sm uppercase tracking-widest text-rose-700 dark:text-rose-300 font-extrabold">
              Active Priority Alerts ({summaryData.activeAlerts}) · Predictive Risks ({summaryData.predictiveRisks})
            </h2>
          </div>
        </div>
        
        <div className="space-y-3 relative z-10">
          {summaryData.alertsList.map((alert: any, i: number) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-theme-panel border border-rose-500/30 hover:border-rose-500/50 transition-all duration-300 shadow-sm">
              <span className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-rose-700 dark:text-rose-300 bg-rose-500/15 px-2 py-0.5 rounded border border-rose-500/30">
                {alert.type}
              </span>
              <div>
                <h3 className="text-foreground text-sm font-bold mb-1">{alert.title}</h3>
                <p className="text-muted text-sm font-medium">{alert.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
