"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { DoubleBezel } from "@/components/DoubleBezel";
import {
  Cube,
  Database,
  Cpu,
  Broadcast,
  TreeStructure,
  TrendUp,
  Flask,
  ShieldCheck,
  WarningOctagon,
  ArrowUpRight,
  Waves,
  Lightning,
  ThermometerCold,
  Globe,
  HardDrives,
  CaretRight,
  CheckCircle,
  Eye,
  Sparkle
} from "@phosphor-icons/react";

// Digital Twin 6 Core Facets
const TWIN_FACETS = [
  {
    id: "spatial",
    title: "Spatial Representation",
    badge: "3D Physical Model",
    icon: Cube,
    color: "from-cyan-500/20 to-blue-600/10 text-cyan-400 border-cyan-500/30",
    lead: "Anchoring digital signals directly to physical space.",
    description:
      "A high-precision WebGL/Three.js interactive model of Maitri Research Station in the Schirmacher Oasis. Rather than detached sensor graphs, every telemetry reading, thermal plume, and pipe line is mapped to real geometric coordinates, minimizing operator cognitive load during emergencies.",
    techDetails: [
      { label: "Geometry", value: "CAD & Satellite DEM Mesh" },
      { label: "Precision", value: "Sub-meter Spatial Anchors" },
      { label: "Rendering", value: "WebGL / Three.js Shaders" },
    ],
    operationalRole:
      "Pinpoints exact location of electrical faults, trace-heating failures, or insulation breaches across main habitat blocks and modular container laboratories.",
  },
  {
    id: "semantic",
    title: "Semantic Representation",
    badge: "Asset Ontology",
    icon: TreeStructure,
    color: "from-indigo-500/20 to-purple-600/10 text-indigo-400 border-indigo-500/30",
    lead: "Encoding relationships, dependencies, and equipment lineage.",
    description:
      "A directed acyclic graph capturing station topology and functional interdependencies. It knows that Generator #1 feeds Switchboard A, which powers Trace Heating Circuit 3, which keeps Lake Priyadarshini water inlet flowing. If one element fails, the entire downstream impact is instantly exposed.",
    techDetails: [
      { label: "Schema", value: "Graph Ontology & Asset Hierarchy" },
      { label: "Provenance", value: "NCPOR & Antarctic Treaty Audits" },
      { label: "Query Engine", value: "Cross-domain Dependency Tracker" },
    ],
    operationalRole:
      "Eliminates guesswork for incoming replacement expedition crews who need immediate understanding of 35+ years of complex station retrofits.",
  },
  {
    id: "state",
    title: "State Representation",
    badge: "Live Telemetry",
    icon: Database,
    color: "from-emerald-500/20 to-teal-600/10 text-emerald-400 border-emerald-500/30",
    lead: "Unified real-time pulse of Antarctic station operations.",
    description:
      "Collects, filters, and standardizes multi-protocol telemetry from across Maitri: generator bus frequencies, diesel tank ultrasonic levels, boiler water pressure, indoor HVAC temperatures, and atmospheric weather mast sensors.",
    techDetails: [
      { label: "Ingestion", value: "Modbus TCP / MQTT / LoRaWAN" },
      { label: "Time-Series", value: "Optimized High-Density Store" },
      { label: "Validation", value: "Anomaly & Deadband Filtering" },
    ],
    operationalRole:
      "Maintains continuous awareness of vital signs with zero-drift state observer algorithms even amidst noisy arctic sensor conditions.",
  },
  {
    id: "future",
    title: "Future-State Representation",
    badge: "Predictive Analytics",
    icon: TrendUp,
    color: "from-amber-500/20 to-orange-600/10 text-amber-400 border-amber-500/30",
    lead: "Forecasting operational horizons before physical limits are breached.",
    description:
      "Moving beyond reactive alarms. The predictive engine analyzes current power demand, ambient chill factors, and fuel density to project exact autonomy curves: 'At current electrical loads, Generator #2 oil will reach viscosity limits in 74 hours, and winter diesel reserves will support 214 days.'",
    techDetails: [
      { label: "Algorithms", value: "Degradation & Burn-Rate Models" },
      { label: "Horizon", value: "30 to 270 Day Winter Projections" },
      { label: "Uncertainty", value: "Confidence Interval Estimation" },
    ],
    operationalRole:
      "Enables proactive preventative maintenance weeks ahead of blizzards, preventing catastrophic winter freeze-in scenarios.",
  },
  {
    id: "simulation",
    title: "Counterfactual Representation",
    badge: "What-If Engine",
    icon: Flask,
    color: "from-rose-500/20 to-pink-600/10 text-rose-400 border-rose-500/30",
    lead: "Stress-testing crises in software before they happen in ice.",
    description:
      "A physics-informed discrete event simulation sandbox. Station commanders can simulate: 'What if a 180 km/h blizzard coincides with a turbocharger breakdown on Generator #3?' The twin dynamically models thermal decay, battery backup drain, and loadshedding triage.",
    techDetails: [
      { label: "Engine", value: "Physics-coupled Discrete Simulation" },
      { label: "Scenarios", value: "Blizzard, Fire, Grid Trip, Freeze" },
      { label: "Output", value: "Risk Matrix & Mitigating Runbooks" },
    ],
    operationalRole:
      "Empowers remote directors at NCPOR Goa and station leaders to dry-run emergency protocols safely without endangering crew or equipment.",
  },
  {
    id: "interface",
    title: "Operator Interface",
    badge: "Decision Support",
    icon: Eye,
    color: "from-sky-500/20 to-cyan-600/10 text-sky-400 border-sky-500/30",
    lead: "Low-cognitive-load mission triage for expedition engineers.",
    description:
      "Designed specifically for high-stress, low-bandwidth, sleep-deprived polar environments. The interface synthesizes complex mathematical states into unambiguous visual alerts, prioritized action cards, and step-by-step diagnostic workflows.",
    techDetails: [
      { label: "Design", value: "Ethereal Glass / High-Contrast HUD" },
      { label: "Latency", value: "Sub-100ms Local UI Response" },
      { label: "Access", value: "Edge LAN & Remote Mainland Mirror" },
    ],
    operationalRole:
      "Turns thousands of raw sensory signals into 3 clear operational decisions, ensuring rapid life-support safety actions.",
  },
];

// Architectural Pipeline Stages
const PIPELINE_STAGES = [
  {
    step: "01",
    id: "physical",
    name: "Physical Maitri",
    subtitle: "Sensors & Equipment",
    icon: Lightning,
    badge: "70° South Reality",
    summary:
      "Physical machinery operating in the Schirmacher Oasis: 4x Cummins Diesel Gen-Sets, 2.5 km heated water intake, 150 kL Arctic HSD fuel farm, and automated meteorological instrumentation.",
    keySpecs: [
      { key: "Generators", val: "4x 62.5 kVA Diesel Units" },
      { key: "Water Line", val: "2.5 km Trace-Heated Pipeline" },
      { key: "Fuel Storage", val: "Bulk Heated Tank Farm" },
      { key: "Sensors", val: "240+ Calibrated Telemetry Points" },
    ],
    edgeFactor: "Hardware exposed to -40°C temperatures, abrasive permafrost dust, and katabatic winds.",
  },
  {
    step: "02",
    id: "edge",
    name: "Edge Gateway",
    subtitle: "Local Data Engine",
    icon: Cpu,
    badge: "Autonomous Edge",
    summary:
      "Industrial edge server in the Maitri radio building. Validates sensor parity, filters sensor noise, stores state locally in high-performance NVMe rings, and handles store-and-forward compression.",
    keySpecs: [
      { key: "Hardware", val: "Ruggedized Fanless Edge Node" },
      { key: "Buffering", val: "90-Day Local Telemetry NVMe" },
      { key: "Compression", val: "LZ4 / Snappy Differential" },
      { key: "Protocols", val: "Modbus TCP, Serial RTU, MQTT" },
    ],
    edgeFactor: "Operates 100% autonomously during 72-hour blizzard-induced satellite dropouts.",
  },
  {
    step: "03",
    id: "satellite",
    name: "Prioritized Satellite Link",
    subtitle: "Dynamic QoS Uplink",
    icon: Broadcast,
    badge: "Constrained Comm",
    summary:
      "High-latency, weather-vulnerable satellite channel connecting Maitri to mainland India. Features strict 3-tier packet triage: life safety trips transmit immediately, while bulk historical logs yield bandwidth.",
    keySpecs: [
      { key: "Bandwidth", val: "64 kbps - 512 kbps Variable" },
      { key: "Latency", val: "650ms - 1200ms Round Trip" },
      { key: "QoS Class A", val: "Immediate (<50ms Dispatch)" },
      { key: "QoS Class C", val: "Queued during Solar Storms" },
    ],
    edgeFactor: "Handles sudden antenna slewing and atmospheric signal fade during Antarctic blizzards.",
  },
  {
    step: "04",
    id: "core",
    name: "Digital Twin Core",
    subtitle: "State & Analytics Hub",
    icon: HardDrives,
    badge: "Cyber-Physical Brain",
    summary:
      "The central computational twin engine. Maintains the active ontology graph, synchronizes edge state packets, runs physics-informed estimation models, and evaluates what-if simulation matrices.",
    keySpecs: [
      { key: "Data Engine", val: "Graph Ontology + Time-Series" },
      { key: "Twin State", val: "Real-time State-Space Observer" },
      { key: "Simulation", val: "Monte Carlo Failure Engine" },
      { key: "Sync", val: "Bidirectional Delta Replicator" },
    ],
    edgeFactor: "Maintains mathematical continuity across intermittent satellite drops.",
  },
  {
    step: "05",
    id: "remote",
    name: "Remote Mission Control",
    subtitle: "NCPOR Headquarters",
    icon: Globe,
    badge: "Mainland Command",
    summary:
      "NCPOR Command Facility in Goa, India. Mission directors, polar engineers, and scientific leads monitor station health, evaluate predictive warnings, and coordinate emergency winter support.",
    keySpecs: [
      { key: "Location", val: "NCPOR Goa, India" },
      { key: "Visualizer", val: "Spatial 3D & Telemetry HUD" },
      { key: "Triage", val: "Automated Incident Escalation" },
      { key: "Access", val: "Multi-Seat Engineering Console" },
    ],
    edgeFactor: "Bridges 11,000 km between researchers in India and expeditioners at 70° South.",
  },
];

// Evidence & Provenance Tiers
const PROVENANCE_TIERS = [
  {
    tag: "OFFICIAL",
    label: "Official Record",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    confidence: "High (100% Ground Truth)",
    description:
      "Extracted from NCPOR operational logbooks, MoES technical reports, and official Antarctic Treaty inspection documentation. Establishes immutable facts: station coordinates, generator ratings, and structural drawings.",
  },
  {
    tag: "LIVE_SENSOR",
    label: "Edge Sensor Feed",
    color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    confidence: "High (Real-Time State)",
    description:
      "Live calibrated telemetry streamed directly from station controllers, PLCs, and electrical switchboards. Subject to edge validation and statistical noise filtering.",
  },
  {
    tag: "DOCUMENTARY",
    label: "Expedition Ground-Truth",
    color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    confidence: "Medium-High (Observed Reality)",
    description:
      "Derived from interior expedition walk-through footage, photographic surveys, and maintenance notes taken by winter-over personnel. Validates unrecorded physical retrofits.",
  },
  {
    tag: "SIMULATED",
    label: "Physics-Based Synthetic",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    confidence: "Synthetic (Bound Within Real Physics)",
    description:
      "Generated by calibrated thermodynamic and electrical models to stress-test station resiliency against catastrophic failure combinations that haven't yet occurred in the real station.",
  },
];

export default function AboutPage() {
  const [activeFacet, setActiveFacet] = useState(TWIN_FACETS[0]);
  const [activePipelineStep, setActivePipelineStep] = useState(PIPELINE_STAGES[1]);
  const [activeTab, setActiveTab] = useState<"qos" | "dependencies" | "stack">("qos");

  return (
    <main className="min-h-[100dvh] w-full px-4 py-8 pt-28 md:px-8 md:py-32 selection:bg-cyan-500/30">
      <div className="max-w-7xl mx-auto flex flex-col gap-24">
        
        {/* =========================================================
            SECTION 1: HERO & POLAR STATION METADATA
           ========================================================= */}
        <section className="relative flex flex-col gap-8 md:gap-12 lg:mb-12">
          
          {/* Advanced Ambient Atmospheric Background */}
          <div className="absolute top-[-10rem] left-1/2 -translate-x-1/2 w-[80vw] max-w-[1000px] h-[500px] pointer-events-none opacity-40 mix-blend-screen">
            <motion.div 
              animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0%,rgba(34,211,238,0.1)_25%,rgba(99,102,241,0.15)_50%,transparent_100%)] rounded-full blur-[100px]"
            />
          </div>
          
          {/* Subtle Grid Overlay */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "64px 64px", maskImage: "radial-gradient(ellipse at top center, black, transparent 70%)" }} />

          {/* Eyebrow & Live Location Tag */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
            className="flex flex-wrap items-center gap-3 relative z-10"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono tracking-widest uppercase bg-white/5 border border-white/10 text-zinc-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              Maitri Station · 70°45′58″ S · 11°43′56″ E
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono tracking-widest uppercase bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-md">
              <Sparkle size={12} weight="fill" />
              NCPOR / Ministry of Earth Sciences
            </span>
          </motion.div>

          {/* Massive Agency Headline */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
            className="max-w-4xl relative z-10"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] font-sans tracking-tight font-medium leading-[1.05] mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/60">
              Autonomous Intelligence<br/>for the Frozen Continent.
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl font-light leading-relaxed max-w-3xl selection:bg-cyan-500/30">
              The <strong className="text-white font-medium">Maitri Digital Twin</strong> is not a static 3D model. 
              It is a source-aware, fault-tolerant cyber-physical representation engineered to bridge 11,000 km of extreme isolation 
              between the harsh polar desert of Antarctica and mission control in India.
            </p>
          </motion.div>

          {/* Real Polar Telemetry Matrix Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="relative z-10"
          >
            <DoubleBezel innerClassName="p-5 md:p-8 bg-gradient-to-r from-white/[0.04] to-white/[0.01] backdrop-blur-xl relative overflow-hidden">
              {/* Scanline overlay for tactical feel */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#fff_2px,#fff_4px)] mix-blend-overlay" />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10 relative z-10">
                
                <div className="flex flex-col gap-1.5 pt-2 md:pt-0 group">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-1.5 transition-colors group-hover:text-cyan-400">
                    <ThermometerCold size={14} className="text-cyan-400" />
                    Thermal Envelope
                  </span>
                  <span className="text-xl md:text-2xl font-mono font-medium text-white tracking-tight">-40°C to +5°C</span>
                  <span className="text-[11px] text-zinc-400 tracking-wide">Extreme Katabatic Winds &gt;250 km/h</span>
                </div>

                <div className="flex flex-col gap-1.5 pt-4 md:pt-0 md:pl-8 group">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-1.5 transition-colors group-hover:text-amber-400">
                    <Lightning size={14} className="text-amber-400" />
                    Power Resilience
                  </span>
                  <span className="text-xl md:text-2xl font-mono font-medium text-white tracking-tight">4x 62.5 kVA</span>
                  <span className="text-[11px] text-zinc-400 tracking-wide">N+2 Redundant Cummins Diesel</span>
                </div>

                <div className="flex flex-col gap-1.5 pt-4 md:pt-0 md:pl-8 group">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-1.5 transition-colors group-hover:text-blue-400">
                    <Waves size={14} className="text-blue-400" />
                    Water Lifeline
                  </span>
                  <span className="text-xl md:text-2xl font-mono font-medium text-white tracking-tight">2.5 km Intake</span>
                  <span className="text-[11px] text-zinc-400 tracking-wide">Lake Priyadarshini Trace Heating</span>
                </div>

                <div className="flex flex-col gap-1.5 pt-4 md:pt-0 md:pl-8 group">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-1.5 transition-colors group-hover:text-emerald-400">
                    <Broadcast size={14} className="text-emerald-400" />
                    Mainland Sync
                  </span>
                  <span className="text-xl md:text-2xl font-mono font-medium text-white tracking-tight">Prioritized Edge</span>
                  <span className="text-[11px] text-zinc-400 tracking-wide">Store-and-Forward Satellite Buffer</span>
                </div>
                
              </div>
            </DoubleBezel>
          </motion.div>
        </section>

        {/* =========================================================
            SECTION 2: THE 6 FACETS OF THE DIGITAL TWIN (INTERACTIVE)
           ========================================================= */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-px w-6 bg-cyan-400" />
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-medium">
                  The Six Facets
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-sans font-medium text-white tracking-tight">
                Not Just a 3D Model. A Complete Twin Architecture.
              </h2>
            </div>
            <p className="text-sm text-zinc-400 max-w-md">
              Select a facet below to explore how spatial, semantic, state, predictive, and counterfactual representations unite into a living operational twin.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Facet Selector Pills (Desktop Left, Mobile Top) */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
              {TWIN_FACETS.map((facet) => {
                const isSelected = activeFacet.id === facet.id;
                const Icon = facet.icon;
                return (
                  <button
                    key={facet.id}
                    onClick={() => setActiveFacet(facet)}
                    className={`group text-left p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                      isSelected
                        ? "bg-white/10 border-white/20 shadow-lg text-white"
                        : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10 text-zinc-400"
                    }`}
                  >
                    {/* Active accent strip */}
                    {isSelected && (
                      <motion.div
                        layoutId="activeFacetAccent"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-indigo-500"
                      />
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${
                            isSelected
                              ? "bg-white/10 border-white/20 text-white"
                              : "bg-white/5 border-white/10 text-zinc-400 group-hover:text-white"
                          }`}
                        >
                          <Icon size={18} weight={isSelected ? "fill" : "regular"} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{facet.title}</div>
                          <div className="text-[11px] font-mono text-zinc-400">{facet.badge}</div>
                        </div>
                      </div>
                      <CaretRight
                        size={16}
                        className={`transition-transform duration-300 ${
                          isSelected ? "translate-x-1 text-white" : "opacity-0 group-hover:opacity-100"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Facet Deep-Dive Display Card */}
            <div className="lg:col-span-7 relative">
              {/* Dynamic ambient glow behind the active card */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.05] to-transparent blur-3xl pointer-events-none" />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFacet.id}
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                  className="h-full"
                >
                  <DoubleBezel innerClassName="h-full p-6 md:p-10 flex flex-col gap-8 relative overflow-hidden bg-gradient-to-br from-white/[0.04] to-[#020305]">
                    
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-8 relative z-10">
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] bg-gradient-to-br ${activeFacet.color.split(' ').slice(0,2).join(' ')} ${activeFacet.color.split(' ')[2]}`}>
                          <activeFacet.icon size={28} weight="duotone" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className={`text-[10px] font-mono uppercase tracking-widest ${activeFacet.color.split(' ')[2]}`}>
                            {activeFacet.badge}
                          </span>
                          <h3 className="text-2xl md:text-3xl font-medium text-white tracking-tight">{activeFacet.title}</h3>
                        </div>
                      </div>
                      <span className="hidden sm:inline-flex text-xs font-mono text-zinc-500 uppercase border border-white/10 rounded-full px-4 py-1.5 bg-white/[0.02]">
                        Pillar 0{TWIN_FACETS.findIndex((f) => f.id === activeFacet.id) + 1}
                      </span>
                    </div>

                    {/* Lead & Description */}
                    <div className="space-y-4 relative z-10">
                      <p className="text-lg text-zinc-200 font-medium leading-relaxed">{activeFacet.lead}</p>
                      <p className="text-sm md:text-base text-zinc-400 leading-relaxed font-light">{activeFacet.description}</p>
                    </div>

                    {/* Technical Specifications Matrix */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-5 rounded-2xl bg-white/[0.02] border border-white/5 relative z-10 mt-auto">
                      {activeFacet.techDetails.map((detail, idx) => (
                        <div key={idx} className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                            {detail.label}
                          </span>
                          <span className="text-xs font-mono font-medium text-zinc-200">{detail.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Operational Impact Box */}
                    <div className={`p-5 rounded-2xl bg-gradient-to-r from-white/[0.03] to-transparent border-l-2 ${activeFacet.color.split(' ')[3].replace('border', 'border')} relative z-10`}>
                      <div className={`flex items-center gap-2 mb-2 text-xs font-mono uppercase tracking-wider ${activeFacet.color.split(' ')[2]}`}>
                        <CheckCircle size={16} weight="fill" />
                        Operational Reality at 70° South
                      </div>
                      <p className="text-sm text-zinc-300 leading-relaxed font-light">
                        {activeFacet.operationalRole}
                      </p>
                    </div>
                  </DoubleBezel>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 3: INTERACTIVE PIPELINE ARCHITECTURE (EDGE TO CLOUD)
           ========================================================= */}
        <section className="flex flex-col gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-px w-6 bg-indigo-400" />
              <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-medium">
                Data Synchronization Highway
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-sans font-medium text-white tracking-tight">
              From Extreme Physical Edge to Mainland Decision Support
            </h2>
            <p className="text-zinc-400 text-sm md:text-base mt-2 max-w-2xl">
              Antarctica offers zero broadband redundancy. When satellite links drop during blizzards, 
              the system prioritizes safety-critical packets and buffers historical logs locally.
            </p>
          </div>

          {/* Pipeline Interactive Stepper Strip */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {PIPELINE_STAGES.map((stage) => {
              const isSelected = activePipelineStep.id === stage.id;
              const Icon = stage.icon;
              return (
                <button
                  key={stage.id}
                  onClick={() => setActivePipelineStep(stage)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-300 relative ${
                    isSelected
                      ? "bg-white/10 border-white/20 shadow-md text-white"
                      : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] text-zinc-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold text-zinc-400">{stage.step}</span>
                    <Icon
                      size={18}
                      className={isSelected ? "text-cyan-400" : "text-zinc-400"}
                      weight={isSelected ? "fill" : "regular"}
                    />
                  </div>
                  <div className="text-sm font-medium text-white truncate">{stage.name}</div>
                  <div className="text-[11px] font-mono text-zinc-400 truncate">{stage.subtitle}</div>
                </button>
              );
            })}
          </div>

          {/* Active Pipeline Stage Breakdown */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activePipelineStep.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            >
              <DoubleBezel innerClassName="p-6 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-7 flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        Stage {activePipelineStep.step} of 05
                      </span>
                      <span className="text-xs font-mono text-zinc-400">{activePipelineStep.badge}</span>
                    </div>

                    <div>
                      <h3 className="text-2xl font-medium text-white mb-2">{activePipelineStep.name}</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed">{activePipelineStep.summary}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 block mb-1.5">
                        Polar Edge Resilience Factor
                      </span>
                      <p className="text-xs text-zinc-300">{activePipelineStep.edgeFactor}</p>
                    </div>
                  </div>

                  <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                      Technical Architecture Metrics
                    </span>
                    {activePipelineStep.keySpecs.map((spec, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between"
                      >
                        <span className="text-xs text-zinc-400">{spec.key}</span>
                        <span className="text-xs font-mono font-medium text-zinc-200">{spec.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </DoubleBezel>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* =========================================================
            SECTION 4: REAL ANTARCTIC ENGINEERING CRISIS CASES
           ========================================================= */}
        <section className="flex flex-col gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-px w-6 bg-rose-400" />
              <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-medium">
                Operational Vulnerabilities
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-sans font-medium text-white tracking-tight">
              Why Maitri Requires a Digital Twin
            </h2>
            <p className="text-zinc-400 text-sm md:text-base mt-2 max-w-2xl">
              Antarctica forgives no assumptions. A single undetected fault triggers immediate cascading failure. 
              The digital twin models three high-risk survival bottlenecks:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Water Line Freeze */}
            <DoubleBezel innerClassName="p-6 flex flex-col justify-between gap-6 bg-gradient-to-b from-blue-500/[0.04] to-transparent">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Waves size={20} weight="fill" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400">
                    The 45-Minute Window
                  </span>
                  <h3 className="text-lg font-medium text-white mt-1">Lake Priyadarshini Water Line</h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Maitri&apos;s freshwater is pumped 2.5 km across barren permafrost rock from Lake Priyadarshini. 
                  Continuous trace heating keeps the pipe above 0°C. If power drops during a -35°C blizzard, water freezes solid in 
                  <span className="text-zinc-200 font-medium"> under 45 minutes</span>, rupturing the pipeline and leaving the station without water for months.
                </p>
              </div>
              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span>Model: Thermal Dissipation</span>
                <span className="text-blue-400 font-medium">Auto-Alert: &lt;3.2°C</span>
              </div>
            </DoubleBezel>

            {/* Card 2: 8-Month Fuel Isolation */}
            <DoubleBezel innerClassName="p-6 flex flex-col justify-between gap-6 bg-gradient-to-b from-amber-500/[0.04] to-transparent">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Lightning size={20} weight="fill" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
                    Zero Resupply
                  </span>
                  <h3 className="text-lg font-medium text-white mt-1">Winter Fuel Depletion Balance</h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  During 8 months of polar night, no aircraft or relief vessel can land. Every kilowatt of electrical heat, melt-water, 
                  and cooking relies on Arctic High-Speed Diesel (HSD). An undetected micro-leak or miscalculated generator burn rate 
                  threatens total blackout before the summer expedition arrives.
                </p>
              </div>
              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span>Model: Mass-Energy Balance</span>
                <span className="text-amber-400 font-medium">Reserve Horizon: &gt;180d</span>
              </div>
            </DoubleBezel>

            {/* Card 3: Blizzard Comms Blackout */}
            <DoubleBezel innerClassName="p-6 flex flex-col justify-between gap-6 bg-gradient-to-b from-cyan-500/[0.04] to-transparent">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Broadcast size={20} weight="fill" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                    Disconnected Autonomy
                  </span>
                  <h3 className="text-lg font-medium text-white mt-1">Satellite Link Decoupling</h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Katabatic blizzards deflect the station radome dishes and induce severe ionospheric interference, causing satellite outages 
                  lasting up to 72 hours. The twin runs locally at the edge with full autonomous decision support, buffering telemetry 
                  until the uplink is restored.
                </p>
              </div>
              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span>Buffer: Store-and-Forward</span>
                <span className="text-cyan-400 font-medium">Capacity: 90 Days</span>
              </div>
            </DoubleBezel>
          </div>
        </section>

        {/* =========================================================
            SECTION 5: SOURCE PROVENANCE & EVIDENCE CONFIDENCE
           ========================================================= */}
        <section className="flex flex-col gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-px w-6 bg-emerald-400" />
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-medium">
                Data Integrity & Truth
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-sans font-medium text-white tracking-tight">
              Source Provenance and Evidence Confidence
            </h2>
            <p className="text-zinc-400 text-sm md:text-base mt-2 max-w-2xl">
              Unlike theoretical simulations, every parameter and coordinate in the Maitri Digital Twin retains its provenance tag, 
              guaranteeing operators know exactly which data is officially verified versus synthetic.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROVENANCE_TIERS.map((tier) => (
              <DoubleBezel key={tier.tag} innerClassName="p-5 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border ${tier.color}`}>
                      {tier.tag}
                    </span>
                    <ShieldCheck size={16} className="text-zinc-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">{tier.label}</h4>
                    <span className="text-[11px] font-mono text-zinc-400">{tier.confidence}</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{tier.description}</p>
                </div>
              </DoubleBezel>
            ))}
          </div>
        </section>

        {/* =========================================================
            SECTION 6: TECHNICAL DEEP-DIVE TABS
           ========================================================= */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-px w-6 bg-cyan-400" />
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-medium">
                  Technical Specifications
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-sans font-medium text-white tracking-tight">
                System Protocols & Execution Topology
              </h2>
            </div>

            {/* Tab Switcher Pills */}
            <div className="flex items-center p-1 bg-white/5 rounded-full border border-white/10 w-fit">
              <button
                onClick={() => setActiveTab("qos")}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === "qos" ? "bg-white/15 text-white shadow-sm" : "text-zinc-400 hover:text-white"
                }`}
              >
                Satellite QoS Triage
              </button>
              <button
                onClick={() => setActiveTab("dependencies")}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === "dependencies" ? "bg-white/15 text-white shadow-sm" : "text-zinc-400 hover:text-white"
                }`}
              >
                Dependency Cascade
              </button>
              <button
                onClick={() => setActiveTab("stack")}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === "stack" ? "bg-white/15 text-white shadow-sm" : "text-zinc-400 hover:text-white"
                }`}
              >
                Software Stack
              </button>
            </div>
          </div>

          <DoubleBezel innerClassName="p-6 md:p-8">
            {activeTab === "qos" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6"
              >
                <div>
                  <h3 className="text-lg font-medium text-white">Dynamic Packet Classification (Constrained Link)</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    When satellite bandwidth throttles to under 64 kbps during geomagnetic storms, packets are strictly scheduled:
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-zinc-400 font-mono">
                        <th className="pb-3 font-normal">Class</th>
                        <th className="pb-3 font-normal">Data Stream</th>
                        <th className="pb-3 font-normal">Disruption Policy</th>
                        <th className="pb-3 font-normal">Delivery Target</th>
                        <th className="pb-3 font-normal">Drop Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      <tr>
                        <td className="py-3 text-rose-400 font-semibold">Class A (Urgent)</td>
                        <td className="py-3 text-zinc-200">Generator Trips, Fire/CO2, Pipeline Freeze Alerts</td>
                        <td className="py-3 text-zinc-400">Preempts all traffic; instant burst</td>
                        <td className="py-3 text-cyan-300">&lt;50 ms</td>
                        <td className="py-3 text-emerald-400">0.0% (Zero loss)</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-amber-400 font-semibold">Class B (Telemetry)</td>
                        <td className="py-3 text-zinc-200">Bus voltages, fuel levels, boiler heat, wind speed</td>
                        <td className="py-3 text-zinc-400">Downsampled from 10Hz to 1Hz if link degrades</td>
                        <td className="py-3 text-cyan-300">&lt;5 seconds</td>
                        <td className="py-3 text-zinc-400">&lt;1.0%</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-blue-400 font-semibold">Class C (Bulk Logs)</td>
                        <td className="py-3 text-zinc-200">Vibration FFT spectra, webcam snapshots, raw met logs</td>
                        <td className="py-3 text-zinc-400">100% buffered to local NVMe store until clear weather</td>
                        <td className="py-3 text-cyan-300">Opportunistic</td>
                        <td className="py-3 text-zinc-400">Buffered locally</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === "dependencies" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6"
              >
                <div>
                  <h3 className="text-lg font-medium text-white">Cross-Domain Graph Dependency Engine</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    How the semantic ontology traces cascading impacts across isolated physical domains:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] font-mono text-zinc-400 block mb-1">01. Root Asset Event</span>
                    <h4 className="text-xs font-semibold text-rose-400">Gen-Set #2 Trips</h4>
                    <p className="text-[11px] text-zinc-400 mt-2">
                      Fuel injector clogging triggers over-temperature trip on Cummins engine.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] font-mono text-zinc-400 block mb-1">02. Electrical Bus Shift</span>
                    <h4 className="text-xs font-semibold text-amber-400">Switchboard Bus Shedding</h4>
                    <p className="text-[11px] text-zinc-400 mt-2">
                      Twin calculates remaining 62.5 kVA capacity; flags secondary laboratory heating sheds.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] font-mono text-zinc-400 block mb-1">03. Thermal Cascade</span>
                    <h4 className="text-xs font-semibold text-blue-400">Lake Priyadarshini Trace Alert</h4>
                    <p className="text-[11px] text-zinc-400 mt-2">
                      System detects trace-heating breaker prioritized on Main Bus A; confirms water line safe.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] font-mono text-zinc-400 block mb-1">04. Decision Protocol</span>
                    <h4 className="text-xs font-semibold text-emerald-400">Automated Dispatch</h4>
                    <p className="text-[11px] text-zinc-400 mt-2">
                      Dispatches step-by-step injector replacement checklist to station engineering crew.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "stack" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6"
              >
                <div>
                  <h3 className="text-lg font-medium text-white">Production Software Architecture</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Modern, resilient, zero-friction technologies driving the edge and visualization layers:
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-zinc-400 uppercase block">Frontend Core</span>
                    <span className="text-zinc-200 font-semibold">Next.js 16 (App Router)</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-zinc-400 uppercase block">3D & Spatial Engine</span>
                    <span className="text-zinc-200 font-semibold">Three.js / WebGL GLTF</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-zinc-400 uppercase block">Motion Choreography</span>
                    <span className="text-zinc-200 font-semibold">Framer Motion Spring</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-zinc-400 uppercase block">Styling Architecture</span>
                    <span className="text-zinc-200 font-semibold">Tailwind + DoubleBezel</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-zinc-400 uppercase block">Telemetry Streaming</span>
                    <span className="text-zinc-200 font-semibold">WebSockets + MQTT TLS</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-zinc-400 uppercase block">Data Storage</span>
                    <span className="text-zinc-200 font-semibold">InfluxDB + MongoDB</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-zinc-400 uppercase block">Edge Buffer</span>
                    <span className="text-zinc-200 font-semibold">RocksDB / SQLite NVMe</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-zinc-400 uppercase block">Simulation Core</span>
                    <span className="text-zinc-200 font-semibold">Python Physics State-Space</span>
                  </div>
                </div>
              </motion.div>
            )}
          </DoubleBezel>
        </section>

        {/* =========================================================
            SECTION 7: NEXT STEP NAVIGATION CTA
           ========================================================= */}
        <section className="pt-8 pb-16">
          <DoubleBezel innerClassName="p-8 md:p-12 bg-gradient-to-tr from-cyan-950/20 via-black to-indigo-950/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2 text-center md:text-left">
                <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-medium">
                  Experience the Living Twin
                </span>
                <h3 className="text-2xl md:text-3xl font-medium text-white tracking-tight">
                  Ready to inspect real station telemetry?
                </h3>
                <p className="text-sm text-zinc-400 max-w-lg">
                  Explore the 3D cutaway visualization, test what-if blizzard simulations, or inspect the live edge network topology.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/dashboard"
                  className="group relative inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white text-black font-medium text-sm transition-all hover:bg-zinc-200 active:scale-[0.98]"
                >
                  <span>Open Mission Console</span>
                  <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <ArrowUpRight size={14} weight="bold" />
                  </div>
                </Link>

                <Link
                  href="/simulations"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm transition-all"
                >
                  <Flask size={16} />
                  <span>Run Simulations</span>
                </Link>
              </div>
            </div>
          </DoubleBezel>
        </section>

      </div>
    </main>
  );
}
