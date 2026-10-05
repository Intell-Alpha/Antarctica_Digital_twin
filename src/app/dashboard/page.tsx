"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StationHeader, StationMetadata } from "@/components/dashboard/StationHeader";
import { DomainMatrix, DomainStatus } from "@/components/dashboard/DomainMatrix";
import { AlertsPanel, AlertItem } from "@/components/dashboard/AlertsPanel";

interface SummaryData {
  activeAlerts: number;
  predictiveRisks: number;
  domains: DomainStatus[];
  alertsList: AlertItem[];
}

export default function DashboardOverview() {
  const [stationData, setStationData] = useState<StationMetadata | null>(null);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);

  useEffect(() => {
    api.getStationMetadata("MAITRI").then(setStationData);
    api.getDashboardSummary("MAITRI").then(setSummaryData);
  }, []);

  if (!stationData || !summaryData) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-accent font-mono text-sm uppercase tracking-widest animate-pulse">
        Initializing Cockpit Data Link...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col min-h-full space-y-8 pb-12 animate-in fade-in duration-700">
      {/* HEADER */}
      <StationHeader stationData={stationData} />

      {/* TRAFFIC LIGHT MATRIX */}
      <DomainMatrix domains={summaryData.domains} />

      {/* ACTIVE ALERTS & RISKS */}
      <AlertsPanel
        activeAlerts={summaryData.activeAlerts}
        predictiveRisks={summaryData.predictiveRisks}
        alertsList={summaryData.alertsList}
      />
    </div>
  );
}
