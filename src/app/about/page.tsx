"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  Sparkle,
  ArrowLeft,
} from "@phosphor-icons/react";
import { TopographicBg } from "@/components/TopographicBg";

// Digital Twin 6 Core Facets
const TWIN_FACETS = [
  {
    id: "spatial",
    title: "Spatial Representation",
    badge: "3D Physical Model",
    icon: Cube,
    lead: "Anchoring digital signals directly to physical space.",
    description:
      "A high-precision WebGL interactive model of Maitri Research Station in the Schirmacher Oasis. Rather than detached sensor graphs, every telemetry reading, thermal plume, and pipe line is mapped to real geometric coordinates, minimizing operator cognitive load during emergencies.",
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
    lead: "Low-cognitive-load mission triage for expedition engineers.",
    description:
      "Designed specifically for high-stress, low-bandwidth, sleep-deprived polar environments. The interface synthesizes complex mathematical states into unambiguous visual alerts, prioritized action cards, and step-by-step diagnostic workflows.",
    techDetails: [
      { label: "Design", value: "Deep Arctic Double-Bezel HUD" },
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
      "Physical machinery operating in the Schirmacher Oasis: 3x Kirloskar Diesel Gen-Sets, 2.5 km heated water intake, 120,000 L Arctic Jet A-1 fuel farm, and automated meteorological instrumentation.",
    keySpecs: [
      { key: "Generators", val: "3x 62.5 kVA Kirloskar HA694" },
      { key: "Water Line", val: "2.5 km Trace-Heated Pipeline" },
      { key: "Fuel Storage", val: "Bulk Double-Walled Tanks" },
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
      "High-latency, weather-vulnerable satellite channel connecting Maitri to mainland India. Features strict 4-tier packet triage: life safety trips transmit immediately, while bulk historical logs yield bandwidth.",
    keySpecs: [
      { key: "Bandwidth", val: "128 kbps - 512 kbps Variable" },
      { key: "Latency", val: "740ms - 1100ms Round Trip" },
      { key: "QoS Class A", val: "Immediate (<50ms Dispatch)" },
      { key: "QoS Class D", val: "Queued during Solar Storms" },
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
    color: "bg-[#10B981]/10 text-[#6EE7B7] border-[#10B981]/30",
    confidence: "High (100% Ground Truth)",
    description:
      "Extracted from NCPOR operational logbooks, MoES technical reports, and official Antarctic Treaty inspection documentation. Establishes immutable facts: station coordinates, generator ratings, and structural drawings.",
  },
  {
    tag: "LIVE_SENSOR",
    label: "Edge Sensor Feed",
    color: "bg-white/[0.08] text-[#E2E8F0] border-white/20",
    confidence: "High (Real-Time State)",
    description:
      "Live calibrated telemetry streamed directly from station controllers, PLCs, and electrical switchboards. Subject to edge validation and statistical noise filtering.",
  },
  {
    tag: "DOCUMENTARY",
    label: "Expedition Ground-Truth",
    color: "bg-white/[0.04] text-[#94A3B8] border-white/[0.08]",
    confidence: "Medium-High (Observed Reality)",
    description:
      "Derived from interior expedition walk-through footage, photographic surveys, and maintenance notes taken by winter-over personnel. Validates unrecorded physical retrofits.",
  },
  {
    tag: "SIMULATED",
    label: "Physics-Based Synthetic",
    color: "bg-[#F59E0B]/10 text-[#FCD34D] border-[#F59E0B]/30",
    confidence: "Synthetic (Bound Within Real Physics)",
    description:
      "Generated by calibrated thermodynamic and electrical models to stress-test station resiliency against catastrophic failure combinations that haven't yet occurred in the real station.",
  },
];

export default function AboutPage() {
  const [activeFacet, setActiveFacet] = useState(TWIN_FACETS[0]);
  const [activePipelineStep, setActivePipelineStep] = useState(PIPELINE_STAGES[1]);
  const [activeTab, setActiveTab] = useState<"qos" | "dependencies" | "stack">("qos");

  const easeEng = [0.32, 0.72, 0, 1] as const;

  return (
    <main className="min-h-screen w-full bg-[#06090E] text-[#F8FAFC] px-4 sm:px-6 lg:px-10 py-6 max-w-7xl mx-auto">
      <TopographicBg showRadarRings={false} />

      <div className="flex flex-col gap-16 relative z-10">
        
        {/* =========================================================
            SECTION 1: HERO & POLAR STATION METADATA
           ========================================================= */}
        <section className="flex flex-col gap-8 pt-4">
          
          {/* Eyebrow & Live Location Tag */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeEng }}
            className="flex flex-wrap items-center gap-3"
          >
            <Link
              href="/dashboard"
              className="w-9 h-9 rounded-md bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center transition-all text-[#94A3B8] hover:text-[#FFFFFF]"
              aria-label="Return to Cockpit"
            >
              <ArrowLeft size={16} />
            </Link>

            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-mono tracking-wider uppercase bg-[#06090E]/80 border border-white/[0.08] text-[#94A3B8]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              Maitri Station · 70°45′58″ S · 11°43′56″ E
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-mono tracking-wider uppercase bg-white/[0.03] border border-white/[0.08] text-[#CBD5E1]">
              <Sparkle size={12} weight="fill" className="text-[#94A3B8]" />
              NCPOR / Ministry of Earth Sciences
            </span>
          </motion.div>

          {/* Agency Headline */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: easeEng }}
            className="max-w-4xl"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-headline tracking-tight font-bold leading-[1.1] mb-5 text-[#FFFFFF]">
              Autonomous Intelligence<br />for the Frozen Continent.
            </h1>
            <p className="text-[#94A3B8] text-base md:text-lg font-light leading-relaxed max-w-3xl">
              The <strong className="text-[#FFFFFF] font-medium">Maitri Digital Twin</strong> is not a static 3D model. 
              It is a source-aware, fault-tolerant cyber-physical representation engineered to bridge 11,000 km of extreme isolation 
              between the harsh polar desert of Antarctica and mission control in India.
            </p>
          </motion.div>

          {/* Polar Telemetry Matrix Bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: easeEng }}
            className="bezel-shell p-1"
          >
            <div className="bezel-core p-5 md:p-6 grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-white/[0.06]">
              <div className="flex flex-col gap-1 pt-2 md:pt-0">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#64748B] flex items-center gap-1.5">
                  <ThermometerCold size={14} className="text-[#94A3B8]" />
                  Thermal Envelope
                </span>
                <span className="text-xl md:text-2xl font-mono font-medium text-[#FFFFFF] tracking-tight">-40°C to +5°C</span>
                <span className="text-[11px] text-[#94A3B8]">Katabatic Winds &gt;250 km/h</span>
              </div>

              <div className="flex flex-col gap-1 pt-4 md:pt-0 md:pl-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#64748B] flex items-center gap-1.5">
                  <Lightning size={14} className="text-[#94A3B8]" />
                  Power Resilience
                </span>
                <span className="text-xl md:text-2xl font-mono font-medium text-[#FFFFFF] tracking-tight">3x 62.5 kVA</span>
                <span className="text-[11px] text-[#94A3B8]">n+2 Kirloskar Diesel Grid</span>
              </div>

              <div className="flex flex-col gap-1 pt-4 md:pt-0 md:pl-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#64748B] flex items-center gap-1.5">
                  <Waves size={14} className="text-[#94A3B8]" />
                  Water Lifeline
                </span>
                <span className="text-xl md:text-2xl font-mono font-medium text-[#FFFFFF] tracking-tight">2.5 km Intake</span>
                <span className="text-[11px] text-[#94A3B8]">Lake Priyadarshini Trace Heat</span>
              </div>

              <div className="flex flex-col gap-1 pt-4 md:pt-0 md:pl-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#64748B] flex items-center gap-1.5">
                  <Broadcast size={14} className="text-[#94A3B8]" />
                  Mainland Sync
                </span>
                <span className="text-xl md:text-2xl font-mono font-medium text-[#FFFFFF] tracking-tight">Prioritized Edge</span>
                <span className="text-[11px] text-[#94A3B8]">90-Day Store-and-Forward</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* =========================================================
            SECTION 2: THE 6 FACETS OF THE DIGITAL TWIN (INTERACTIVE)
           ========================================================= */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="h-px w-5 bg-white/30" />
                <span className="text-xs font-mono uppercase tracking-widest text-[#94A3B8] font-medium">
                  The Six Facets
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-headline font-bold text-[#FFFFFF] tracking-tight">
                Not Just a 3D Model. A Complete Twin Architecture.
              </h2>
            </div>
            <p className="text-xs font-mono text-[#64748B] max-w-md">
              Select a facet below to explore how spatial, semantic, state, predictive, and counterfactual representations unite into a living operational twin.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Facet Selector Pills */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
              {TWIN_FACETS.map((facet) => {
                const isSelected = activeFacet.id === facet.id;
                const Icon = facet.icon;
                return (
                  <button
                    key={facet.id}
                    onClick={() => setActiveFacet(facet)}
                    className={`group text-left p-3.5 rounded-lg border transition-all duration-200 relative ${
                      isSelected
                        ? "bg-[#0E1626] border-white/30 shadow-[0_2px_12px_rgba(0,0,0,0.5)] text-[#FFFFFF]"
                        : "bg-[#070B12] border-white/[0.06] hover:border-white/15 hover:bg-[#0B101A] text-[#94A3B8]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-md flex items-center justify-center border transition-colors ${
                            isSelected
                              ? "bg-white/[0.08] border-white/20 text-[#FFFFFF]"
                              : "bg-white/[0.02] border-white/[0.06] text-[#64748B] group-hover:text-[#FFFFFF]"
                          }`}
                        >
                          <Icon size={16} weight={isSelected ? "fill" : "regular"} />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-[#FFFFFF]">{facet.title}</div>
                          <div className="text-[10px] font-mono text-[#64748B]">{facet.badge}</div>
                        </div>
                      </div>
                      <CaretRight
                        size={14}
                        className={`transition-transform duration-200 ${
                          isSelected ? "translate-x-1 text-[#FFFFFF]" : "opacity-0 group-hover:opacity-100 text-[#64748B]"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Facet Deep-Dive Display Card */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFacet.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bezel-shell p-1 h-full"
                >
                  <div className="bezel-core p-6 md:p-8 flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] pb-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/[0.06] border border-white/15 text-[#FFFFFF]">
                          <activeFacet.icon size={24} weight="duotone" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-[#94A3B8]">
                            {activeFacet.badge}
                          </span>
                          <h3 className="text-xl md:text-2xl font-headline font-bold text-[#FFFFFF] tracking-tight">
                            {activeFacet.title}
                          </h3>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-[#64748B] uppercase border border-white/[0.08] rounded px-2.5 py-1 bg-[#06090E]/60">
                        Pillar 0{TWIN_FACETS.findIndex((f) => f.id === activeFacet.id) + 1}
                      </span>
                    </div>

                    {/* Lead & Description */}
                    <div className="space-y-3">
                      <p className="text-base text-[#F8FAFC] font-medium leading-relaxed">{activeFacet.lead}</p>
                      <p className="text-xs md:text-sm text-[#94A3B8] leading-relaxed font-light">{activeFacet.description}</p>
                    </div>

                    {/* Technical Specifications Matrix */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-lg bg-[#06090E]/80 border border-white/[0.06]">
                      {activeFacet.techDetails.map((detail, idx) => (
                        <div key={idx} className="flex flex-col gap-1">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-[#64748B]">
                            {detail.label}
                          </span>
                          <span className="text-xs font-mono font-medium text-[#F8FAFC]">{detail.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Operational Impact Box */}
                    <div className="p-4 rounded-lg bg-white/[0.02] border-l-2 border-[#10B981] border border-white/[0.04]">
                      <div className="flex items-center gap-2 mb-1.5 text-xs font-mono uppercase tracking-wider text-[#10B981]">
                        <CheckCircle size={15} weight="fill" />
                        Operational Reality at 70° South
                      </div>
                      <p className="text-xs text-[#CBD5E1] leading-relaxed font-light">
                        {activeFacet.operationalRole}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 3: PIPELINE ARCHITECTURE (EDGE TO CLOUD)
           ========================================================= */}
        <section className="flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-px w-5 bg-white/30" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#94A3B8] font-medium">
                Data Synchronization Highway
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-headline font-bold text-[#FFFFFF] tracking-tight">
              From Extreme Physical Edge to Mainland Decision Support
            </h2>
            <p className="text-[#94A3B8] text-xs md:text-sm mt-1 max-w-2xl">
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
                  className={`p-3.5 rounded-lg border text-left transition-all duration-200 ${
                    isSelected
                      ? "bg-[#0E1626] border-white/30 shadow-[0_2px_12px_rgba(0,0,0,0.5)] text-[#FFFFFF]"
                      : "bg-[#070B12] border-white/[0.06] hover:border-white/15 hover:bg-[#0B101A] text-[#94A3B8]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-[#64748B]">{stage.step}</span>
                    <Icon
                      size={16}
                      className={isSelected ? "text-[#FFFFFF]" : "text-[#64748B]"}
                      weight={isSelected ? "fill" : "regular"}
                    />
                  </div>
                  <div className="text-xs font-medium text-[#FFFFFF] truncate">{stage.name}</div>
                  <div className="text-[10px] font-mono text-[#64748B] truncate">{stage.subtitle}</div>
                </button>
              );
            })}
          </div>

          {/* Active Pipeline Stage Breakdown */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activePipelineStep.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bezel-shell p-1"
            >
              <div className="bezel-core p-6 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-7 flex flex-col gap-5">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase bg-white/[0.06] text-[#CBD5E1] border border-white/15">
                        Stage {activePipelineStep.step} of 05
                      </span>
                      <span className="text-xs font-mono text-[#64748B]">{activePipelineStep.badge}</span>
                    </div>

                    <div>
                      <h3 className="text-xl md:text-2xl font-headline font-bold text-[#FFFFFF] mb-2">{activePipelineStep.name}</h3>
                      <p className="text-[#94A3B8] text-xs md:text-sm leading-relaxed">{activePipelineStep.summary}</p>
                    </div>

                    <div className="p-3.5 rounded-lg bg-[#06090E]/80 border border-white/[0.06]">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#F59E0B] block mb-1">
                        Polar Edge Resilience Factor
                      </span>
                      <p className="text-xs text-[#CBD5E1] leading-relaxed">{activePipelineStep.edgeFactor}</p>
                    </div>
                  </div>

                  <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
                      Technical Architecture Metrics
                    </span>
                    {activePipelineStep.keySpecs.map((spec, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-[#06090E]/80 border border-white/[0.06] flex items-center justify-between"
                      >
                        <span className="text-xs text-[#94A3B8]">{spec.key}</span>
                        <span className="text-xs font-mono font-medium text-[#F8FAFC]">{spec.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* =========================================================
            SECTION 4: REAL ANTARCTIC ENGINEERING CRISIS CASES
           ========================================================= */}
        <section className="flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-px w-5 bg-white/30" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#94A3B8] font-medium">
                Operational Vulnerabilities
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-headline font-bold text-[#FFFFFF] tracking-tight">
              Why Maitri Requires a Digital Twin
            </h2>
            <p className="text-[#94A3B8] text-xs md:text-sm mt-1 max-w-2xl">
              Antarctica forgives no assumptions. A single undetected fault triggers immediate cascading failure. 
              The digital twin models three high-risk survival bottlenecks:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Water Line Freeze */}
            <div className="bezel-shell p-1">
              <div className="bezel-core p-6 flex flex-col justify-between gap-5 h-full">
                <div className="space-y-3">
                  <div className="w-9 h-9 rounded-md bg-white/[0.04] border border-white/[0.08] text-[#FFFFFF] flex items-center justify-center">
                    <Waves size={18} weight="fill" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8]">
                      The 45-Minute Window
                    </span>
                    <h3 className="text-base font-semibold text-[#FFFFFF] mt-0.5">Lake Priyadarshini Water Line</h3>
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    Maitri&apos;s freshwater is pumped 2.5 km across barren permafrost rock from Lake Priyadarshini. 
                    Continuous trace heating keeps the pipe above 0°C. If power drops during a -35°C blizzard, water freezes solid in 
                    <span className="text-[#FFFFFF] font-medium"> under 45 minutes</span>, rupturing the pipeline.
                  </p>
                </div>
                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-[#64748B]">
                  <span>Model: Thermal Dissipation</span>
                  <span className="text-[#F8FAFC] font-medium">Auto-Alert: &lt;3.2°C</span>
                </div>
              </div>
            </div>

            {/* Card 2: 8-Month Fuel Isolation */}
            <div className="bezel-shell p-1">
              <div className="bezel-core p-6 flex flex-col justify-between gap-5 h-full">
                <div className="space-y-3">
                  <div className="w-9 h-9 rounded-md bg-white/[0.04] border border-white/[0.08] text-[#FFFFFF] flex items-center justify-center">
                    <Lightning size={18} weight="fill" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8]">
                      Zero Resupply
                    </span>
                    <h3 className="text-base font-semibold text-[#FFFFFF] mt-0.5">Winter Fuel Depletion Balance</h3>
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    During 8 months of polar night, no aircraft or relief vessel can land. Every kilowatt of electrical heat, melt-water, 
                    and cooking relies on Arctic Jet A-1. An undetected micro-leak or miscalculated generator burn rate threatens total blackout.
                  </p>
                </div>
                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-[#64748B]">
                  <span>Model: Mass-Energy Balance</span>
                  <span className="text-[#10B981] font-medium">Reserve: &gt;140d</span>
                </div>
              </div>
            </div>

            {/* Card 3: Blizzard Comms Blackout */}
            <div className="bezel-shell p-1">
              <div className="bezel-core p-6 flex flex-col justify-between gap-5 h-full">
                <div className="space-y-3">
                  <div className="w-9 h-9 rounded-md bg-white/[0.04] border border-white/[0.08] text-[#FFFFFF] flex items-center justify-center">
                    <Broadcast size={18} weight="fill" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8]">
                      Disconnected Autonomy
                    </span>
                    <h3 className="text-base font-semibold text-[#FFFFFF] mt-0.5">Satellite Link Decoupling</h3>
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    Katabatic blizzards deflect the station radome dishes and induce severe ionospheric interference, causing satellite outages 
                    lasting up to 72 hours. The twin runs locally at the edge with full autonomous decision support, buffering telemetry.
                  </p>
                </div>
                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-[#64748B]">
                  <span>Buffer: Store-and-Forward</span>
                  <span className="text-[#F8FAFC] font-medium">Capacity: 90 Days</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 5: SOURCE PROVENANCE & EVIDENCE CONFIDENCE
           ========================================================= */}
        <section className="flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-px w-5 bg-white/30" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#94A3B8] font-medium">
                Data Integrity & Truth
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-headline font-bold text-[#FFFFFF] tracking-tight">
              Source Provenance and Evidence Confidence
            </h2>
            <p className="text-[#94A3B8] text-xs md:text-sm mt-1 max-w-2xl">
              Unlike theoretical simulations, every parameter and coordinate in the Maitri Digital Twin retains its provenance tag, 
              guaranteeing operators know exactly which data is officially verified versus synthetic.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROVENANCE_TIERS.map((tier) => (
              <div key={tier.tag} className="bezel-shell p-1">
                <div className="bezel-core p-5 flex flex-col justify-between gap-4 h-full">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${tier.color}`}>
                        {tier.tag}
                      </span>
                      <ShieldCheck size={16} className="text-[#64748B]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-[#FFFFFF]">{tier.label}</h4>
                      <span className="text-[11px] font-mono text-[#64748B]">{tier.confidence}</span>
                    </div>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">{tier.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================
            SECTION 6: TECHNICAL DEEP-DIVE TABS
           ========================================================= */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="h-px w-5 bg-white/30" />
                <span className="text-xs font-mono uppercase tracking-widest text-[#94A3B8] font-medium">
                  Technical Specifications
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-headline font-bold text-[#FFFFFF] tracking-tight">
                System Protocols & Execution Topology
              </h2>
            </div>

            {/* Tab Switcher Pills */}
            <div className="flex items-center p-1 bg-[#06090E]/90 rounded-md border border-white/[0.08] w-fit font-mono text-xs">
              <button
                onClick={() => setActiveTab("qos")}
                className={`px-3.5 py-1.5 rounded transition-all ${
                  activeTab === "qos" ? "bg-white/[0.08] text-[#FFFFFF] font-medium border border-white/15" : "text-[#94A3B8] hover:text-[#FFFFFF]"
                }`}
              >
                Satellite QoS Triage
              </button>
              <button
                onClick={() => setActiveTab("dependencies")}
                className={`px-3.5 py-1.5 rounded transition-all ${
                  activeTab === "dependencies" ? "bg-white/[0.08] text-[#FFFFFF] font-medium border border-white/15" : "text-[#94A3B8] hover:text-[#FFFFFF]"
                }`}
              >
                Dependency Cascade
              </button>
              <button
                onClick={() => setActiveTab("stack")}
                className={`px-3.5 py-1.5 rounded transition-all ${
                  activeTab === "stack" ? "bg-white/[0.08] text-[#FFFFFF] font-medium border border-white/15" : "text-[#94A3B8] hover:text-[#FFFFFF]"
                }`}
              >
                Software Stack
              </button>
            </div>
          </div>

          <div className="bezel-shell p-1">
            <div className="bezel-core p-6 md:p-8">
              {activeTab === "qos" && (
                <div className="flex flex-col gap-5">
                  <div>
                    <h3 className="text-base font-semibold text-[#FFFFFF]">Dynamic Packet Classification (Constrained Link)</h3>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      When satellite bandwidth throttles to under 64 kbps during geomagnetic storms, packets are strictly scheduled:
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/[0.08] text-[#64748B] font-mono">
                          <th className="pb-3 font-normal">Class</th>
                          <th className="pb-3 font-normal">Data Stream</th>
                          <th className="pb-3 font-normal">Disruption Policy</th>
                          <th className="pb-3 font-normal">Delivery Target</th>
                          <th className="pb-3 font-normal">Drop Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04] font-mono">
                        <tr>
                          <td className="py-3 text-[#EF4444] font-semibold">Class A (Urgent)</td>
                          <td className="py-3 text-[#F8FAFC]">Generator Trips, Fire/CO2, Pipeline Freeze Alerts</td>
                          <td className="py-3 text-[#94A3B8]">Preempts all traffic; instant burst</td>
                          <td className="py-3 text-[#F8FAFC]">&lt;50 ms</td>
                          <td className="py-3 text-[#10B981]">0.0% (Zero loss)</td>
                        </tr>
                        <tr>
                          <td className="py-3 text-[#F59E0B] font-semibold">Class B (Telemetry)</td>
                          <td className="py-3 text-[#F8FAFC]">Bus voltages, fuel levels, boiler heat, wind speed</td>
                          <td className="py-3 text-[#94A3B8]">Downsampled from 10Hz to 1Hz if link degrades</td>
                          <td className="py-3 text-[#F8FAFC]">&lt;5 seconds</td>
                          <td className="py-3 text-[#94A3B8]">&lt;1.0%</td>
                        </tr>
                        <tr>
                          <td className="py-3 text-[#CBD5E1] font-semibold">Class C (Bulk Logs)</td>
                          <td className="py-3 text-[#F8FAFC]">Vibration FFT spectra, webcam snapshots, raw met logs</td>
                          <td className="py-3 text-[#94A3B8]">100% buffered to local NVMe store until clear weather</td>
                          <td className="py-3 text-[#CBD5E1]">Opportunistic</td>
                          <td className="py-3 text-[#94A3B8]">Buffered locally</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "dependencies" && (
                <div className="flex flex-col gap-5">
                  <div>
                    <h3 className="text-base font-semibold text-[#FFFFFF]">Cross-Domain Graph Dependency Engine</h3>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      How the semantic ontology traces cascading impacts across isolated physical domains:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-[#06090E]/80 border border-white/[0.06]">
                      <span className="text-[10px] font-mono text-[#64748B] block mb-1">01. Root Asset Event</span>
                      <h4 className="text-xs font-semibold text-[#EF4444]">Gen-Set #1 Trips</h4>
                      <p className="text-[11px] text-[#94A3B8] mt-2">
                        Fuel injector clogging triggers over-temperature trip on Kirloskar engine.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-[#06090E]/80 border border-white/[0.06]">
                      <span className="text-[10px] font-mono text-[#64748B] block mb-1">02. Electrical Bus Shift</span>
                      <h4 className="text-xs font-semibold text-[#F59E0B]">Switchboard Bus Shedding</h4>
                      <p className="text-[11px] text-[#94A3B8] mt-2">
                        Twin calculates remaining 62.5 kVA capacity; flags secondary laboratory heating sheds.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-[#06090E]/80 border border-white/[0.06]">
                      <span className="text-[10px] font-mono text-[#64748B] block mb-1">03. Thermal Cascade</span>
                      <h4 className="text-xs font-semibold text-[#CBD5E1]">Lake Priyadarshini Trace Alert</h4>
                      <p className="text-[11px] text-[#94A3B8] mt-2">
                        System detects trace-heating breaker prioritized on Main Bus A; confirms water line safe.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-[#06090E]/80 border border-white/[0.06]">
                      <span className="text-[10px] font-mono text-[#64748B] block mb-1">04. Decision Protocol</span>
                      <h4 className="text-xs font-semibold text-[#10B981]">Automated Dispatch</h4>
                      <p className="text-[11px] text-[#94A3B8] mt-2">
                        Dispatches step-by-step injector replacement checklist to station engineering crew.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "stack" && (
                <div className="flex flex-col gap-5">
                  <div>
                    <h3 className="text-base font-semibold text-[#FFFFFF]">Production Software Architecture</h3>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      Modern, resilient, zero-friction technologies driving the edge and visualization layers:
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="p-3.5 rounded-lg bg-[#06090E]/80 border border-white/[0.06]">
                      <span className="text-[10px] text-[#64748B] uppercase block">Frontend Core</span>
                      <span className="text-[#FFFFFF] font-semibold">Next.js 16 (App Router)</span>
                    </div>
                    <div className="p-3.5 rounded-lg bg-[#06090E]/80 border border-white/[0.06]">
                      <span className="text-[10px] text-[#64748B] uppercase block">3D & Spatial Engine</span>
                      <span className="text-[#FFFFFF] font-semibold">Three.js / WebGL GLTF</span>
                    </div>
                    <div className="p-3.5 rounded-lg bg-[#06090E]/80 border border-white/[0.06]">
                      <span className="text-[10px] text-[#64748B] uppercase block">Motion Choreography</span>
                      <span className="text-[#FFFFFF] font-semibold">Framer Motion Spring</span>
                    </div>
                    <div className="p-3.5 rounded-lg bg-[#06090E]/80 border border-white/[0.06]">
                      <span className="text-[10px] text-[#64748B] uppercase block">Styling Architecture</span>
                      <span className="text-[#FFFFFF] font-semibold">Deep Muted Arctic Slate</span>
                    </div>
                    <div className="p-3.5 rounded-lg bg-[#06090E]/80 border border-white/[0.06]">
                      <span className="text-[10px] text-[#64748B] uppercase block">Telemetry Streaming</span>
                      <span className="text-[#FFFFFF] font-semibold">WebSockets + MQTT TLS</span>
                    </div>
                    <div className="p-3.5 rounded-lg bg-[#06090E]/80 border border-white/[0.06]">
                      <span className="text-[10px] text-[#64748B] uppercase block">Data Storage</span>
                      <span className="text-[#FFFFFF] font-semibold">InfluxDB + MongoDB</span>
                    </div>
                    <div className="p-3.5 rounded-lg bg-[#06090E]/80 border border-white/[0.06]">
                      <span className="text-[10px] text-[#64748B] uppercase block">Edge Buffer</span>
                      <span className="text-[#FFFFFF] font-semibold">RocksDB / SQLite NVMe</span>
                    </div>
                    <div className="p-3.5 rounded-lg bg-[#06090E]/80 border border-white/[0.06]">
                      <span className="text-[10px] text-[#64748B] uppercase block">Simulation Core</span>
                      <span className="text-[#FFFFFF] font-semibold">Python Physics State-Space</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 7: NEXT STEP NAVIGATION CTA
           ========================================================= */}
        <section className="pt-4 pb-12">
          <div className="bezel-shell p-1">
            <div className="bezel-core p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1.5 text-center md:text-left">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#94A3B8] font-medium">
                  Experience the Living Twin
                </span>
                <h3 className="text-xl md:text-2xl font-headline font-bold text-[#FFFFFF] tracking-tight">
                  Ready to inspect real station telemetry?
                </h3>
                <p className="text-xs text-[#94A3B8] max-w-lg">
                  Explore the 3D cutaway visualization, test what-if blizzard simulations, or inspect the live edge network topology.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/dashboard"
                  className="group relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-md bg-[#FFFFFF] text-[#06090E] font-semibold text-xs transition-all hover:bg-[#E2E8F0] active:scale-[0.98]"
                >
                  <span>Open Mission Console</span>
                  <ArrowUpRight size={14} weight="bold" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>

                <Link
                  href="/simulations"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#FFFFFF] font-medium text-xs transition-all"
                >
                  <Flask size={14} />
                  <span>Run Simulations</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
