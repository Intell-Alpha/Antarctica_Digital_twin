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
    <div className="flex flex-col space-y-8 animate-in fade-in duration-700 min-h-full pb-12">
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

      <div className="flex-1 space-y-4 relative">
        
        {/* Scanning Laser Effect Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#D93030]/50 to-transparent absolute top-0 animate-[shimmer_2s_infinite] shadow-[0_0_15px_#D93030]" />
        </div>

        {summaryData.alertsList.map((alert: any, i: number) => (
          <div key={i} className="bezel-shell p-0.5 border-[#D93030]/30 hover:shadow-[0_4px_30px_rgba(217,48,48,0.15)] transition-shadow duration-500 group relative z-10">
            <div className="bezel-core p-6 bg-[#D93030]/[0.02] group-hover:bg-[#D93030]/[0.05] transition-colors backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <WarningCircle size={28} className="text-[#D93030] shrink-0 mt-1 drop-shadow-[0_0_8px_#D93030]" weight="fill" />
                <div className="w-full">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-white tracking-tight">{alert.title}</h2>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[#D93030] border border-[#D93030]/50 px-2 py-0.5 rounded bg-[#D93030]/20 shadow-[0_0_10px_rgba(217,48,48,0.3)]">
                        {alert.type}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-[#D93030]/60 uppercase tracking-widest">T-00:00:00</span>
                  </div>
                  <p className="text-[#EBF5FC] leading-relaxed max-w-3xl opacity-90">{alert.desc}</p>
                  
                  {/* Expanded Actions on Hover */}
                  <div className="mt-6 flex gap-4 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button className="px-5 py-2.5 bg-[#D93030]/20 hover:bg-[#D93030]/30 text-[#D93030] border border-[#D93030]/50 hover:border-[#D93030] rounded font-mono text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(217,48,48,0.1)] hover:shadow-[0_0_20px_rgba(217,48,48,0.3)]">
                      Acknowledge Risk
                    </button>
                    <button className="px-5 py-2.5 bg-transparent hover:bg-white/5 text-[#EBF5FC] border border-white/20 hover:border-white/40 rounded font-mono text-xs font-bold uppercase tracking-widest transition-all">
                      Run Diagnostic Scan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {summaryData.alertsList.length === 0 && (
          <div className="h-64 flex items-center justify-center border border-dashed border-[#0D3040] rounded-xl text-[#3A6A7A] font-mono text-[11px] uppercase tracking-widest relative z-10">
            No active threshold breaches.
          </div>
        )}
      </div>
    </div>
  );
}
