"use client";

import React from "react";
import { useNetwork } from "@/context/NetworkContext";
import { Database, Radio } from "@phosphor-icons/react";

export function MockDataBadge() {
  const { isOnline, isUsingCachedData } = useNetwork();

  if (isOnline && !isUsingCachedData) {
    return (
      <div className="flex items-center gap-2 px-2.5 py-1 bg-[#00D4A0]/10 border border-[#00D4A0]/30 rounded-full text-[#00D4A0] font-mono text-[9px] uppercase tracking-widest backdrop-blur-md shadow-[0_0_12px_rgba(0,212,160,0.15)]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00D4A0] shadow-[0_0_6px_#00D4A0] animate-pulse" />
        <span className="font-semibold">Live Telemetry</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-2.5 py-1 bg-[#D49020]/15 border border-[#D49020]/40 rounded-full text-[#D49020] font-mono text-[9px] uppercase tracking-widest backdrop-blur-md shadow-[0_0_12px_rgba(212,144,32,0.25)] animate-pulse">
      <Database size={11} className="text-[#D49020]" />
      <span className="font-semibold">Offline · Local Twin</span>
    </div>
  );
}
