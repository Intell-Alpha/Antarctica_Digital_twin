"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { ThermometerCold, Wind, Barcode } from "@phosphor-icons/react";

export default function EnvironmentDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.getEnvironment("MAITRI").then(setData);
  }, []);

  if (!data) return <div className="text-[#0DB9D0] font-mono text-sm uppercase tracking-widest animate-pulse">Establishing Sensor Uplink...</div>;

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end border-b border-[#0D3040]/60 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-semibold text-white tracking-tight">Environmental Telemetry</h1>
            <ProvenanceBadge type="LIVE_SENSOR" />
          </div>
          <p className="text-[#7ABBD4] font-mono text-[11px] uppercase tracking-widest">
            External Weather & Microclimate Monitors
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bezel-shell p-0.5">
          <div className="bezel-core p-8 flex flex-col justify-between h-full bg-gradient-to-br from-[#040A15] to-[#0A1A2E]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#3A6A7A] uppercase tracking-widest">External Temp</span>
              <ThermometerCold size={24} className="text-[#0DB9D0]" />
            </div>
            <div className="mt-8">
              <span className="text-6xl font-bold text-white tracking-tighter">{data.tempC}</span>
              <span className="text-2xl text-[#7ABBD4] ml-2">°C</span>
            </div>
          </div>
        </div>

        <div className="bezel-shell p-0.5">
          <div className="bezel-core p-8 flex flex-col justify-between h-full bg-gradient-to-br from-[#040A15] to-[#0A1A2E]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#3A6A7A] uppercase tracking-widest">Wind Speed (Katabatic)</span>
              <Wind size={24} className="text-[#D49020]" />
            </div>
            <div className="mt-8">
              <span className="text-6xl font-bold text-white tracking-tighter">{data.windSpeedKmh}</span>
              <span className="text-2xl text-[#7ABBD4] ml-2">km/h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
