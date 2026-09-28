"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Heartbeat,
  WarningCircle,
  Thermometer,
  Lightning,
  WifiHigh,
  Drop,
  Broadcast,
  Clock,
  ShieldCheck,
  Wind,
  TerminalWindow,
  Cpu,
  ArrowLeft
} from "@phosphor-icons/react";
import { DoubleBezel } from "@/components/DoubleBezel";
import { fetchApi } from "@/lib/api-client";

interface GeneratorAsset {
  id: string;
  name: string;
  status: string;
  loadPercentage: number;
  temperatureC: number;
  freqHz: number;
}

interface TelemetryItem {
  timestamp: string;
  level: "INFO" | "WARN" | "CRITICAL";
  source: string;
  message: string;
}

export default function MissionConsole() {
  const [stationId, setStationId] = useState<"BHARATI" | "MAITRI">("BHARATI");
  const [utcTime, setUtcTime] = useState("");
  const [logs, setLogs] = useState<TelemetryItem[]>([]);
  const [generators, setGenerators] = useState<GeneratorAsset[]>([]);
  const [envTemp, setEnvTemp] = useState(-24.8);
  const [windSpeed, setWindSpeed] = useState(42);
  const [backendStatus, setBackendStatus] = useState("CONNECTING...");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Clock tick
  useEffect(() => {
    // In a real app, this would be determined by a global station selector state
    api.getStationMetadata("MAITRI").then(setStationData);
    api.getDashboardSummary("MAITRI").then(setSummaryData);
  }, []);

  // Fetch live telemetry from Express Backend API
  const syncWithBackend = async () => {
    try {
      const [telRes, energyRes] = await Promise.all([
        fetchApi<{ success: boolean; latestLog: TelemetryItem; liveStatus: any }>(`/api/telemetry?station=${stationId}`),
        fetchApi<{ success: boolean; generators: GeneratorAsset[] }>(`/api/energy?station=${stationId}`)
      ]);

      if (telRes.success) {
        setBackendStatus("LIVE (EXPRESS :5000)");
        if (telRes.liveStatus) {
          setEnvTemp(telRes.liveStatus.outsideTempC);
          setWindSpeed(telRes.liveStatus.katabaticWindKmh);
        }
        if (telRes.latestLog) {
          setLogs(prev => [...prev.slice(-20), {
            timestamp: telRes.latestLog.timestamp,
            level: telRes.latestLog.level,
            source: telRes.latestLog.source,
            message: telRes.latestLog.message
          }]);
        }
      }

      if (energyRes.success) {
        setGenerators(energyRes.generators);
      }
    } catch (err) {
      setBackendStatus("FALLBACK (LOCAL CACHE)");
    }
  };

  useEffect(() => {
    syncWithBackend();
    const interval = setInterval(syncWithBackend, 3500);
    return () => clearInterval(interval);
  }, [stationId]);

  // Auto-scroll logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const easeOut = [0.32, 0.72, 0, 1] as any;

  return (
    <main className="min-h-[100dvh] w-full bg-[#020305] text-white selection:bg-cyan-500/30 overflow-x-hidden font-sans p-4 md:p-8 pt-32 md:pt-40 relative">
      
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-luminosity"
          style={{ backgroundImage: "url('/hero-bg.jpg')", filter: "contrast(1.2) grayscale(0.5)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020305] via-[#020305]/80 to-[#020305]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#020305_100%)]" />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:64px_64px]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full space-y-8 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex items-start justify-between border-b border-[#0D3040]/60 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-semibold text-white tracking-tight">
              {stationData.id} STATION
            </h1>
            <ProvenanceBadge type="OFFICIAL" />
          </div>
          <p className="text-[#7ABBD4] font-mono text-[11px] uppercase tracking-widest">
            Commissioned {stationData.commissioningYear} · Capacity: {stationData.capacity} Personnel
          </p>
        </div>
        
        {/* TOP COMMAND BAR */}
        <motion.header initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, ease:easeOut }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0a0d14]/60 backdrop-blur-2xl border border-white/[0.08] p-5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
          <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute top-0 bottom-0 w-[20%] bg-gradient-to-r from-transparent via-white/[0.02] to-transparent skew-x-12" />
          
          <div className="flex items-center gap-5 relative z-10">
            <Link href="/" className="w-10 h-10 rounded-full bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.1] flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <ArrowLeft size={16} className="text-zinc-400 group-hover:text-white" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                <h1 className="text-base font-bold tracking-[0.2em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">Mission Operations Console</h1>
              </div>
              <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase mt-1 block">
                {stationId === "BHARATI" ? "Bharati Station · Larsemann Hills (2012)" : "Maitri Station · Schirmacher Oasis (1989)"}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 relative z-10">
            {/* STATION SWITCHER */}
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setStationId("BHARATI")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${stationId === "BHARATI" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.3)]" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                BHARATI
              </button>
              <button
                onClick={() => setStationId("MAITRI")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${stationId === "MAITRI" ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                MAITRI
              </button>
            </div>

            {/* LIVE BACKEND BADGE */}
            <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30 font-mono text-[10px] text-emerald-400 font-bold">
              <Cpu size={14} className="animate-pulse" />
              <span>BACKEND: {backendStatus}</span>
            </div>

            <div className="flex items-center gap-3 bg-black/50 px-4 py-2 rounded-lg border border-white/[0.05] shadow-inner">
              <Clock size={14} className="text-cyan-500 animate-pulse" />
              <span className="text-xs font-mono text-zinc-200 tracking-widest">{utcTime}</span>
            </div>
          </div>
        </motion.header>

        {/* MAIN TACTICAL GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLUMN 1: Vital Overviews & Logs (Span 4) */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            
            {/* Global Vitals */}
            <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.6, delay:0.1, ease:easeOut }} className="grid grid-cols-2 gap-4">
              <div className="bg-[#0a0d14]/60 backdrop-blur-xl border border-white/[0.08] p-5 rounded-2xl flex flex-col justify-between gap-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-bl-[100px] pointer-events-none" />
                <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-500 flex items-center gap-2 group-hover:text-cyan-400 transition-colors"><Thermometer size={14} className="text-cyan-400"/> Outside Temp</span>
                <div>
                  <span className="text-3xl font-mono font-bold text-white tracking-tighter drop-shadow-md">{envTemp}°C</span>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-1.5"><Heartbeat size={12} weight="fill" className="animate-pulse" /> Telemetry Live</span>
                    <span className="text-[9px] font-mono text-zinc-600">MIN -42°C</span>
                  </div>
                </div>
              </div>
              <div className="bg-[#0a0d14]/60 backdrop-blur-xl border border-white/[0.08] p-5 rounded-2xl flex flex-col justify-between gap-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-[100px] pointer-events-none" />
                <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-500 flex items-center gap-2 group-hover:text-indigo-400 transition-colors"><Wind size={14} className="text-indigo-400"/> Katabatic Wind</span>
                <div>
                  <span className="text-3xl font-mono font-bold text-white tracking-tighter drop-shadow-md">{windSpeed} <span className="text-lg text-zinc-500">km/h</span></span>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-amber-400 flex items-center gap-1.5"><WarningCircle size={12} weight="fill" /> Active</span>
                    <span className="text-[9px] font-mono text-zinc-600">MAX 180</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tactical Log Terminal */}
            <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.6, delay:0.2, ease:easeOut }} className="flex-1 min-h-[380px] flex flex-col">
              <div className="flex items-center justify-between mb-3 px-1">
                 <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-400 flex items-center gap-2">
                    <TerminalWindow size={14} className="text-cyan-500" />
                    Express Live Log Stream
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-emerald-400">HTTP /api/telemetry</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
                  </div>
              </div>
              <DoubleBezel innerClassName="h-full bg-[#020202] flex flex-col relative overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.9)] border-white/5">
                
                <div className="flex items-center gap-4 px-5 py-3 border-b border-white/[0.05] bg-[#050505] relative z-10">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500/50" />
                    <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Sys_Core / dev/ttyUSB0</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
                </div>

                <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto space-y-2.5 scroll-smooth scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent relative z-10">
                  <AnimatePresence initial={false}>
                    {logs.map((log, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-3 font-mono text-[11px] leading-relaxed group">
                        <span className="text-zinc-600 shrink-0 select-none group-hover:text-zinc-400 transition-colors">[{log.timestamp}]</span>
                        <span className={`shrink-0 w-8 ${log.level === 'WARN' ? 'text-amber-400' : 'text-cyan-400'}`}>{log.level}</span>
                        <span className="text-zinc-500 shrink-0 w-[4.5rem] uppercase tracking-wider">{log.source}</span>
                        <span className={`${log.level === 'WARN' ? 'text-amber-200' : 'text-zinc-300'} drop-shadow-md`}>
                          {log.message}
                          {i === logs.length - 1 && (
                            <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="inline-block w-2 h-3 bg-cyan-400 ml-2 align-middle" />
                          )}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </DoubleBezel>
            </motion.div>

      {/* ACTIVE ALERTS */}
      <div className="flex-1 min-h-[200px] border border-[#D93030]/30 bg-gradient-to-b from-[#D93030]/5 to-transparent rounded-2xl p-6 flex flex-col shadow-[0_0_30px_rgba(217,48,48,0.05)] relative overflow-hidden">
        {/* Subtle scanning laser line effect at top */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D93030] to-transparent opacity-50" />
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <WarningCircle size={20} className="text-[#D93030] animate-pulse" weight="fill" />
            <h2 className="font-mono text-sm uppercase tracking-widest text-[#D93030] font-bold">
              Active Priority Alerts ({summaryData.activeAlerts}) · Predictive Risks ({summaryData.predictiveRisks})
            </h2>
          </div>

          {/* COLUMN 2: Deep Systems (Span 8) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Row 1: Power & Comms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Power Core */}
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.3, ease:easeOut }} className="flex flex-col">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-400 flex items-center gap-2">
                    <Lightning size={14} className="text-amber-400" />
                    Primary Power Core ({stationId === "BHARATI" ? "MAN CHP 1-3" : "RAVI / SURYA / ADITYA"})
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono tracking-widest bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    {stationId === "BHARATI" ? "147.5 kW CHP" : "142 kW LOAD"}
                  </span>
                </div>
                <DoubleBezel innerClassName="p-6 bg-[#0a0d14]/70 backdrop-blur-xl h-full flex flex-col shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] relative overflow-hidden">
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1 relative z-10">
                    {generators.map(gen => (
                      <div key={gen.id} className="bg-[#050608]/80 border border-white/[0.05] rounded-xl p-4 flex flex-col items-center justify-between gap-4 relative overflow-hidden shadow-inner">
                        <div className="w-full flex justify-between items-center">
                          <span className={`text-[11px] font-mono font-bold tracking-widest ${gen.status==='ONLINE'?'text-white':'text-zinc-600'}`}>{gen.id}</span>
                          <div className={`w-1.5 h-1.5 rounded-full ${gen.status==='ONLINE'?'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]':'bg-zinc-700'}`} />
                        </div>
                        
                        <div className="text-center w-full pt-1 border-t border-white/[0.05]">
                          <span className={`block text-[14px] font-mono font-bold mb-0.5 ${gen.status==='ONLINE'?'text-white':'text-zinc-700'}`}>{gen.loadPercentage}<span className="text-[9px] text-zinc-500">% Load</span></span>
                          <span className={`block text-[8px] font-mono tracking-widest uppercase ${gen.status==='ONLINE'?'text-emerald-400':'text-zinc-600'}`}>{gen.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </DoubleBezel>
              </motion.div>

              {/* Satellite Link */}
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.4, ease:easeOut }} className="flex flex-col">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-400 flex items-center gap-2">
                    <WifiHigh size={14} className="text-sky-400" />
                    Orbital Uplink
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono tracking-widest bg-sky-500/10 border border-sky-500/20 text-sky-400">ISRO / NRSC SYNCED</span>
                </div>
                <DoubleBezel innerClassName="p-8 bg-[#0a0d14]/70 backdrop-blur-xl h-full flex flex-col gap-6 relative overflow-hidden">
                  <div className="flex-1 flex flex-col justify-center relative z-10">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-5xl font-mono font-bold text-white tracking-tighter">{stationId === "BHARATI" ? "42" : "58"}</span>
                      <span className="text-[11px] font-mono tracking-widest uppercase text-sky-400">ms latency</span>
                    </div>
                    
                    <div className="bg-[#050608]/80 border border-white/[0.05] rounded-xl p-4 flex items-center justify-between shadow-inner">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                          <Broadcast size={14} className="text-emerald-400 animate-pulse" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">Uplink Target</span>
                          <span className="text-xs font-mono font-bold text-white">{stationId === "BHARATI" ? "ISRO NRSC Shadnagar C-Band" : "INSAT-3DS / DROMLAN Mesh"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </DoubleBezel>
              </motion.div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
