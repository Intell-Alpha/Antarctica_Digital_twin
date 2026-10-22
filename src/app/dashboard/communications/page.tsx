"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { Radio, WifiHigh, WifiSlash, HardDrives } from "@phosphor-icons/react";

export default function CommunicationsDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.getNetwork("BHARATI").then(setData);
  }, []);

  if (!data) return <div className="text-[#0DB9D0] font-mono text-sm uppercase tracking-widest animate-pulse">Syncing Edge Node...</div>;

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end border-b border-[#0D3040]/60 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-semibold text-white tracking-tight">Network & Edge Compute</h1>
            <ProvenanceBadge type="LIVE_SENSOR" />
          </div>
          <p className="text-[#7ABBD4] font-mono text-[11px] uppercase tracking-widest">
            ISRO C-Band Link & Store-and-Forward Queues
          </p>
        </div>
      </header>

      {/* Connectivity Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`bezel-shell p-0.5 ${data.status === 'DEGRADED' ? 'border-[#D49020]/30' : ''}`}>
          <div className="bezel-core p-6 h-full flex flex-col justify-between bg-gradient-to-b from-white/[0.02] to-transparent">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#3A6A7A] uppercase tracking-widest">Uplink Status</span>
              {data.status === "ONLINE" ? <WifiHigh size={24} className="text-[#00D4A0]" /> : <WifiSlash size={24} className="text-[#D49020]" />}
            </div>
            <div className="mt-6">
              <span className={`text-4xl font-bold tracking-tight ${data.status === 'DEGRADED' ? 'text-[#D49020]' : 'text-[#00D4A0]'}`}>
                {data.status}
              </span>
              <p className="text-[#4A7A8E] mt-2 font-mono text-xs">Latency: {data.latencyMs}ms · Bandwidth: {data.uplinkBandwidthKbps} Kbps</p>
            </div>
          </div>
        </div>

        <div className="bezel-shell p-0.5">
          <div className="bezel-core p-6 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#3A6A7A] uppercase tracking-widest">Edge Sync Engine</span>
              <HardDrives size={24} className="text-[#0DB9D0]" />
            </div>
            <div className="mt-6">
              <span className="text-4xl font-bold text-white tracking-tight">BUFFERING</span>
              <p className="text-[#4A7A8E] mt-2 font-mono text-xs">Writing to local NVMe buffer due to degraded uplink.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Store and Forward Queues */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-sm font-mono text-[#7ABBD4] uppercase tracking-widest">Prioritized Synchronization Queues</h2>
          <ProvenanceBadge type="OFFICIAL" />
        </div>
        
        <div className="bg-[#03060E] border border-[#0D3040]/50 rounded-xl overflow-hidden">
          <div className="grid grid-cols-4 px-6 py-3 border-b border-[#0D3040]/50 bg-white/[0.02] font-mono text-[10px] text-[#4A7A8E] uppercase tracking-widest">
            <div>Priority</div>
            <div>Category</div>
            <div>Queue Status</div>
            <div className="text-right">Buffer Size</div>
          </div>
          
          <div className="divide-y divide-[#0D3040]/30">
            <QueueRow priority="P0" title="Emergency / Safety Alerts" status={data.queues.P0.status} size={data.queues.P0.size} color="text-[#D93030]" bg="bg-[#D93030]/10" delay="0ms" />
            <QueueRow priority="P1" title="Critical Infrastructure Telemetry" status={data.queues.P1.status} size={data.queues.P1.size} color="text-[#0DB9D0]" bg="bg-[#0DB9D0]/10" delay="100ms" />
            <QueueRow priority="P2" title="Operational State Logs" status={data.queues.P2.status} size={data.queues.P2.size} color="text-[#D49020]" bg="bg-[#D49020]/10" delay="200ms" />
            <QueueRow priority="P3" title="Scientific Telemetry Stream" status={data.queues.P3.status} size={data.queues.P3.size} color="text-[#7B5EC8]" bg="bg-[#7B5EC8]/10" delay="300ms" />
            <QueueRow priority="P4" title="Bulk / Non-critical Video" status={data.queues.P4.status} size={data.queues.P4.size} color="text-[#3A6A7A]" bg="bg-[#3A6A7A]/10" delay="400ms" />
          </div>
        </div>
      </div>
    </div>
  );
}

function QueueRow({ priority, title, status, size, color, bg, delay }: { priority: string, title: string, status: string, size: string, color: string, bg: string, delay: string }) {
  return (
    <div 
      className="grid grid-cols-4 px-6 py-4 hover:bg-white/[0.04] transition-colors items-center animate-in slide-in-from-right-4 fade-in duration-500 fill-mode-backwards"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center gap-2">
        <span className={`font-mono font-bold text-xs ${color} ${bg} px-2 py-0.5 rounded shadow-[0_0_8px_currentColor] opacity-80`}>{priority}</span>
      </div>
      <div className="text-white text-sm">{title}</div>
      <div className="font-mono text-xs flex items-center gap-2">
        {status === "SYNCING" && (
          <div className="w-1.5 h-1.5 rounded-full bg-[#0DB9D0] shadow-[0_0_8px_#0DB9D0] animate-pulse" />
        )}
        <span className={
          status === "SYNCED" ? "text-[#00D4A0]" : 
          status === "SYNCING" ? "text-[#0DB9D0]" : 
          status === "BUFFERING" ? "text-[#D49020]" : "text-[#4A7A8E]"
        }>
          {status}
        </span>
      </div>
      <div className="text-right text-[#EBF5FC] font-mono text-sm font-semibold">{size}</div>
    </div>
  );
}
