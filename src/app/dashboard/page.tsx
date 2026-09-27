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

// --- Mock Data Feeds ---
const LOGS = [
  { time: "12:44:02", level: "INFO", src: "SYS_CORE", msg: "Telemetry sync established with INSAT-3DR." },
  { time: "12:44:15", level: "INFO", src: "GEN_CTRL", msg: "Generator 2 auto-throttle engaged. Load balanced." },
  { time: "12:45:01", level: "WARN", src: "ENV_MON",  msg: "Katabatic wind spike detected: Sector North." },
  { time: "12:45:18", level: "INFO", src: "HYD_SYS",  msg: "Trace heat cycle complete on Priyadarshini Line segment B." },
  { time: "12:46:05", level: "INFO", src: "SYS_CORE", msg: "Edge buffer flushed to satellite uplink." },
];

const GENERATORS = [
  { id: "G-1", status: "ONLINE", load: 78, temp: 85, freq: 50.01 },
  { id: "G-2", status: "STANDBY", load: 0, temp: 15, freq: 0 },
  { id: "G-3", status: "ONLINE", load: 64, temp: 82, freq: 50.02 },
  { id: "G-4", status: "MAINT", load: 0, temp: -5, freq: 0 },
];

export default function MissionConsole() {
  const [utcTime, setUtcTime] = useState("");
  const [logs, setLogs] = useState(LOGS);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Clock tick
  useEffect(() => {
    const tick = () => setUtcTime(new Date().toUTCString().slice(17, 25) + " UTC");
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Simulate incoming logs
  useEffect(() => {
    const msgs = ["Edge cache verifying...", "Ping ISRO NOC: 45ms", "Heater manifold active.", "Analyzing structural hum.", "GPS sync drift: 0.02ms"];
    const id = setInterval(() => {
      setLogs(prev => {
        const newLog = {
          time: new Date().toUTCString().slice(17, 25),
          level: Math.random() > 0.85 ? "WARN" : "INFO",
          src: "SYS_CORE",
          msg: msgs[Math.floor(Math.random() * msgs.length)]
        };
        return [...prev.slice(-20), newLog];
      });
    }, 3800);
    return () => clearInterval(id);
  }, []);

  const easeOut = [0.32, 0.72, 0, 1] as any;

  return (
    <main className="min-h-[100dvh] w-full bg-[#020305] text-white selection:bg-cyan-500/30 overflow-x-hidden font-sans p-4 md:p-8 pt-32 md:pt-40 relative">
      
      {/* Cinematic Photorealistic Image Background (Tied to Homepage) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-luminosity"
          style={{ backgroundImage: "url('/hero-bg.jpg')", filter: "contrast(1.2) grayscale(0.5)" }}
        />
        {/* Deep Black Gradient Overlays for blending */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020305] via-[#020305]/80 to-[#020305]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#020305_100%)]" />
        {/* Subtle grid and noise */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:64px_64px]" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto flex flex-col gap-8">
        
        {/* TOP COMMAND BAR */}
        <motion.header initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, ease:easeOut }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0a0d14]/60 backdrop-blur-2xl border border-white/[0.08] p-5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden">
          {/* Subtle top glare & animated scanline */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
          <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute top-0 bottom-0 w-[20%] bg-gradient-to-r from-transparent via-white/[0.02] to-transparent skew-x-12" />
          
          <div className="flex items-center gap-5 relative z-10">
            <Link href="/" className="w-10 h-10 rounded-full bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.1] flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <ArrowLeft size={16} className="text-zinc-400 group-hover:text-white" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.8)]" />
                <h1 className="text-base font-bold tracking-[0.2em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">Mission Console</h1>
              </div>
              <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mt-1 block">Maitri Digital Twin · Schirmacher Oasis</span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-8 relative z-10">
            <div className="flex items-center gap-3 bg-black/50 px-4 py-2 rounded-lg border border-white/[0.05] shadow-inner">
              <Clock size={14} className="text-cyan-500 animate-pulse" />
              <span className="text-xs font-mono text-zinc-200 tracking-widest">{utcTime}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Survivability Index</span>
              <div className="relative group cursor-default">
                <div className="absolute inset-0 bg-emerald-500/20 blur-md rounded-full group-hover:bg-emerald-500/40 transition-all" />
                <span className="relative px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider bg-[#0a0d14] text-emerald-400 border border-emerald-500/30 flex items-center gap-2">
                  <ShieldCheck size={14} weight="fill" />
                  142 DAYS TTCF
                </span>
              </div>
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
                  <span className="text-3xl font-mono font-bold text-white tracking-tighter drop-shadow-md">-24.8°C</span>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-1.5"><Heartbeat size={12} weight="fill" className="animate-pulse" /> Stable</span>
                    <span className="text-[9px] font-mono text-zinc-600">MIN -42°C</span>
                  </div>
                </div>
              </div>
              <div className="bg-[#0a0d14]/60 backdrop-blur-xl border border-white/[0.08] p-5 rounded-2xl flex flex-col justify-between gap-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-[100px] pointer-events-none" />
                <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-500 flex items-center gap-2 group-hover:text-indigo-400 transition-colors"><Wind size={14} className="text-indigo-400"/> Katabatic</span>
                <div>
                  <span className="text-3xl font-mono font-bold text-white tracking-tighter drop-shadow-md">42 <span className="text-lg text-zinc-500">km/h</span></span>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-amber-400 flex items-center gap-1.5"><WarningCircle size={12} weight="fill" /> Rising</span>
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
                    Live Telemetry Stream
                  </span>
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
                  </div>
              </div>
              <DoubleBezel innerClassName="h-full bg-[#020202] flex flex-col relative overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.9)] border-white/5">
                
                {/* Terminal Header */}
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
                        <span className="text-zinc-600 shrink-0 select-none group-hover:text-zinc-400 transition-colors">[{log.time}]</span>
                        <span className={`shrink-0 w-8 ${log.level === 'WARN' ? 'text-amber-400' : 'text-cyan-400'}`}>{log.level}</span>
                        <span className="text-zinc-500 shrink-0 w-[4.5rem] uppercase tracking-wider">{log.src}</span>
                        <span className={`${log.level === 'WARN' ? 'text-amber-200' : 'text-zinc-300'} drop-shadow-md`}>
                          {log.msg}
                          {/* Blinking cursor on the last log */}
                          {i === logs.length - 1 && (
                            <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="inline-block w-2 h-3 bg-cyan-400 ml-2 align-middle" />
                          )}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Retro CRT Glass reflections & Scanlines */}
                <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.3)_2px,rgba(0,0,0,0.3)_4px)] z-20" />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/[0.03] to-transparent h-1/2 z-20" />
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)] z-20" />
              </DoubleBezel>
            </motion.div>

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
                    Primary Power Core
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono tracking-widest bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]">118 kW LOAD</span>
                </div>
                <DoubleBezel innerClassName="p-6 bg-[#0a0d14]/70 backdrop-blur-xl h-full flex flex-col shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] relative overflow-hidden group hover:border-amber-500/20 transition-colors">
                  
                  {/* Subtle grid bg inside card */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:20px_20px] pointer-events-none opacity-50" />

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1 relative z-10">
                    {GENERATORS.map(gen => (
                      <div key={gen.id} className="bg-[#050608]/80 border border-white/[0.05] rounded-xl p-4 flex flex-col items-center justify-between gap-4 relative overflow-hidden group/gen hover:border-white/[0.1] transition-colors shadow-inner">
                        
                        <div className="w-full flex justify-between items-center">
                          <span className={`text-[11px] font-mono font-bold tracking-widest ${gen.status==='ONLINE'?'text-white':gen.status==='MAINT'?'text-rose-500':'text-zinc-600'}`}>{gen.id}</span>
                          <div className={`w-1.5 h-1.5 rounded-full ${gen.status==='ONLINE'?'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]':gen.status==='MAINT'?'bg-rose-500':'bg-zinc-700'}`} />
                        </div>
                        
                        <div className="flex w-full items-end justify-center gap-3">
                          {/* Left Stats */}
                          <div className="flex flex-col gap-2 pb-2">
                             <div className="flex flex-col">
                               <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest leading-none">FREQ</span>
                               <span className={`text-[9px] font-mono font-medium ${gen.status==='ONLINE'?'text-zinc-300':'text-zinc-700'}`}>{gen.freq.toFixed(2)}</span>
                             </div>
                             <div className="flex flex-col">
                               <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest leading-none">TEMP</span>
                               <span className={`text-[9px] font-mono font-medium ${gen.status==='ONLINE'?'text-zinc-300':'text-zinc-700'}`}>{gen.temp}°C</span>
                             </div>
                          </div>

                          {/* Custom High-End Meter */}
                          <div className="w-8 h-32 bg-black rounded-sm relative overflow-hidden border border-white/[0.05] shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] shrink-0">
                            {/* Segments background */}
                            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.05)_2px,rgba(255,255,255,0.05)_4px)]" />
                            
                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${gen.load}%` }}
                              transition={{ duration: 2, ease: "easeOut" }}
                              className={`absolute bottom-0 w-full flex flex-col justify-end ${gen.status==='ONLINE' ? 'bg-gradient-to-t from-amber-600 to-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.6)]' : 'bg-transparent'}`}
                            >
                              {/* Segments foreground overlay to make it look like separate LEDs */}
                              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.7),rgba(0,0,0,0.7)_2px,transparent_2px,transparent_4px)] mix-blend-overlay" />
                            </motion.div>
                          </div>
                        </div>
                        
                        <div className="text-center w-full pt-1 border-t border-white/[0.05]">
                          <span className={`block text-[13px] font-mono font-bold mb-0.5 ${gen.status==='ONLINE'?'text-white':'text-zinc-700'}`}>{gen.load}<span className="text-[9px] text-zinc-500">%</span></span>
                          <span className={`block text-[8px] font-mono tracking-widest uppercase ${gen.status==='ONLINE'?'text-emerald-400':gen.status==='MAINT'?'text-rose-500':'text-zinc-600'}`}>{gen.status}</span>
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
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono tracking-widest bg-sky-500/10 border border-sky-500/20 text-sky-400">ISRO SYNCED</span>
                </div>
                <DoubleBezel innerClassName="p-8 bg-[#0a0d14]/70 backdrop-blur-xl h-full flex flex-col gap-6 relative overflow-hidden group hover:border-sky-500/20 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  
                  {/* Decorative animated radar rings */}
                  <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full border border-sky-500/10 pointer-events-none flex items-center justify-center">
                    <div className="w-56 h-56 rounded-full border border-sky-500/10 flex items-center justify-center">
                       <div className="w-32 h-32 rounded-full border border-sky-500/5" />
                    </div>
                    {/* Rotating radar sweep */}
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0"
                    >
                      <div className="absolute top-1/2 left-1/2 w-[50%] h-[1px] origin-left bg-gradient-to-r from-sky-500/40 to-transparent" />
                      {/* Trailing wedge */}
                      <div className="absolute top-1/2 left-1/2 w-[50%] h-[50%] origin-top-left bg-[conic-gradient(from_90deg_at_0_0,transparent_0deg,rgba(14,165,233,0.1)_90deg)]" />
                    </motion.div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center relative z-10 mt-4">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-6xl font-mono font-bold text-white tracking-tighter drop-shadow-lg">42</span>
                      <span className="text-[11px] font-mono tracking-widest uppercase text-sky-400">ms latency</span>
                    </div>
                    
                    <div className="space-y-6 mt-8">
                      <div>
                        <div className="flex justify-between text-[10px] font-mono tracking-widest uppercase mb-2">
                          <span className="text-zinc-400">Edge NVMe Buffer</span>
                          <span className="text-sky-400 font-bold">12% Used</span>
                        </div>
                        <div className="h-2 w-full bg-black border border-white/[0.05] rounded-full overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] p-[1px]">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "12%" }}
                            transition={{ duration: 1.5, ease: easeOut }}
                            className="h-full bg-gradient-to-r from-sky-600 to-sky-400 rounded-full relative overflow-hidden"
                          >
                             {/* Barber pole animation */}
                             <motion.div 
                               animate={{ backgroundPosition: ["0px 0px", "20px 0px"] }}
                               transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                               className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] w-[200%]" 
                             />
                          </motion.div>
                        </div>
                      </div>
                      
                      <div className="bg-[#050608]/80 border border-white/[0.05] rounded-xl p-4 flex items-center justify-between group-hover:bg-white/[0.02] transition-colors shadow-inner">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Broadcast size={14} className="text-emerald-400 animate-pulse" />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">Next Sat Window</span>
                            <span className="text-sm font-mono font-bold tracking-wider text-white">INSAT-3DS</span>
                          </div>
                        </div>
                        <div className="text-right flex flex-col gap-0.5">
                          <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-400">T-Minus</span>
                          <span className="text-xs font-mono font-bold text-white">45:00</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </DoubleBezel>
              </motion.div>

            </div>

            {/* Row 2: Hydrology & Freeze Horizon */}
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.5, ease:easeOut }} className="flex flex-col">
              <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-400 flex items-center gap-2">
                    <Drop size={14} className="text-cyan-400" weight="fill" />
                    Hydrology: Priyadarshini Line
                  </span>
                  <div className="flex gap-4">
                     <span className="text-[9px] font-mono tracking-widest text-zinc-500">HEAT: <span className="text-amber-400">18kW</span></span>
                     <span className="text-[9px] font-mono tracking-widest text-zinc-500">FLOW: <span className="text-white">42.8 L/m</span></span>
                  </div>
              </div>
              <DoubleBezel innerClassName="p-8 bg-[#0a0d14]/70 backdrop-blur-xl flex flex-col shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-cyan-500/20 transition-colors">
                
                {/* Advanced Pipeline visualizer */}
                <div className="relative h-32 mt-2 bg-[#050608] border border-white/[0.05] rounded-2xl overflow-hidden flex items-center px-8 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
                  
                  {/* Technical Background Pattern */}
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:32px_32px]" />
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(255,255,255,0.01)_2px,rgba(255,255,255,0.01)_4px)]" />
                  
                  <div className="relative w-full h-4 bg-black border border-white/[0.1] rounded-full p-[1.5px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
                    {/* Heated segment */}
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "85%" }}
                      transition={{ duration: 2.5, ease: easeOut, delay: 0.2 }}
                      className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyan-500 via-amber-400 to-amber-500 rounded-full overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                    >
                      {/* Flowing water/heat animation inside the pipe */}
                      <motion.div 
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent)] w-1/3"
                      />
                      {/* Bubbles / particles */}
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxjaXJjbGUgY3g9IjMiIGN5PSIzIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMykiLz48L3N2Zz4=')] opacity-50 mix-blend-overlay" />
                    </motion.div>
                    
                    {/* Pipeline markers with labels underneath */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-[10%] z-10 flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full bg-[#050608] border-[4px] border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-200" />
                      </div>
                      <span className="absolute top-8 text-[9px] font-mono tracking-widest text-cyan-400 bg-[#050608]/80 px-2 py-1 rounded backdrop-blur whitespace-nowrap border border-cyan-500/20 shadow-md">PUMP A</span>
                    </div>
                    
                    <div className="absolute top-1/2 -translate-y-1/2 left-[50%] z-10 flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full bg-[#050608] border-[4px] border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)] flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-200" />
                      </div>
                      <span className="absolute top-8 text-[9px] font-mono tracking-widest text-amber-400 bg-[#050608]/80 px-2 py-1 rounded backdrop-blur whitespace-nowrap border border-amber-500/20 shadow-md">HTR JUNC</span>
                    </div>
                    
                    <div className="absolute top-1/2 -translate-y-1/2 left-[85%] z-10 flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full bg-[#050608] border-[4px] border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] flex items-center justify-center animate-pulse">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-200" />
                      </div>
                      <span className="absolute top-8 text-[9px] font-mono tracking-widest text-emerald-400 bg-[#050608]/80 px-2 py-1 rounded backdrop-blur whitespace-nowrap border border-emerald-500/20 shadow-md">STATION INT</span>
                    </div>
                  </div>
                </div>
              </DoubleBezel>
            </motion.div>

          </div>
        </div>

      </div>
    </main>
  );
}
