"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowUpRight,
  Thermometer,
  WifiHigh,
  Waves,
  Lightning,
  Globe,
  Flask,
  SlidersHorizontal,
  ShieldCheck,
  Wind,
  Sparkle,
  Crosshair,
  Cube,
  Database,
  TreeStructure,
  HardDrives,
  Warning,
  Radio,
  House,
  CaretDown,
  CalendarCheck,
  Sun,
  MoonStars,
  Broadcast,
  BatteryCharging,
  ArrowRight,
} from "@phosphor-icons/react";
import { DoubleBezel } from "@/components/DoubleBezel";

interface SystemNode {
  id: string; label: string; tag: string; x: number; y: number; icon: any;
  color: string; primary: string; primaryLabel: string; secondary: string; rate: string;
  status: "nominal" | "warning" | "alert";
}

const NODES: SystemNode[] = [
  { id: "gen",    label: "Powerhouse",         tag: "Energy",    x: 48, y: 50, icon: Lightning,       color: "amber",   primary: "118.4 kW",  primaryLabel: "Microgrid Load",  secondary: "415V · 50.02 Hz", rate: "64% Capacity",      status: "nominal" },
  { id: "water",  label: "Priyadarshini Line",  tag: "Hydrology", x: 20, y: 28, icon: Waves,           color: "cyan",    primary: "+3.6°C",    primaryLabel: "Intake Temp",     secondary: "42.8 L/min",      rate: "Trace Heat: 18.2 kW", status: "nominal" },
  { id: "habitat",label: "Habitat Module",      tag: "Habitat",   x: 66, y: 40, icon: House,           color: "indigo",  primary: "+21.4°C",   primaryLabel: "Internal HVAC",   secondary: "480 ppm CO2",     rate: "25 Crew Safe",      status: "nominal" },
  { id: "fuel",   label: "Fuel Farm",           tag: "Reserves",  x: 78, y: 68, icon: BatteryCharging, color: "emerald", primary: "142,800 L", primaryLabel: "Arctic HSD",      secondary: "248 Days",        rate: "91% Tank Level",    status: "nominal" },
  { id: "sat",    label: "Sat Gateway",         tag: "Network",   x: 40, y: 74, icon: WifiHigh,        color: "sky",     primary: "SYNCED",    primaryLabel: "Mainland State",  secondary: "0 Queue",         rate: "< 40ms Latency",    status: "nominal" },
];

const SAT_WINDOWS = [
  { sat: "INSAT-3DR", window: "01:14-01:32 UTC", quality: "STRONG",   color: "emerald" },
  { sat: "INSAT-3DS", window: "03:47-04:02 UTC", quality: "MODERATE", color: "amber"   },
  { sat: "EDUSAT",    window: "06:22-06:38 UTC", quality: "STRONG",   color: "emerald" },
  { sat: "INSAT-3DR", window: "09:58-10:14 UTC", quality: "WEAK",     color: "rose"    },
  { sat: "INSAT-3DS", window: "13:31-13:49 UTC", quality: "STRONG",   color: "emerald" },
  { sat: "EDUSAT",    window: "16:05-16:21 UTC", quality: "MODERATE", color: "amber"   },
  { sat: "INSAT-3DR", window: "19:44-20:00 UTC", quality: "STRONG",   color: "emerald" },
  { sat: "INSAT-3DS", window: "22:18-22:34 UTC", quality: "WEAK",     color: "rose"    },
];

const CAPABILITIES = [
  { icon: HardDrives,  color: "cyan",    tag: "Edge Autonomy",  title: "90-Day Offline Edge Survivability",  desc: "Katabatic blizzards sever satellite links. The NVMe edge buffer sustains complete autonomous twin operations and re-syncs with zero data loss on reconnection." },
  { icon: ShieldCheck, color: "emerald", tag: "Provenance",     title: "Source-Aware Data Model",            desc: "Every data point carries a provenance tag: OFFICIAL (NCPOR logbooks), LIVE_SENSOR (PLCs), DOCUMENTARY (visual walk-through), or SIMULATED (physics engine)." },
  { icon: Flask,       color: "rose",    tag: "Counterfactual", title: "Physics-Coupled What-If Engine",     desc: "Monte Carlo blizzard stress tests calculate wind-chill, trace-heat demand, diesel burn, and freeze-horizon before any storm arrives at the station." },
];

const MILESTONES = [
  { year: "1981", title: "First Indian Antarctic Expedition", badge: "Foundation",       desc: "Launched under Dr. S.Z. Qasim, inaugurating India's permanent polar research." },
  { year: "1989", title: "Maitri Station Commissioned",       badge: "Permanent Outpost",desc: "Built on Schirmacher Oasis. Operating continuously for 37+ years." },
  { year: "2006", title: "Lake Priyadarshini Intake",         badge: "Life-Support",     desc: "2.5 km trace-heated pipeline securing year-round freshwater survival supply." },
  { year: "2026", title: "Cyber-Physical Living Twin",        badge: "Current",          desc: "NCPOR / MoES IoT edge telemetry, physics simulation, offline-autonomous twin." },
];

export default function LandingPage() {
  const [utcTime, setUtcTime]           = useState("");
  const [activeNode, setActiveNode]     = useState<SystemNode>(NODES[0]);
  const [cockpitFilter, setCockpitFilter] = useState<"all"|"energy"|"hydrology"|"network">("all");
  const [mousePos, setMousePos]         = useState({ x: 0, y: 0 });
  const [simTemp, setSimTemp]           = useState(-24);
  const [simWind, setSimWind]           = useState(85);
  const [simGens, setSimGens]           = useState(2);
  const [activeProvenance, setActiveProvenance] = useState<"OFFICIAL"|"LIVE_SENSOR"|"DOCUMENTARY"|"SIMULATED">("OFFICIAL");
  const mainRef = useRef<HTMLElement>(null);

  const getPolarStatus = () => {
    const now = new Date();
    const day = Math.floor((now.getTime() - new Date(now.getUTCFullYear(), 0, 0).getTime()) / 86400000);
    const inNight = day >= 140 && day <= 203;
    return {
      inNight,
      label: inNight ? "Polar Night Active" : "Antarctic Daylight",
      detail: inNight ? `${203 - day}d until sunrise` : `${day < 140 ? 140 - day : 365 - day + 140}d to polar night`,
    };
  };

  useEffect(() => {
    const tick = () => setUtcTime(new Date().toUTCString().slice(17, 25) + " UTC");
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (mainRef.current) {
        const r = mainRef.current.getBoundingClientRect();
        setMousePos({ x: e.clientX - r.left, y: e.clientY - r.top });
      }
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const windChill  = Math.round(13.12 + 0.6215 * simTemp - 11.37 * Math.pow(Math.max(simWind,5),0.16) + 0.3965 * simTemp * Math.pow(Math.max(simWind,5),0.16));
  const traceHeat  = Math.round(Math.max(8, 12 + Math.abs(simTemp)*0.45 + (simWind/30)*4));
  const fuelBurn   = Math.round(520 + Math.abs(simTemp)*6.5 + (simWind/20)*12 + simGens*80);
  const freezeMins = Math.max(18, Math.round(140 - Math.abs(simTemp)*2.2 - simWind*0.45));
  const critical   = freezeMins < 45 || simGens === 0;

  const filteredNodes = NODES.filter(n =>
    cockpitFilter === "all"      ? true :
    cockpitFilter === "energy"   ? ["gen","fuel"].includes(n.id) :
    cockpitFilter === "hydrology"? ["water","habitat"].includes(n.id) :
    ["sat","habitat"].includes(n.id)
  );

  const polar    = getPolarStatus();
  const easeOut  = [0.32, 0.72, 0, 1] as any;

  return (
    <main ref={mainRef} className="min-h-[100dvh] w-full bg-[#050507] text-white selection:bg-cyan-500/30 overflow-x-hidden">

      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0" style={{ background: `radial-gradient(ellipse 900px 600px at ${mousePos.x}px ${mousePos.y}px, rgba(34,211,238,0.055) 0%, rgba(99,102,241,0.03) 50%, transparent 80%)` }} />
      {/* Dot grid */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.055]" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.7) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

      {/* ═══ HERO (Cinematic Immersive) ═══ */}
      <section className="relative w-full h-[100dvh] flex flex-col justify-center overflow-hidden">
        
        {/* Cinematic Photorealistic Image Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Base Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
            style={{ backgroundImage: "url('/hero-bg.jpg')" }}
          />
          
          {/* Deep Black Gradient Overlays for blending */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-[#050507]/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050507] via-transparent to-[#050507]" />
          
          {/* Subtle noise over the image to tie it to the UI */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }} />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-5 max-w-[1440px] mx-auto w-full mt-[-10vh]">
          
          <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ duration:1, ease:easeOut }} className="flex items-center gap-3 mb-8">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span className="text-xs md:text-sm font-mono tracking-[0.3em] uppercase text-cyan-400 font-semibold drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
              Maitri Digital Twin
            </span>
            <span className="text-xs font-mono text-zinc-500 tracking-widest hidden sm:inline">· 70°45′58″ S</span>
          </motion.div>

          <motion.h1 initial={{ opacity:0, y:30, filter: "blur(10px)" }} animate={{ opacity:1, y:0, filter: "blur(0px)" }} transition={{ duration:1.2, delay:0.2, ease:easeOut }} className="text-[3.5rem] sm:text-[5rem] md:text-[6.5rem] lg:text-[8.5rem] font-bold tracking-[-0.04em] leading-[0.9] text-white mix-blend-plus-lighter">
            Absolute <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-700">Awareness.</span>
          </motion.h1>

          <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:1, delay:0.4, ease:easeOut }} className="mt-8 text-base md:text-lg lg:text-xl text-zinc-400 max-w-2xl font-light leading-relaxed">
            11,000 km from civilization. Surviving −40°C blizzards through <strong className="text-zinc-200 font-medium">IoT telemetry</strong> and <strong className="text-zinc-200 font-medium">physics prediction</strong>.
          </motion.p>

          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:1, delay:0.6, ease:easeOut }} className="mt-12 flex flex-col sm:flex-row items-center gap-4">
            <Link href="/dashboard" className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-white text-black font-semibold text-sm transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white via-cyan-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10">Initialize Console</span>
              <span className="relative z-10 w-6 h-6 rounded-full bg-black/10 flex items-center justify-center transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowUpRight size={13} weight="bold" />
              </span>
            </Link>
            <a href="#simulator" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-white font-medium text-sm transition-all duration-500 backdrop-blur-md">
              <Flask size={16} /> Run Simulations
            </a>
          </motion.div>
        </div>

        {/* Bottom Glass Vitals Bar */}
        <motion.div initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} transition={{ duration:1, delay:0.8, ease:easeOut }} className="absolute bottom-6 left-5 right-5 md:left-10 md:right-10 z-20">
          <div className="max-w-[1440px] mx-auto rounded-3xl bg-black/40 backdrop-blur-3xl border border-white/10 p-4 md:p-6 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            
            {/* Left: Polar Status & Time */}
            <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-start">
              <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border font-mono text-[10px] md:text-xs ${polar.inNight ? "bg-indigo-950/40 border-indigo-500/25 text-indigo-200" : "bg-amber-950/30 border-amber-500/20 text-amber-200"}`}>
                {polar.inNight ? <MoonStars size={16} className="text-indigo-400" weight="fill" /> : <Sun size={16} className="text-amber-400" weight="fill" />}
                <div className="flex flex-col">
                  <span className="uppercase tracking-wider font-semibold">{polar.label}</span>
                  <span className="opacity-70 text-[9px]">{polar.detail}</span>
                </div>
              </div>
              <div className="flex flex-col text-right lg:text-left">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">System Clock</span>
                <span className="text-sm font-mono text-zinc-300">{utcTime}</span>
              </div>
            </div>

            <div className="hidden lg:block w-px h-10 bg-white/10" />

            {/* Right: Key Vitals */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-8 w-full lg:w-auto flex-1">
              {([
                { Icon: Thermometer, color: "text-cyan-400",   label: "Ambient", val: "−18.4°C" },
                { Icon: Wind,        color: "text-indigo-400", label: "Katabatic", val: "64 km/h"  },
                { Icon: Lightning,   color: "text-amber-400",  label: "Microgrid", val: "118 kW"   },
                { Icon: Waves,       color: "text-sky-400",    label: "Hydrology", val: "42.8 L/m" },
              ] as const).map(({ Icon, color, label, val }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center ${color} shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{label}</span>
                    <span className="text-sm md:text-base font-mono font-semibold text-white">{val}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </motion.div>

      </section>

      {/* ═══ CAPABILITIES ═══ */}
      <section className="relative z-10 py-28 px-5 md:px-10 max-w-[1440px] mx-auto">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-80px"}} transition={{duration:0.7,ease:easeOut}} className="mb-12">
          <div className="flex items-center gap-2 mb-3"><span className="h-px w-8 bg-indigo-400" /><span className="text-[10px] font-mono uppercase tracking-[0.2em] text-indigo-400">Core Capabilities</span></div>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.025em] text-white max-w-3xl leading-[1.08]">
            Engineered Beyond<br /><span className="text-zinc-500">Traditional SCADA.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <motion.div initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-60px"}} transition={{duration:0.7,ease:easeOut}} className="md:col-span-7">
            <DoubleBezel innerClassName="p-8 md:p-10 h-full flex flex-col gap-8 bg-gradient-to-br from-indigo-950/25 via-[#070810] to-cyan-950/20 min-h-[340px]">
              <div>
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                    <TreeStructure size={26} weight="fill" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider bg-white/[0.04] border border-white/[0.08] text-zinc-400">Semantic Graph</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold text-white tracking-[-0.02em] mb-4">Continuous Cross-Domain<br />Dependency Tracking</h3>
                <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-xl">
                  Unlike isolated SCADA alarms, the twin models the entire station as one interconnected organism. When Generator 2 sheds load, it instantly traces: Switchboard B depower → Trace Heating Circuit B offline → Lake Priyadarshini water freeze-up in{" "}
                  <span className="text-white font-medium">45 minutes</span>.
                </p>
              </div>
              <div className="mt-auto">
                <span className="text-[9px] font-mono uppercase text-zinc-600 mb-3 block">Live Cascade Sequence</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { step:"01", title:"Gen-Set 2 Trip",      c:"border-rose-500/25 text-rose-400"     },
                    { step:"02", title:"Switchboard B Shed",  c:"border-amber-500/25 text-amber-400"   },
                    { step:"03", title:"Trace Heat Rerouted", c:"border-emerald-500/25 text-emerald-400"},
                  ].map(({step,title,c})=>(
                    <div key={step} className={`p-3 rounded-xl border text-left bg-white/[0.02] ${c.split(" ")[0]}`}>
                      <span className="text-[9px] text-zinc-600 font-mono block">{step}</span>
                      <span className={`text-xs font-semibold mt-1 block ${c.split(" ")[1]}`}>{title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </DoubleBezel>
          </motion.div>

          <div className="md:col-span-5 flex flex-col gap-4">
            {CAPABILITIES.map((cap,i) => {
              const Icon = cap.icon;
              return (
                <motion.div key={cap.tag} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-40px"}} transition={{duration:0.6,delay:i*0.08,ease:easeOut}}>
                  <DoubleBezel innerClassName="p-6 flex flex-col gap-4 bg-[#06070d]">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-zinc-400"><Icon size={20} weight="fill" /></div>
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-mono uppercase bg-white/[0.04] border border-white/[0.07] text-zinc-500">{cap.tag}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white tracking-[-0.015em] mb-1.5">{cap.title}</h3>
                      <p className="text-zinc-500 text-xs leading-relaxed">{cap.desc}</p>
                    </div>
                  </DoubleBezel>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ SIMULATOR ═══ */}
      <section id="simulator" className="relative z-10 py-28 px-5 md:px-10 max-w-[1440px] mx-auto">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-80px"}} transition={{duration:0.7,ease:easeOut}} className="mb-12">
          <div className="flex items-center gap-2 mb-3"><span className="h-px w-8 bg-rose-400" /><span className="text-[10px] font-mono uppercase tracking-[0.2em] text-rose-400">Interactive Engine</span></div>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.025em] text-white max-w-3xl leading-[1.08]">Stress-Test Extreme<br /><span className="text-zinc-500">Antarctic Storms. Live.</span></h2>
          <p className="text-zinc-500 text-sm md:text-base mt-4 max-w-xl">Drag the sliders. The physics engine recalculates wind-chill, trace-heating demand, diesel burn, and freeze horizon in real time.</p>
        </motion.div>

        <motion.div initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-60px"}} transition={{duration:0.75,ease:easeOut}}>
          <DoubleBezel innerClassName="p-8 md:p-12 bg-gradient-to-tr from-rose-950/15 via-[#070810] to-indigo-950/15">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div className="flex flex-col gap-7">
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2"><SlidersHorizontal size={14} className="text-rose-400" />Environmental Variables</span>
                  <button onClick={()=>{setSimTemp(-35);setSimWind(150);setSimGens(1);}} className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 underline transition-colors">Preset: Severe Blizzard</button>
                </div>
                {[
                  { label:"Ambient Temperature", unit:`${simTemp}°C`,     min:-45, max:5,   val:simTemp, set:setSimTemp, lo:"-45°C Extreme Winter", hi:"+5°C Summer",            accent:"accent-cyan-400"   },
                  { label:"Katabatic Wind Speed", unit:`${simWind} km/h`, min:0,   max:220, val:simWind, set:setSimWind, lo:"Calm",                 hi:"220 km/h Catastrophic",  accent:"accent-indigo-400" },
                ].map(s=>(
                  <div key={s.label} className="space-y-2.5">
                    <div className="flex justify-between text-xs font-mono"><span className="text-zinc-400">{s.label}</span><span className="text-white font-semibold">{s.unit}</span></div>
                    <input type="range" min={s.min} max={s.max} step={1} value={s.val} onChange={e=>s.set(Number(e.target.value))} className={`w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer ${s.accent}`} />
                    <div className="flex justify-between text-[10px] font-mono text-zinc-600"><span>{s.lo}</span><span>{s.hi}</span></div>
                  </div>
                ))}
                <div className="space-y-2.5">
                  <div className="flex justify-between text-xs font-mono"><span className="text-zinc-400">Active Cummins Gen-Sets</span><span className="text-white font-semibold">{simGens} / 4 Online</span></div>
                  <div className="grid grid-cols-4 gap-2">
                    {[1,2,3,4].map(n=>(
                      <button key={n} onClick={()=>setSimGens(n)} className={`py-2.5 rounded-xl border text-[10px] font-mono transition-all duration-300 ${simGens===n?"bg-white/[0.12] border-white/20 text-white font-bold":"bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:text-white"}`}>
                        {n===1?"1 EM":`${n}×`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Twin Physics Prognosis</span>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label:"Wind Chill",    val:`${windChill}°C`,    sub:"Surface convection",    color:"text-cyan-300",                                              bg:"" },
                    { label:"Trace Heat",    val:`${traceHeat} kW`,   sub:"Pipeline thermal req.", color:"text-amber-300",                                             bg:"" },
                    { label:"Freeze Horizon",val:`${freezeMins} min`, sub:critical?"URGENT: Pipe freeze":"Safe fluid flow", color:critical?"text-rose-400":"text-emerald-400", bg:critical?"bg-rose-950/25":"" },
                    { label:"Fuel Burn",     val:`${fuelBurn} L/d`,   sub:`~${Math.round(142800/fuelBurn)}d autonomy`,  color:"text-white",                         bg:"" },
                  ].map(({label,val,sub,color,bg})=>(
                    <div key={label} className={`p-5 rounded-2xl border border-white/[0.06] flex flex-col gap-2 bg-white/[0.02] ${bg}`}>
                      <span className="text-[10px] font-mono text-zinc-500">{label}</span>
                      <span className={`text-3xl font-mono font-semibold ${color}`}>{val}</span>
                      <span className="text-[10px] font-mono text-zinc-500">{sub}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-2">
                  <Link href="/simulations" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/10 border border-white/[0.08] text-xs font-mono text-white transition-all duration-300">
                    <Flask size={13} /><span>Full Simulation Studio</span><ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            </div>
          </DoubleBezel>
        </motion.div>
      </section>

      {/* ═══ PROVENANCE + HERITAGE ═══ */}
      <section className="relative z-10 py-28 px-5 md:px-10 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{opacity:0,x:-20}} whileInView={{opacity:1,x:0}} viewport={{once:true,margin:"-60px"}} transition={{duration:0.7,ease:easeOut}}>
            <DoubleBezel innerClassName="p-8 md:p-10 h-full flex flex-col gap-7 bg-gradient-to-br from-emerald-950/20 via-[#06080d] to-black">
              <div>
                <div className="flex items-center gap-2 mb-4"><span className="h-px w-6 bg-emerald-400" /><span className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-400">Data Model</span></div>
                <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-[-0.02em] mb-4">Source-Aware Provenance</h2>
                <p className="text-zinc-500 text-sm leading-relaxed">Every data point carries a forensic tag — no ambiguity about where values originate, crucial for Antarctic Treaty compliance and crew safety decisions.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(["OFFICIAL","LIVE_SENSOR","DOCUMENTARY","SIMULATED"] as const).map(tag=>(
                  <button key={tag} onClick={()=>setActiveProvenance(tag)} className={`p-4 rounded-2xl border text-left transition-all duration-300 ${activeProvenance===tag?"bg-emerald-500/15 border-emerald-500/40 text-emerald-300":"bg-white/[0.02] border-white/[0.05] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"}`}>
                    <span className="text-[9px] font-mono uppercase tracking-wider block mb-1.5 opacity-70">{tag.replace("_"," ")}</span>
                    <span className="text-xs font-medium block">
                      {tag==="OFFICIAL"    && "NCPOR logbooks & audit docs"}
                      {tag==="LIVE_SENSOR" && "PLC & power-meter feeds"}
                      {tag==="DOCUMENTARY" && "Expedition visual records"}
                      {tag==="SIMULATED"   && "Physics engine output"}
                    </span>
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={activeProvenance} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{duration:0.2}} className="p-4 rounded-xl bg-white/[0.025] border border-white/[0.05] text-xs text-zinc-400 leading-relaxed">
                  {activeProvenance==="OFFICIAL"    && "Extracted from NCPOR operational logbooks, MoES reports, and Antarctic Treaty audit documents. Treated as immutable 100% ground truth within the twin."}
                  {activeProvenance==="LIVE_SENSOR" && "Calibrated real-time streams from PLCs, power meters, weather masts, and ultrasonic level sensors — validated against physics-model bounds before ingestion."}
                  {activeProvenance==="DOCUMENTARY" && "Visual evidence from expedition walk-throughs, crew maintenance logbooks, and photogrammetric structural scans of station modules."}
                  {activeProvenance==="SIMULATED"   && "Physics-coupled thermodynamic, electrical, and hydraulic state models stress-testing failure combinations for anticipatory risk mitigation."}
                </motion.div>
              </AnimatePresence>
            </DoubleBezel>
          </motion.div>

          <motion.div initial={{opacity:0,x:20}} whileInView={{opacity:1,x:0}} viewport={{once:true,margin:"-60px"}} transition={{duration:0.7,delay:0.08,ease:easeOut}}>
            <DoubleBezel innerClassName="p-8 md:p-10 h-full flex flex-col gap-7 bg-gradient-to-br from-cyan-950/15 via-[#06080d] to-black">
              <div>
                <div className="flex items-center gap-2 mb-4"><span className="h-px w-6 bg-cyan-400" /><span className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400">National Heritage</span></div>
                <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-[-0.02em] mb-4">Four Decades of Evolution</h2>
                <p className="text-zinc-500 text-sm leading-relaxed">From the pioneering 1981 expedition to today's digital twin, Maitri represents India's enduring technological resilience in Antarctica.</p>
              </div>
              <div className="flex flex-col gap-1">
                {MILESTONES.map((m,i)=>(
                  <motion.div key={m.year} initial={{opacity:0,x:12}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{duration:0.5,delay:i*0.08,ease:easeOut}} className="flex gap-4 p-4 rounded-xl hover:bg-white/[0.03] transition-all duration-300 group">
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <span className="text-lg font-mono font-bold text-white group-hover:text-cyan-300 transition-colors">{m.year}</span>
                      {i<MILESTONES.length-1 && <div className="w-px flex-1 bg-white/[0.06] mt-1" />}
                    </div>
                    <div className="pt-0.5">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white">{m.title}</span>
                        <span className="px-2 py-0.5 rounded-full text-[8px] font-mono uppercase bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">{m.badge}</span>
                      </div>
                      <p className="text-xs text-zinc-500 leading-relaxed">{m.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </DoubleBezel>
          </motion.div>
        </div>
      </section>

      {/* ═══ DOMAIN EXPLORER ═══ */}
      <section className="relative z-10 py-28 px-5 md:px-10 max-w-[1440px] mx-auto">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-80px"}} transition={{duration:0.7,ease:easeOut}} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3"><span className="h-px w-8 bg-zinc-600" /><span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">Operational Modules</span></div>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.025em] text-white leading-[1.08]">Explore Specialized<br /><span className="text-zinc-500">Domains.</span></h2>
          </div>
          <Link href="/dashboard" className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-colors"><span>Open Central Overview</span><ArrowRight size={12} /></Link>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {([
            { href:"/infrastructure", icon:Cube,     tag:"3D Spatial",    title:"Infrastructure & Spaces",  desc:"CAD layouts, living modules, boiler rooms, structural integrity." },
            { href:"/energy",         icon:Lightning, tag:"4× 62.5 kVA",  title:"Energy & Microgrid",        desc:"Gen-sets, switchboards, fuel burn telemetry, heat recovery." },
            { href:"/logistics",      icon:Database,  tag:"142,800 L HSD",title:"Logistics & Fuel Farm",     desc:"Bulk diesel tanks, spare parts, winter autonomy projection." },
            { href:"/environment",    icon:Wind,      tag:"−40°C Rating", title:"Environment & Meteorology", desc:"Lake water levels, katabatic wind, ambient chill sensors." },
            { href:"/network",        icon:WifiHigh,  tag:"QoS Priority", title:"Edge Network & Satellite",  desc:"3-tier packet queuing, NVMe buffering, uplink health." },
            { href:"/simulations",    icon:Flask,     tag:"Monte Carlo",  title:"What-If Simulation Studio", desc:"Blizzard stress tests, generator trips, emergency runbooks." },
          ] as const).map((item,i)=>{
            const Icon = item.icon;
            return (
              <motion.div key={item.href} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-40px"}} transition={{duration:0.55,delay:i*0.06,ease:easeOut}}>
                <Link href={item.href} className="group block h-full">
                  <DoubleBezel innerClassName="p-6 h-full flex flex-col gap-4 bg-white/[0.015] group-hover:bg-white/[0.04] transition-all duration-500">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-zinc-400 group-hover:text-cyan-300 group-hover:border-cyan-500/30 transition-all duration-300"><Icon size={18} /></div>
                      <span className="text-[9px] font-mono uppercase text-zinc-600 px-2 py-1 rounded-full bg-white/[0.03] border border-white/[0.05]">{item.tag}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-white group-hover:text-cyan-200 transition-colors duration-300 mb-1.5">{item.title}</h4>
                      <p className="text-xs text-zinc-600 leading-relaxed">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-600 group-hover:text-zinc-300 transition-colors duration-300">
                      <span>Inspect Domain</span><ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                    </div>
                  </DoubleBezel>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="relative z-10 py-28 px-5 md:px-10 max-w-[1440px] mx-auto">
        <motion.div initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-60px"}} transition={{duration:0.8,ease:easeOut}}>
          <DoubleBezel innerClassName="p-12 md:p-20 text-center flex flex-col items-center gap-8 bg-gradient-to-tr from-cyan-950/25 via-[#08090f] to-indigo-950/25 relative overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-cyan-500/[0.04] blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-indigo-500/[0.04] blur-3xl pointer-events-none" />
            <div className="relative">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400 block mb-5">National Polar Cyber-Physical System</span>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.03em] text-white leading-[1.05] max-w-3xl mx-auto">
                Ready to Command<br /><span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300">Maitri Digital Twin?</span>
              </h2>
              <p className="text-zinc-500 text-sm md:text-base mt-6 max-w-xl mx-auto leading-relaxed">Step into the operational cockpit. Real-time telemetry, interactive cutaways, and predictive winter autonomy ready for execution.</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/dashboard" className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-semibold text-sm transition-all duration-500 hover:bg-zinc-100 active:scale-[0.97] shadow-[0_0_40px_rgba(255,255,255,0.25)]">
                <span>Open Mission Console</span>
                <span className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-500"><ArrowUpRight size={15} weight="bold" /></span>
              </Link>
              <Link href="/about" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.09] text-white font-medium text-sm transition-all duration-500">
                <Cube size={16} /><span>System Architecture</span>
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-white/[0.06] w-full">
              {["NCPOR Validated","Antarctic Treaty Compliant","MoES Programme","IoT Edge-Native","Offline-Survivable"].map(t=>(
                <span key={t} className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">{t}</span>
              ))}
            </div>
          </DoubleBezel>
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 border-t border-white/[0.06] py-12 px-5 md:px-10 max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-mono text-zinc-600">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <span className="text-zinc-300 font-medium">Maitri Research Station</span>
          <span className="hidden sm:inline">·</span>
          <span>Indian Antarctic Programme · NCPOR / MoES</span>
          <span className="hidden sm:inline">·</span>
          <span>70°45′58″ S, 11°43′56″ E</span>
        </div>
        <div className="flex items-center gap-6">
          {([{href:"/about",label:"Architecture"},{href:"/dashboard",label:"Dashboard"},{href:"/simulations",label:"Simulations"},{href:"/network",label:"Network"}] as const).map(({href,label})=>(
            <Link key={href} href={href} className="hover:text-zinc-300 transition-colors">{label}</Link>
          ))}
        </div>
      </footer>
    </main>
  );
}
