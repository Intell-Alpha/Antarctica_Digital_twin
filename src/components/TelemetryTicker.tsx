"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

interface TelemetryTickerProps {
  delay?: number;
  duration?: number;
}

export function TelemetryTicker({ delay = 0.9, duration = 0.45 }: TelemetryTickerProps) {
  const [maitriData, setMaitriData] = useState<any>(null);
  const [bharatiData, setBharatiData] = useState<any>(null);
  const [latency, setLatency] = useState(0);

  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      const start = performance.now();
      const [m, b] = await Promise.all([
        api.getEnvironment("MAITRI"),
        api.getEnvironment("BHARATI")
      ]);
      const ping = Math.round(performance.now() - start);

      if (mounted) {
        if (m) setMaitriData(m);
        if (b) setBharatiData(b);
        setLatency(ping);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay }}
      className="absolute bottom-0 left-0 right-0 border-t border-[#0DB9D0]/20 bg-[#03060E]/40 backdrop-blur-xl z-20 flex overflow-x-auto no-scrollbar shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
    >
      <div className="flex items-center justify-between h-12 px-6 sm:px-10 lg:px-16 w-full max-w-7xl mx-auto font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#4A7A8E] whitespace-nowrap gap-8">
        
        {/* Connection Status */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00D4A0] shadow-[0_0_10px_#00D4A0] animate-pulse" />
          <span className="text-[#0DB9D0] font-semibold">UPLINK SECURE</span>
          <span className="opacity-50">|</span>
          <span className={latency < 100 ? "text-[#00D4A0]" : "text-[#D49020]"}>{latency || 58}MS</span>
        </div>

        {/* Space filler for flex */}
        <div className="hidden md:block flex-1" />

        <div className="flex items-center gap-8 shrink-0">
          {/* Maitri Quick Stats */}
          <div className="flex items-center gap-4">
            <span className="text-[#EBF5FC] font-bold">MAITRI:</span>
            <span>{maitriData?.tempC ?? "-22.4"}°C</span>
            <span className="opacity-30">/</span>
            <span>{maitriData?.windSpeedKmh ?? "38.5"} KM/H WIND</span>
          </div>

          <div className="hidden sm:block w-px h-4 bg-[#0DB9D0]/30" />

          {/* Bharati Quick Stats */}
          <div className="flex items-center gap-4">
            <span className="text-[#EBF5FC] font-bold">BHARATI:</span>
            <span>{bharatiData?.tempC ?? "-18.2"}°C</span>
            <span className="opacity-30">/</span>
            <span>{bharatiData?.windSpeedKmh ?? "45.0"} KM/H WIND</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
