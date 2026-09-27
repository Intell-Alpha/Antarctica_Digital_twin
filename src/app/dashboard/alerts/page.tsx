"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { WarningCircle, Siren } from "@phosphor-icons/react";

export default function AlertsDashboard() {
  const [summaryData, setSummaryData] = useState<any>(null);

  useEffect(() => {
    api.getDashboardSummary("MAITRI").then(setSummaryData);
  }, []);

  if (!summaryData) return <div className="text-[#D93030] font-mono text-sm uppercase tracking-widest animate-pulse">Fetching Alert Registry...</div>;

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-700 h-full">
      <header className="flex justify-between items-end border-b border-[#D93030]/30 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-semibold text-white tracking-tight">Active Alerts & Risks</h1>
            <ProvenanceBadge type="INFERENCE" />
          </div>
          <p className="text-[#D93030] font-mono text-[11px] uppercase tracking-widest">
            Cross-domain anomaly detection and predictive risk vectors
          </p>
        </div>
        <Siren size={32} className="text-[#D93030] animate-pulse" weight="duotone" />
      </header>

      <div className="flex-1 space-y-4">
        {summaryData.alertsList.map((alert: any, i: number) => (
          <div key={i} className="bezel-shell p-0.5 border-[#D93030]/30">
            <div className="bezel-core p-6 bg-[#D93030]/[0.02]">
              <div className="flex items-start gap-4">
                <WarningCircle size={28} className="text-[#D93030] shrink-0 mt-1" weight="fill" />
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-white tracking-tight">{alert.title}</h2>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#D93030] border border-[#D93030]/30 px-2 py-0.5 rounded bg-[#D93030]/10">
                      {alert.type}
                    </span>
                  </div>
                  <p className="text-[#EBF5FC] leading-relaxed max-w-3xl">{alert.desc}</p>
                  <div className="mt-4 flex gap-4">
                    <button className="px-4 py-2 bg-[#D93030]/20 hover:bg-[#D93030]/30 text-[#D93030] border border-[#D93030]/50 rounded font-mono text-xs font-bold uppercase tracking-widest transition-colors">
                      Acknowledge
                    </button>
                    <button className="px-4 py-2 bg-transparent hover:bg-white/5 text-[#EBF5FC] border border-white/20 rounded font-mono text-xs font-bold uppercase tracking-widest transition-colors">
                      Run Diagnostic
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {summaryData.alertsList.length === 0 && (
          <div className="h-64 flex items-center justify-center border border-dashed border-[#0D3040] rounded-xl text-[#3A6A7A] font-mono text-[11px] uppercase tracking-widest">
            No active threshold breaches.
          </div>
        )}
      </div>
    </div>
  );
}
