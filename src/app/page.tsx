"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  ArrowRight,
  Lightning,
  Waves,
  SlidersHorizontal,
  Cpu,
  Warning,
  CheckCircle,
  Flask,
  Globe,
  Database,
  GasPump,
  Broadcast,
  Compass,
  Eye,
} from "@phosphor-icons/react";
import { TopographicBg } from "@/components/TopographicBg";
import { MaitriStationTwin } from "@/components/MaitriStationTwin";
import { BharatiStationTwin } from "@/components/BharatiStationTwin";
import { TelemetryTicker } from "@/components/TelemetryTicker";

/*
 * ANTARCTIC DESIGN SYSTEM
 * ─────────────────────────────────────────────────────
 * Polar Night Base:    #03060E / #05101C / #07141F
 * Glacier Ice Teal:    #0DB9D0  (compressed glacial meltwater)
 * Aurora Green:        #00D4A0  (Aurora Australis primary band)
 * Aurora Violet:       #7B5EC8  (southern aurora edge glow)
 * Polar Amber:         #D49020  (low polar sun on the horizon)
 * Ice-Station Red:     #D93030  (emergency alert / critical system)
 * Blizzard White:      #EBF5FC  (cold, blue-tinted white — not pure white)
 * Glacial Muted:       #4A7A8E  (text on dark — like ice in shadow)
 * Deep Polar Slate:    #1E3A48  (subdued borders, label text)
 * ─────────────────────────────────────────────────────
 */

// ─── Shared Motion Variants ───────────────────────────────────────────────────
const EASE = [0.32, 0.72, 0, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.12, ease: EASE },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: { duration: 0.9, delay: i * 0.1, ease: EASE },
  }),
};

// ─── Section Label ─────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="h-px w-8 bg-[#0DB9D0]/40" />
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#3A6A7A]">
        {children}
      </span>
    </div>
  );
}

// ─── Stat Block (Act II) ───────────────────────────────────────────────────────
function StatBlock({
  value,
  unit,
  label,
  accent,
  delay,
}: {
  value: string;
  unit?: string;
  label: string;
  accent: string;
  delay?: number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      custom={delay ?? 0}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className="relative group overflow-hidden flex flex-col gap-2 p-6 rounded-2xl bg-[#03060E]/40 backdrop-blur-xl border border-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.1)] hover:bg-[#03060E]/70 hover:border-white/[0.15] transition-all duration-500 hover:-translate-y-1"
    >
      {/* Ambient background glow */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 blur-[60px] opacity-20 group-hover:opacity-50 transition-opacity duration-700 bg-current ${accent}`} />
      
      <div className="relative z-10">
        <div className={`font-mono text-4xl sm:text-5xl font-bold tracking-tight drop-shadow-[0_0_12px_currentColor] ${accent}`}>
          {value}
          {unit && (
            <span className="text-2xl sm:text-3xl ml-1 opacity-60">{unit}</span>
          )}
        </div>
        <p className="text-[13px] text-[#7ABBD4] font-sans leading-relaxed mt-1 font-medium">
          {label}
        </p>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [selectedTwin, setSelectedTwin] = useState<"maitri" | "bharati">("maitri");

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroDrift = useTransform(scrollYProgress, [0, 0.6], [0, -60]);

  return (
    <div className="relative w-full min-h-screen bg-transparent text-[#EBF5FC] font-sans overflow-x-hidden selection:bg-[#0DB9D0]/20">
      <TopographicBg showRadarRings={false} />

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ACT I — THE VOID                                              */}
      {/* Full-bleed cinematic hero. Antarctica. Silence. The scale.   */}
      {/* ══════════════════════════════════════════════════════════════ */}
      
      {/* Hero Photographic Background (Fades into black) */}
      <div className="absolute top-0 left-0 w-full h-[100vh] z-0 pointer-events-none select-none overflow-hidden">
        <img
          src="/backgrounds/antarctic-bg.jpg"
          alt=""
          className="w-full h-full object-cover object-[center_75%] opacity-[0.85] mix-blend-screen"
          style={{ 
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 85%, transparent 100%)", 
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 85%, transparent 100%)" 
          }}
        />
        <div className="absolute inset-0 bg-[#0DB9D0]/5 mix-blend-color-dodge" />
      </div>
      <section
        ref={heroRef}
        className="relative z-10 min-h-[100dvh] flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-24 max-w-7xl mx-auto"
      >
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="polar-snow opacity-40" aria-hidden="true" />
        </div>
        <motion.div
          style={{ opacity: heroOpacity, y: heroDrift }}
          className="flex flex-col"
        >
          {/* Eyebrow */}
          <motion.div
            variants={fadeUp}
            custom={0}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center gap-3 sm:gap-4 mb-10 font-mono text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-[#7ABBD4]"
          >
            <div className="flex items-center gap-2">
              {/* Technical block instead of a circle */}
              <span className="w-1.5 h-3.5 bg-[#0DB9D0] shadow-[0_0_8px_rgba(13,185,208,0.6)] animate-pulse" />
              <span className="font-semibold text-[#EBF5FC]">NCPOR · MoES</span>
            </div>
            <div className="hidden sm:block w-8 h-px bg-[#0DB9D0]/30" />
            <span className="text-[#3A7A8A]">44th ISEA Mission</span>
          </motion.div>

          {/* Cinematic staggered headline */}
          <div className="overflow-hidden mb-2">
            <motion.h1
              variants={fadeUp}
              custom={0.5}
              initial="hidden"
              animate="visible"
              className="text-[clamp(2.8rem,7.5vw,6.8rem)] font-semibold tracking-[-0.04em] leading-[1.04] text-[#EBF5FC]"
            >
              India&apos;s Antarctic
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-2">
            <motion.h1
              variants={fadeUp}
              custom={0.65}
              initial="hidden"
              animate="visible"
              className="text-[clamp(2.8rem,7.5vw,6.8rem)] font-semibold tracking-[-0.04em] leading-[1.04] text-[#EBF5FC]"
            >
              research stations —
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-10">
            <motion.h1
              variants={fadeUp}
              custom={0.8}
              initial="hidden"
              animate="visible"
              className="text-[clamp(2.8rem,7.5vw,6.8rem)] font-semibold tracking-[-0.04em] leading-[1.04] text-[#EBF5FC] opacity-90"
            >
              now virtualized.
            </motion.h1>
          </div>

          {/* Sub-copy */}
          <motion.p
            variants={fadeUp}
            custom={1.1}
            initial="hidden"
            animate="visible"
            className="text-[15px] sm:text-[17px] text-[#7ABBD4] font-light leading-relaxed max-w-2xl mb-12 opacity-80"
          >
            A real-time Digital Twin of{" "}
            <strong className="text-[#EBF5FC] font-medium">Maitri</strong> and{" "}
            <strong className="text-[#EBF5FC] font-medium">Bharati</strong>{" "}
            research stations. Predict microgrid failures, freeze cascades, and
            fuel runways — from 11,000 km away.
          </motion.p>

          {/* CTA Row */}
          <motion.div
            variants={fadeUp}
            custom={1.3}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-0 pl-6 pr-2 py-2 rounded-full bg-[#0DB9D0]/15 backdrop-blur-md border border-[#0DB9D0]/30 text-white font-mono text-xs uppercase tracking-widest hover:bg-[#0DB9D0]/25 hover:border-[#0DB9D0]/50 transition-all duration-300 active:scale-[0.97] shadow-[0_0_20px_rgba(13,185,208,0.15)] hover:shadow-[0_0_30px_rgba(13,185,208,0.3)]"
            >
              <span className="mr-5 font-semibold">Enter the Cockpit</span>
              <span className="w-8 h-8 rounded-full bg-[#0DB9D0]/20 group-hover:bg-[#0DB9D0]/40 flex items-center justify-center transition-all text-white">
                <ArrowUpRight
                  size={14}
                  weight="bold"
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
            </Link>

            <Link
              href="/simulations"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#0DB9D0]/20 bg-[#0DB9D0]/5 hover:bg-[#0DB9D0]/15 hover:border-[#0DB9D0]/40 text-[#7ABBD4] hover:text-white font-mono text-xs uppercase tracking-widest transition-all duration-300 backdrop-blur-sm shadow-[0_0_15px_rgba(13,185,208,0.0)] hover:shadow-[0_0_20px_rgba(13,185,208,0.1)]"
            >
              <Flask size={13} weight="duotone" />
              <span className="font-semibold">Simulate a Crisis</span>
            </Link>
          </motion.div>
        </motion.div>

      {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="absolute bottom-16 left-6 sm:left-10 lg:left-16 flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-[#1E3A48]"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            className="w-px h-8 bg-gradient-to-b from-transparent via-[#0DB9D0]/40 to-transparent"
          />
          Scroll to explore
        </motion.div>
        
        <TelemetryTicker />
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ACT 1.5 — THE SPATIAL DIGITAL TWIN                           */}
      {/* Interactive 3D WebGL Multi-Utility Model & Person-View Locks */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto border-t border-[#0D3040]/60">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <SectionLabel>Spatial Digital Twin // Photogrammetric &amp; BIM Replica</SectionLabel>
            <h2 className="text-[clamp(2.2rem,4.5vw,3.8rem)] font-semibold tracking-[-0.03em] leading-[1.08] text-white">
              {selectedTwin === "maitri" ? "Maitri Station" : "Bharati Station"} Virtual Replica &amp;<br />
              Multi-Utility Lifeline Matrix
            </h2>
            <p className="text-[15px] sm:text-[16px] text-[#7ABBD4] font-light leading-relaxed max-w-2xl mt-4 opacity-85">
              {selectedTwin === "maitri"
                ? "Accurate 3D digital twin engineered from CAD elevations and satellite geometry. Inspect all 5 multi-utility pipeline lifelines (Freshwater, Fuel, Sewage, Power, Heat-Tracing), trigger X-Ray roof elevation, or lock your view inside any of the 16 station facilities at sitting eye-level."
                : "Aerodynamic modular twin built from 134 ISO container modules overlooking Prydz Bay in Larsemann Hills. Features complete CHP cogeneration, desalination RO plant, ISRO satellite downlink ground station, and 16 interior person-view locks."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Station Switcher Pill */}
            <div className="flex items-center p-1 rounded-full bg-[#040D1A]/90 border border-white/10 backdrop-blur-2xl shadow-xl font-mono text-xs">
              <button
                onClick={() => setSelectedTwin("maitri")}
                className={`px-3.5 py-1.5 rounded-full uppercase tracking-wider text-[11px] font-semibold transition-all ${
                  selectedTwin === "maitri"
                    ? "bg-[#0DB9D0]/20 text-[#0DB9D0] border border-[#0DB9D0]/40 shadow-[0_0_12px_rgba(13,185,208,0.3)]"
                    : "text-[#7ABBD4] hover:text-white"
                }`}
              >
                Maitri (70°S)
              </button>
              <button
                onClick={() => setSelectedTwin("bharati")}
                className={`px-3.5 py-1.5 rounded-full uppercase tracking-wider text-[11px] font-semibold transition-all ${
                  selectedTwin === "bharati"
                    ? "bg-[#00A8FF]/20 text-[#00A8FF] border border-[#00A8FF]/40 shadow-[0_0_12px_rgba(0,168,255,0.3)]"
                    : "text-[#7ABBD4] hover:text-white"
                }`}
              >
                Bharati (69°S)
              </button>
            </div>

            <Link
              href={selectedTwin === "maitri" ? "/twin" : "/twin/bharati"}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0DB9D0]/20 hover:bg-[#0DB9D0]/30 border border-[#0DB9D0]/50 text-[#EBF5FC] font-mono text-xs uppercase tracking-widest font-semibold transition-all shadow-[0_0_20px_rgba(13,185,208,0.25)] hover:shadow-[0_0_30px_rgba(13,185,208,0.4)]"
            >
              <Compass size={16} weight="duotone" className="text-[#0DB9D0]" />
              <span>Full-Screen Cockpit</span>
              <ArrowUpRight size={13} weight="bold" />
            </Link>
          </div>
        </div>

        {/* ── THE 3D TWIN VIEWPORT CONTAINER ── */}
        <div className="bezel-shell p-1.5 rounded-[2.5rem] bg-gradient-to-b from-[#0DB9D0]/20 via-[#04101E]/60 to-transparent shadow-[0_30px_100px_rgba(0,0,0,0.9)]">
          <div className="bezel-core rounded-[calc(2.5rem-0.375rem)] overflow-hidden bg-[#03060E] border border-white/10">
            {selectedTwin === "maitri" ? (
              <MaitriStationTwin key="maitri-home" className="w-full h-[720px] sm:h-[800px]" enableFullscreenButton={true} />
            ) : (
              <BharatiStationTwin key="bharati-home" className="w-full h-[720px] sm:h-[800px]" enableFullscreenButton={true} />
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ACT II — THE STAKES                                           */}
      {/* The brutal physics of polar survival.                        */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-32 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto border-t border-[#0D3040]/60">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="polar-snow opacity-40" aria-hidden="true" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start mb-24">

          {/* Left: Narrative */}
          <motion.div
            variants={fadeUp}
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <SectionLabel>Act II — The Stakes</SectionLabel>
            <h2 className="text-[clamp(2rem,4.5vw,3.6rem)] font-semibold tracking-[-0.03em] leading-[1.1] text-white mb-6">
              Operating at the edge<br />
              of what&apos;s survivable.
            </h2>
            <div className="relative pl-6 border-l-2 border-[#0DB9D0]/15 space-y-6 mt-8">
              <div className="absolute top-0 -left-[2px] w-[2px] h-12 bg-gradient-to-b from-[#0DB9D0] to-transparent" />
              <p className="text-[15px] sm:text-[16px] text-[#7ABBD4] leading-relaxed max-w-lg font-light">
                Maitri station at 70°S is not simply remote — it is categorically
                isolated. From March to November, katabatic winds lock the
                continent in total darkness. <strong className="text-white font-medium">No aircraft. No ships. No rescue.</strong>
              </p>
              <p className="text-[15px] sm:text-[16px] text-[#7ABBD4] leading-relaxed max-w-lg font-light">
                23 crew members must operate every critical system — power, water,
                heat, comms — with zero external support for 240 days. <strong className="text-[#FF9090] font-medium">One failure cascades into the next.</strong>
              </p>
            </div>
          </motion.div>

          {/* Right: Physics Stats */}
          <div className="flex flex-col pt-4 lg:pt-0">
            <div className="flex items-center gap-3 mb-5 pl-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0DB9D0] animate-pulse shadow-[0_0_8px_rgba(13,185,208,0.8)]" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#3A6A7A]">Environmental Threat Matrix</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatBlock value="45" unit="min" label="Before 2.5 km water conduit freezes after power loss" accent="text-[#D93030]" delay={0} />
              <StatBlock value="−40" unit="°C" label="Ambient permafrost temperature along the lake pipeline" accent="text-[#0DB9D0]" delay={0.1} />
              <StatBlock value="240" unit="days" label="Winter isolation with zero mainland supply lines" accent="text-[#D49020]" delay={0.2} />
              <StatBlock value="95" unit="kts" label="Peak katabatic gale severing satellite uplink to India" accent="text-[#7B5EC8]" delay={0.3} />
            </div>
          </div>
        </div>

        {/* Source & Evidence Model */}
        <motion.div
          variants={fadeUp}
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="bezel-shell p-1"
        >
          <div className="bezel-core p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-8 border-b border-[#0D3040]/60 pb-6">
              <div>
                <span className="font-mono text-[10px] text-[#3A6A7A] uppercase tracking-widest block mb-2">
                  System Architecture · Provenance Engine
                </span>
                <h3 className="text-2xl font-semibold text-white tracking-tight">
                  Source-Aware Digital Representation
                </h3>
              </div>
              <p className="text-[14px] text-[#7ABBD4] leading-relaxed max-w-sm font-light">
                The platform does not treat all data as absolute truth. Every asset, telemetry stream, and prediction is tagged with a transparent provenance layer to ensure operational trust.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Official */}
              <div className="group relative flex flex-col p-6 rounded-xl bg-[#03060E]/50 backdrop-blur-md border border-white/[0.05] hover:border-[#00D4A0]/40 transition-colors duration-500 overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <div className="absolute inset-0 bg-gradient-to-b from-[#00D4A0]/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00D4A0]/60 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-[#00D4A0] shadow-[0_0_12px_#00D4A0]" />
                    <span className="font-mono text-[11px] font-bold tracking-widest text-white group-hover:text-[#00D4A0] transition-colors">OFFICIAL</span>
                  </div>
                  <p className="text-[12px] text-[#7ABBD4] leading-relaxed">
                    Verified NCPOR / MoES datasets, operational manuals, and Antarctic Treaty inspection reports.
                  </p>
                </div>
              </div>
              {/* Simulated */}
              <div className="group relative flex flex-col p-6 rounded-xl bg-[#03060E]/50 backdrop-blur-md border border-white/[0.05] hover:border-[#7B5EC8]/40 transition-colors duration-500 overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <div className="absolute inset-0 bg-gradient-to-b from-[#7B5EC8]/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#7B5EC8]/60 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 delay-100" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-[#7B5EC8] shadow-[0_0_12px_#7B5EC8]" />
                    <span className="font-mono text-[11px] font-bold tracking-widest text-white group-hover:text-[#7B5EC8] transition-colors">SIMULATED</span>
                  </div>
                  <p className="text-[12px] text-[#7ABBD4] leading-relaxed">
                    Synthetic data generation (e.g. 24h generated telemetry) based on verified historical ranges.
                  </p>
                </div>
              </div>
              {/* Live Sensor */}
              <div className="group relative flex flex-col p-6 rounded-xl bg-[#03060E]/50 backdrop-blur-md border border-white/[0.05] hover:border-[#0DB9D0]/40 transition-colors duration-500 overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <div className="absolute inset-0 bg-gradient-to-b from-[#0DB9D0]/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0DB9D0]/60 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 delay-200" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-[#0DB9D0] animate-pulse shadow-[0_0_12px_#0DB9D0]" />
                    <span className="font-mono text-[11px] font-bold tracking-widest text-white group-hover:text-[#0DB9D0] transition-colors">LIVE_SENSOR</span>
                  </div>
                  <p className="text-[12px] text-[#7ABBD4] leading-relaxed">
                    Real-time telemetry streamed directly from the station edge gateway via satellite uplink.
                  </p>
                </div>
              </div>
              {/* Inference */}
              <div className="group relative flex flex-col p-6 rounded-xl bg-[#03060E]/50 backdrop-blur-md border border-white/[0.05] hover:border-[#D49020]/40 transition-colors duration-500 overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <div className="absolute inset-0 bg-gradient-to-b from-[#D49020]/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D49020]/60 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 delay-300" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-[#D49020] shadow-[0_0_12px_#D49020]" />
                    <span className="font-mono text-[11px] font-bold tracking-widest text-white group-hover:text-[#D49020] transition-colors">INFERENCE</span>
                  </div>
                  <p className="text-[12px] text-[#7ABBD4] leading-relaxed">
                    Cross-domain predictions derived from the rules engine (e.g., fuel autonomy calculation).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ACT III — THE INTELLIGENCE                                    */}
      {/* Digital Twin: how it sees, predicts, acts.                   */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-32 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto border-t border-[#0D3040]/60">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="polar-snow opacity-40" aria-hidden="true" />
        </div>
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(13,185,208,0.08) 0%, transparent 60%)' }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

          {/* Left sticky copy */}
          <motion.div
            variants={fadeUp}
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="lg:col-span-5 lg:sticky lg:top-28"
          >
            <SectionLabel>Act III — The Intelligence</SectionLabel>
            <div className="relative mb-8">
              <h2 className="text-[clamp(1.8rem,4vw,3.2rem)] font-semibold tracking-[-0.03em] leading-[1.12] text-white">
                A cyber-physical twin<br />
                that never sleeps.
              </h2>
              <div className="absolute -left-6 top-2 bottom-2 w-[2px] bg-gradient-to-b from-transparent via-[#0DB9D0]/50 to-transparent hidden sm:block" />
            </div>

            <div className="space-y-6">
              <div className="bg-[#03060E]/60 border border-[#0DB9D0]/15 p-6 rounded-xl max-w-lg shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0DB9D0] animate-pulse shadow-[0_0_8px_#0DB9D0]" />
                  <span className="font-mono text-[10px] text-[#0DB9D0] uppercase tracking-widest">System Architecture</span>
                </div>
                <p className="text-[14px] sm:text-[15px] text-[#7ABBD4] leading-relaxed font-light">
                  A real-time intelligence engine that mirrors every physical subsystem. It continuously analyzes high-frequency telemetry to 
                  <strong className="text-white font-medium"> catch and preempt cascading failures before they happen.</strong>
                </p>
              </div>

              <div className="bg-[#03060E]/60 border border-[#00D4A0]/15 p-6 rounded-xl max-w-lg shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Cpu size={14} className="text-[#00D4A0]" weight="duotone" />
                  <span className="font-mono text-[10px] text-[#00D4A0] uppercase tracking-widest">Deployment Topology</span>
                </div>
                <p className="text-[14px] sm:text-[15px] text-[#7ABBD4] leading-relaxed font-light">
                  Built for extreme isolation. The twin runs autonomously on local edge-compute nodes to survive communication blackouts, 
                  <strong className="text-[#00D4A0] font-medium"> seamlessly synchronizing with the mainland whenever satellite uplinks are restored.</strong>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right: 3-step cards */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {[
              {
                step: "01", verb: "OBSERVE",
                title: "Live Telemetry Fusion",
                body: "Aggregates thousands of raw sensor streams—from alternator voltages to trace-heat thermal signatures—into a single, unified view of the station at 1 Hz resolution.",
                accent: "text-[#0DB9D0]", border: "border-[#0DB9D0]/20", iconBg: "bg-[#0DB9D0]/[0.06]",
                icon: Database, delay: 0,
              },
              {
                step: "02", verb: "PREDICT",
                title: "Predictive Horizon Modeling",
                body: "Moves beyond static dashboards to compute exact depletion curves. It predicts exactly when fuel reserves, battery buffers, or pipeline temperatures will breach critical thresholds.",
                accent: "text-[#00D4A0]", border: "border-[#00D4A0]/20", iconBg: "bg-[#00D4A0]/[0.06]",
                icon: Globe, delay: 0.1,
              },
              {
                step: "03", verb: "SIMULATE",
                title: "Crisis Sandbox",
                body: "Rehearse catastrophes in software before they happen on the ice. The engine simulates 95-knot blizzards and multi-generator failures to generate optimal response strategies.",
                accent: "text-[#7B5EC8]", border: "border-[#7B5EC8]/20", iconBg: "bg-[#7B5EC8]/[0.06]",
                icon: Flask, delay: 0.2,
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.step}
                  variants={fadeUp}
                  custom={card.delay}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  className="group relative"
                >
                  {/* Intense ambient glow behind HUD on hover */}
                  <div className={`absolute inset-0 rounded-2xl blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-700 bg-current ${card.accent}`} />
                  
                  <div className={`relative overflow-hidden p-7 sm:p-8 rounded-2xl border ${card.border} bg-[#03060E]/60 backdrop-blur-xl flex flex-col sm:flex-row gap-6 hover:bg-[#05101C] transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:shadow-[0_15px_50px_rgba(0,0,0,0.6)]`}>
                    
                    {/* Background Data Line Animation (ambient HUD scanning) */}
                    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <div className="absolute top-0 bottom-0 w-[200%] bg-gradient-to-r from-transparent via-current to-transparent opacity-[0.03] animate-[pulse_3s_linear_infinite]" style={{ color: 'inherit' }} />
                      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-[0.3] transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 delay-150" style={{ color: 'inherit' }} />
                    </div>

                    <div
                      className={`relative z-10 shrink-0 w-14 h-14 rounded-xl border ${card.border} ${card.iconBg} flex items-center justify-center ${card.accent} shadow-[inset_0_2px_8px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-500 group-hover:shadow-[0_0_20px_currentColor]`}
                    >
                      <Icon size={28} weight="duotone" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`font-mono text-[11px] font-bold ${card.accent}`}>
                          {card.step}
                        </span>
                        <span className="w-4 h-[1px] bg-[#1A3040]" />
                        <span className={`font-mono text-[11px] uppercase tracking-[0.2em] ${card.accent} opacity-80`}>
                          {card.verb}
                        </span>
                      </div>
                      <h4 className="text-[18px] sm:text-[19px] font-semibold text-white mb-3 tracking-tight group-hover:text-white transition-colors">
                        {card.title}
                      </h4>
                      <p className="text-[14px] text-[#4A7A8E] leading-relaxed font-light group-hover:text-[#7ABBD4] transition-colors">
                        {card.body}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ACT IV — THE DOMAINS                                          */}
      {/* Four subsystem portals. Asymmetric bento — not repeating.    */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-32 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto border-t border-[#0D3040]/60">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="polar-snow opacity-40" aria-hidden="true" />
        </div>
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(0,212,160,0.05) 0%, transparent 50%)' }} />
        </div>

        <motion.div
          variants={fadeUp}
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-16"
        >
          <SectionLabel>Act IV — The Domains</SectionLabel>
          <h2 className="text-[clamp(1.8rem,4vw,3.2rem)] font-semibold tracking-[-0.03em] text-white leading-[1.1] mb-4">
            Four domains. One unified twin.
          </h2>
          <p className="text-[15px] text-[#4A7A8E] max-w-xl">
            Each subsystem is modeled independently, but the twin tracks
            cross-domain dependencies — a microgrid fault triggers water freeze
            risk, which cascades to habitat survivability.
          </p>
        </motion.div>

        {/* Asymmetric Bento */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">

          {/* Energy — large left card (7 cols) */}
          <motion.div
            variants={fadeUp}
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="md:col-span-7 bezel-shell p-1"
          >
            <Link href="/energy" className="group relative block bezel-core p-7 sm:p-9 h-full flex flex-col justify-between min-h-[260px] overflow-hidden bg-[#03060E]/80 backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D49020]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              {/* Energy pulsing grid background */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-40 transition-opacity duration-700 flex items-center justify-center overflow-hidden">
                <div className="w-[200%] h-[200%] bg-[linear-gradient(rgba(212,144,32,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(212,144,32,0.1)_1px,transparent_1px)] bg-[size:40px_40px] animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite]" style={{ transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)' }} />
              </div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#D49020]/20 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-8">
                  <div className="w-12 h-12 rounded-xl border border-[#D49020]/25 bg-[#D49020]/[0.07] flex items-center justify-center text-[#D49020] shadow-[0_0_15px_rgba(212,144,32,0.15)] group-hover:scale-110 transition-transform duration-500">
                    <Lightning size={24} weight="duotone" />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#D49020] opacity-80 mb-1">
                      SYS-01
                    </span>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00D4A0] animate-pulse shadow-[0_0_5px_#00D4A0]" />
                      <span className="font-mono text-[9px] uppercase tracking-widest text-[#00D4A0]">Live Feed</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-[1.5rem] sm:text-[1.85rem] font-semibold text-white mb-3 tracking-tight leading-tight group-hover:text-[#F3D599] transition-colors">
                  Microgrid &amp; Power Distribution
                </h3>
                <p className="text-[14px] text-[#3A6A7A] leading-relaxed max-w-lg group-hover:text-[#4A7A8E] transition-colors">
                  Three 62.5 kVA Kirloskar HA694 alternators, 4-tier PLC load
                  shedding, BESS battery backup, and real-time electrical
                  harmonic tracking.
                </p>
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-[#0D3040]/50">
                <span className="font-mono text-[11px] text-[#D49020] opacity-70">
                  3× Gen · BESS · 4-Tier PLC
                </span>
                <div className="w-9 h-9 rounded-full border border-[#0DB9D0]/20 bg-[#0DB9D0]/[0.04] group-hover:bg-[#0DB9D0] group-hover:border-[#0DB9D0] flex items-center justify-center transition-all duration-300">
                  <ArrowRight
                    size={14}
                    className="text-[#3A6A7A] group-hover:text-[#03060E] transition-colors"
                  />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Right stack: Infrastructure + Simulation (5 cols) */}
          <div className="md:col-span-5 flex flex-col gap-4">

            <motion.div
              variants={fadeUp}
              custom={0.1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="bezel-shell p-1 flex-1"
            >
              <Link href="/infrastructure" className="group relative block bezel-core p-6 sm:p-7 h-full flex flex-col justify-between min-h-[120px] overflow-hidden bg-[#03060E]/80 backdrop-blur-md">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0DB9D0]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                {/* Water flow lines */}
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-30 transition-opacity duration-700 overflow-hidden">
                  <div className="absolute top-0 bottom-0 w-[200%] bg-[repeating-linear-gradient(90deg,transparent,transparent_20px,rgba(13,185,208,0.1)_20px,rgba(13,185,208,0.1)_40px)] animate-[pulse_3s_linear_infinite]" style={{ transform: 'skewX(-20deg)' }} />
                </div>
                <div className="absolute top-0 left-0 w-40 h-40 bg-[#0DB9D0]/20 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <div className="w-10 h-10 rounded-xl border border-[#0DB9D0]/25 bg-[#0DB9D0]/[0.06] flex items-center justify-center text-[#0DB9D0] mb-4 shadow-[0_0_10px_rgba(13,185,208,0.1)] group-hover:scale-110 transition-transform duration-500">
                      <Waves size={20} weight="duotone" />
                    </div>
                    <h3 className="text-[1.1rem] font-semibold text-[#EBF5FC] mb-1.5 tracking-tight group-hover:text-white transition-colors">
                      Water &amp; Habitat Life Support
                    </h3>
                    <p className="text-[13px] text-[#3A6A7A] group-hover:text-[#4A9AAE] transition-colors">
                      2.5 km trace-heated conduit · Lake Priyadarshini · 4-zone climate
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-[#0DB9D0] opacity-80 mb-2">SYS-02</span>
                    <div className="shrink-0 w-8 h-8 rounded-full border border-[#0DB9D0]/20 bg-[#0DB9D0]/[0.04] group-hover:bg-[#0DB9D0] flex items-center justify-center transition-all duration-300">
                      <ArrowRight
                        size={12}
                        className="text-[#3A6A7A] group-hover:text-[#03060E]"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              custom={0.2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="bezel-shell p-1 flex-1"
            >
              <Link href="/logistics" className="group relative block bezel-core p-6 sm:p-7 h-full flex flex-col justify-between min-h-[120px] overflow-hidden bg-[#03060E]/80 backdrop-blur-md">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00D4A0]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                {/* Logistics supply chain ticks */}
                <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity duration-700">
                  <div className="w-full h-[200%] bg-[repeating-linear-gradient(0deg,transparent,transparent_4px,rgba(0,212,160,0.4)_4px,rgba(0,212,160,0.4)_6px)] mask-image-[linear-gradient(to_left,black,transparent)]" style={{ WebkitMaskImage: 'linear-gradient(to left, black, transparent)' }} />
                </div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#00D4A0]/20 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <div className="w-10 h-10 rounded-xl border border-[#00D4A0]/25 bg-[#00D4A0]/[0.06] flex items-center justify-center text-[#00D4A0] mb-4 shadow-[0_0_10px_rgba(0,212,160,0.1)] group-hover:scale-110 transition-transform duration-500">
                      <GasPump size={20} weight="duotone" />
                    </div>
                    <h3 className="text-[1.1rem] font-semibold text-[#EBF5FC] mb-1.5 tracking-tight group-hover:text-white transition-colors">
                      Logistics &amp; Fuel Reserves
                    </h3>
                    <p className="text-[13px] text-[#3A6A7A] group-hover:text-[#52C7A8] transition-colors">
                      ATF burn rates · Winter stock depletion · Emission tracking
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-[#00D4A0] opacity-80 mb-2">SYS-03</span>
                    <div className="shrink-0 w-8 h-8 rounded-full border border-[#00D4A0]/20 bg-[#00D4A0]/[0.04] group-hover:bg-[#00D4A0] flex items-center justify-center transition-all duration-300">
                      <ArrowRight
                        size={12}
                        className="text-[#3A6A7A] group-hover:text-[#03060E]"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

          </div>

          {/* Communications — full width bottom */}
          <motion.div
            variants={fadeUp}
            custom={0.3}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="md:col-span-12 bezel-shell p-1"
          >
            <Link href="/communications" className="group relative block bezel-core p-6 sm:p-8 overflow-hidden bg-[#03060E]/80 backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-r from-[#7B5EC8]/10 via-transparent to-[#0DB9D0]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              {/* Radar Ping / Comm wave */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-30 transition-opacity duration-700">
                <div className="absolute w-[600px] h-[600px] rounded-full border border-[#7B5EC8]/30 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
                <div className="absolute w-[300px] h-[300px] rounded-full border border-[#0DB9D0]/30 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite_1s]" />
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-xl border border-[#7B5EC8]/25 bg-[#7B5EC8]/[0.06] flex items-center justify-center text-[#7B5EC8] shrink-0 shadow-[0_0_15px_rgba(123,94,200,0.1)] group-hover:scale-110 transition-transform duration-500">
                    <Broadcast size={26} weight="duotone" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-[10px] text-[#7B5EC8] uppercase tracking-widest">
                        SYS-04 · COMMUNICATIONS
                      </span>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ml-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00D4A0] animate-pulse shadow-[0_0_5px_#00D4A0]" />
                        <span className="font-mono text-[9px] uppercase tracking-widest text-[#0DB9D0]">Uplink Nominal</span>
                      </div>
                    </div>
                    <h3 className="text-[1.3rem] font-semibold text-[#EBF5FC] tracking-tight group-hover:text-white transition-colors">
                      Network &amp; Edge Compute Integrity
                    </h3>
                    <p className="text-[14px] text-[#3A6A7A] mt-1.5 max-w-2xl group-hover:text-[#9A7DF0] transition-colors">
                      Satellite uplink telemetry, latency tracking to mainland India, and local edge-compute failover statuses during zero-visibility katabatic storms.
                    </p>
                  </div>
                </div>
                <div className="shrink-0 inline-flex items-center gap-0 pl-5 pr-2 py-2 rounded-full bg-[#7B5EC8]/[0.08] group-hover:bg-[#7B5EC8] border border-[#7B5EC8]/25 group-hover:border-[#7B5EC8] transition-all duration-300">
                  <span className="mr-4 font-mono text-[11px] text-[#9A7DF0] group-hover:text-[#03060E] uppercase tracking-wider transition-colors">
                    Inspect Node
                  </span>
                  <span className="w-7 h-7 rounded-full bg-[#7B5EC8]/10 group-hover:bg-[#03060E]/10 flex items-center justify-center transition-all">
                    <ArrowRight
                      size={13}
                      weight="bold"
                      className="text-[#9A7DF0] group-hover:text-[#03060E] transition-all group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ACT V — THE GATEWAY                                           */}
      {/* Quiet, confident CTA. Story ends; mission begins.            */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 pb-32 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto border-t border-[#0D3040]/60 pt-32">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 50% 100%, rgba(13,185,208,0.06) 0%, transparent 60%)' }} />
        </div>

        <motion.div
          variants={fadeUp}
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="bezel-shell p-1"
        >
          <div className="bezel-core p-10 sm:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="text-center md:text-left max-w-xl">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#1E3A48] block mb-4">
                NCPOR Mission Command · 44th Indian Scientific Expedition to Antarctica
              </span>
              <h3 className="text-[clamp(1.6rem,3.5vw,2.8rem)] font-semibold text-[#EBF5FC] tracking-tight mb-4 leading-[1.1]">
                The twin is live.<br />
                The station awaits.
              </h3>
              <p className="text-[14px] text-[#4A7A8E] leading-relaxed">
                Connect to real-time 1 Hz telemetry from Maitri. Inspect every
                subsystem. Run a blizzard simulation. The cockpit is operational.
              </p>
            </div>

            <div className="flex flex-col gap-3 items-center md:items-end shrink-0">
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-0 pl-6 pr-2 py-2 rounded-full bg-[#0DB9D0] text-[#03060E] font-mono text-xs uppercase tracking-wider font-bold shadow-[0_0_50px_rgba(13,185,208,0.25)] hover:bg-[#0FCEE8] transition-all duration-300 active:scale-[0.97]"
              >
                <span className="mr-5">Launch Cockpit</span>
                <span className="w-8 h-8 rounded-full bg-[#03060E]/15 group-hover:bg-[#03060E]/25 flex items-center justify-center transition-all">
                  <ArrowUpRight
                    size={14}
                    weight="bold"
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </span>
              </Link>
              <Link
                href="/simulations"
                className="font-mono text-[11px] text-[#1E3A48] hover:text-[#0DB9D0] transition-colors uppercase tracking-wider"
              >
                or run a simulation →
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Colophon */}
        <motion.div
          variants={fadeIn}
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-16 pt-8 border-t border-[#0D3040]/40 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-[#1A3040]"
        >
          <span>GOVERNMENT OF INDIA · MINISTRY OF EARTH SCIENCES · NCPOR</span>
          <span>70°45′57″S · 11°44′09″E · ANTARCTIC TREATY PRESERVE</span>
          <span className="hidden sm:inline">BHARATI · 69°24′S · COMMISSIONED 2012</span>
        </motion.div>
      </section>

    </div>
  );
}
