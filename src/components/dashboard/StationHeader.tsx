"use client";

import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { Heartbeat } from "@phosphor-icons/react";

export interface StationMetadata {
  id: string;
  commissioningYear: number;
  capacity: number;
  healthScore: number;
}

interface StationHeaderProps {
  stationData: StationMetadata;
}

export function StationHeader({ stationData }: StationHeaderProps) {
  return (
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
  );
}
