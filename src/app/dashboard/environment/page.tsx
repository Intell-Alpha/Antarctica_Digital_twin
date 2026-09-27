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
        <MetricCard 
          label="External Temp" 
          value={data.tempC} 
          unit="°C" 
          icon={ThermometerCold} 
          iconColor="text-[#0DB9D0]" 
        />
        <MetricCard 
          label="Wind Speed (Katabatic)" 
          value={data.windSpeedKmh} 
          unit="km/h" 
          icon={Wind} 
          iconColor="text-[#D49020]" 
        />
        <MetricCard 
          label="Radiation (Gamma)" 
          value={data.radiationGammaNgyh} 
          unit="nGy/h" 
          icon={Barcode} 
          iconColor="text-[#00D4A0]" 
        />
        <MetricCard 
          label="Magnetic Field" 
          value={data.magneticFieldnT} 
          unit="nT" 
          icon={Barcode} 
          iconColor="text-[#7B5EC8]" 
        />
      </div>
    </div>
  );
}

function MetricCard({ label, value, unit, icon: Icon, iconColor }: any) {
  return (
    <div className="bezel-shell p-0.5 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(13,185,208,0.1)] group">
      <div className="bezel-core p-8 flex flex-col justify-between h-full bg-gradient-to-br from-[#040A15] to-[#0A1A2E] group-hover:bg-[#03060E] transition-colors relative overflow-hidden">
        {/* Subtle scanline overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] group-hover:opacity-[0.05] bg-[linear-gradient(transparent_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px]" />
        
        <div className="flex items-center justify-between relative z-10">
          <span className="font-mono text-xs text-[#3A6A7A] uppercase tracking-widest group-hover:text-[#4A7A8E] transition-colors">{label}</span>
          <Icon size={24} className={iconColor} />
        </div>
        
        <div className="mt-8 font-mono relative z-10">
          <div className="flex items-baseline font-bold drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:drop-shadow-[0_0_20px_rgba(13,185,208,0.3)] transition-all">
            <span className="text-6xl text-white tracking-tighter">
              {value}
            </span>
            <span className="text-2xl text-[#7ABBD4] ml-2">{unit}</span>
          </div>
          <div className="h-1 w-16 bg-white/10 mt-4 rounded-full overflow-hidden">
            <div className={`h-full w-2/3 ${iconColor.replace('text-', 'bg-')} shadow-[0_0_8px_currentColor]`} />
          </div>
        </div>
      </div>
    </div>
  );
}
