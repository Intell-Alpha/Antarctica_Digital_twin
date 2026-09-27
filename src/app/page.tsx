"use client";

import { useState, useRef } from "react";
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
} from "@phosphor-icons/react";
import { TopographicBg } from "@/components/TopographicBg";

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
      className="flex flex-col gap-1.5"
    >
      <div className={`font-mono text-4xl sm:text-5xl font-bold tracking-tight ${accent}`}>
        {value}
        {unit && (
          <span className="text-2xl sm:text-3xl ml-1 opacity-60">{unit}</span>
        )}
      </div>
      <p className="text-[13px] text-[#3A6A7A] font-mono leading-snug max-w-[200px]">
        {label}
      </p>
    </motion.div>
  );
}

export default function LandingPage() {
  const [pipeTripped, setPipeTripped] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

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
              className="group inline-flex items-center gap-0 pl-6 pr-2 py-2 rounded-full bg-[#0DB9D0] text-[#03060E] font-mono text-xs uppercase tracking-wider font-bold shadow-[0_0_40px_rgba(13,185,208,0.30)] hover:bg-[#0FCEE8] transition-all duration-300 active:scale-[0.97]"
            >
              <span className="mr-5">Enter the Cockpit</span>
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
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#0DB9D0]/20 bg-[#0DB9D0]/[0.04] hover:bg-[#0DB9D0]/[0.10] hover:border-[#0DB9D0]/40 text-[#4A9AAE] hover:text-[#0DB9D0] font-mono text-xs uppercase tracking-wider transition-all duration-300"
            >
              <Flask size={13} weight="duotone" />
              Simulate a Crisis
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="absolute bottom-10 left-6 sm:left-10 lg:left-16 flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-[#1E3A48]"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            className="w-px h-8 bg-gradient-to-b from-transparent via-[#0DB9D0]/40 to-transparent"
          />
          Scroll to explore
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ACT II — THE STAKES                                           */}
      {/* The brutal physics of polar survival.                        */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-32 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto border-t border-[#0D3040]/60">

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
            <p className="text-[15px] text-[#4A7A8E] leading-relaxed mb-5 max-w-lg">
              Maitri station at 70°S is not simply remote — it is categorically
              isolated. From March to November, katabatic winds lock the
              continent in total darkness. No aircraft. No ships. No rescue.
            </p>
            <p className="text-[15px] text-[#4A7A8E] leading-relaxed max-w-lg">
              23 crew members must operate every critical system — power, water,
              heat, comms — with zero external support for 240 days. One failure
              cascades into the next.
            </p>
          </motion.div>

          {/* Right: Physics Stats */}
          <div className="grid grid-cols-2 gap-10 pt-4">
            <StatBlock value="45" unit="min" label="Before 2.5 km water conduit freezes after power loss" accent="text-[#D93030]" delay={0} />
            <StatBlock value="−40" unit="°C" label="Ambient permafrost temperature along the lake pipeline" accent="text-[#0DB9D0]" delay={0.1} />
            <StatBlock value="240" unit=" days" label="Winter isolation with zero mainland supply lines" accent="text-[#D49020]" delay={0.2} />
            <StatBlock value="95" unit=" kts" label="Peak katabatic gale severing satellite uplink to India" accent="text-[#7B5EC8]" delay={0.3} />
          </div>
        </div>

        {/* Interactive Freeze Simulator */}
        <motion.div
          variants={fadeUp}
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="bezel-shell p-1"
        >
          <div className="bezel-core p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-[#0D3040]/60">
              <div>
                <span className="font-mono text-[10px] text-[#3A6A7A] uppercase tracking-widest block mb-1">
                  Interactive Simulation · Lake Priyadarshini Conduit
                </span>
                <h3 className="text-xl font-semibold text-white">
                  The 45-Minute Freeze Window
                </h3>
              </div>
              <button
                onClick={() => setPipeTripped((v) => !v)}
                className={`shrink-0 px-4 py-2 rounded-lg font-mono text-[11px] uppercase tracking-wider border transition-all duration-500 ${
                  pipeTripped
                    ? "bg-[#D93030]/15 border-[#D93030]/30 text-[#FF9090]"
                    : "bg-[#0DB9D0]/10 border-[#0DB9D0]/25 text-[#5DD8EC]"
                }`}
              >
                {pipeTripped
                  ? "⚡ Trace Heat: TRIPPED — Click to Restore"
                  : "⚡ Trace Heat: ACTIVE — Click to Trip"}
              </button>
            </div>

            {/* Pipeline visualization */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-[11px] font-mono text-[#1E3A48] px-1">
                <span>Lake Priyadarshini (+4.0°C)</span>
                <span>2.5 km Exposed Permafrost</span>
                <span className={pipeTripped ? "text-[#D93030]" : "text-[#0DB9D0]"}>
                  Station Header {pipeTripped ? "(FREEZING)" : "(+1.4°C)"}
                </span>
              </div>
              <div className="relative h-5 rounded-full bg-[#030812] border border-[#0D3040]/50 overflow-hidden">
                <motion.div
                  animate={{
                    width: pipeTripped ? "28%" : "100%",
                    backgroundColor: pipeTripped ? "#D93030" : "#0DB9D0",
                    boxShadow: pipeTripped
                      ? "inset 0 2px 4px rgba(255,255,255,0.1), 0 0 10px rgba(217,48,48,0.3)"
                      : "inset 0 2px 4px rgba(255,255,255,0.2), 0 0 10px rgba(13,185,208,0.2)",
                  }}
                  transition={{ duration: 1.2, ease: [0.32, 0.72, 0, 1] }}
                  className="h-full rounded-full border border-white/10"
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {pipeTripped ? (
                <motion.div
                  key="tripped"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-[#D93030]/08 border border-[#D93030]/20 text-sm font-mono text-[#FF9090]"
                >
                  <Warning size={18} className="shrink-0 mt-0.5 text-[#D93030]" />
                  <div>
                    <span className="font-bold text-[#D93030]">CRITICAL:</span>{" "}
                    Convective heat loss = 1.84 kW/km. At −40°C + 48 kt gale,
                    ice nucleation seals the intake in{" "}
                    <strong>38 minutes</strong>. Digital Twin recommends
                    immediate generator failover or emergency line drain.
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="nominal"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-[#0DB9D0]/[0.06] border border-[#0DB9D0]/15 text-sm font-mono text-[#5DD8EC]"
                >
                  <CheckCircle size={18} className="shrink-0 mt-0.5 text-[#0DB9D0]" />
                  <div>
                    <span className="font-bold text-[#0DB9D0]">NOMINAL:</span>{" "}
                    Trace-heat circuit drawing 48.6 kW from Kirloskar HA694
                    &apos;Ravi&apos;. Flow maintained at 18.2 L/min. Convective
                    margin: <strong>140 minutes</strong>.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ACT III — THE INTELLIGENCE                                    */}
      {/* Digital Twin: how it sees, predicts, acts.                   */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-32 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto border-t border-[#0D3040]/60">

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
            <h2 className="text-[clamp(1.8rem,4vw,3.2rem)] font-semibold tracking-[-0.03em] leading-[1.12] text-white mb-6">
              A cyber-physical twin<br />
              that never sleeps.
            </h2>
            <p className="text-[15px] text-[#4A7A8E] leading-relaxed mb-5 max-w-lg">
              The Digital Twin is a source-aware, cross-domain intelligence
              engine. It mirrors every physical subsystem in real time — and
              projects forward to catch failures before they happen.
            </p>
            <p className="text-[15px] text-[#4A7A8E] leading-relaxed max-w-lg">
              It runs both on-station (offline, edge-compute) and in India —
              synchronized when uplinks are live, autonomous when blizzards cut
              the link.
            </p>
          </motion.div>

          {/* Right: 3-step cards */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {[
              {
                step: "01", verb: "OBSERVE",
                title: "1 Hz Synchronized Telemetry Fusion",
                body: "Every voltage harmonic, alternator temperature, trace-heat current, weather sensor reading, and conduit flow rate — ingested continuously from Modbus TCP / MQTT instruments at Maitri and Bharati.",
                accent: "text-[#0DB9D0]", border: "border-[#0DB9D0]/20", iconBg: "bg-[#0DB9D0]/[0.06]",
                icon: Database, delay: 0,
              },
              {
                step: "02", verb: "PREDICT",
                title: "Physics-Informed Horizon Modeling",
                body: "Not dashboards — depletion curves. The twin computes: days of fuel remaining at today's burn rate, conduit temperature in 2 hours, when BESS buffer charge will hit critical threshold.",
                accent: "text-[#00D4A0]", border: "border-[#00D4A0]/20", iconBg: "bg-[#00D4A0]/[0.06]",
                icon: Globe, delay: 0.1,
              },
              {
                step: "03", verb: "SIMULATE",
                title: "Counterfactual Crisis Sandbox",
                body: "Rehearse catastrophes in software before they happen in ice. Monte Carlo runs of 95-knot blizzards, alternator trips, and 4-tier PLC load-shedding runbooks — so operators know exactly what to do.",
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
                  className={`p-[1px] rounded-[1.5rem] border ${card.border}`}
                  style={{ background: "rgba(13,185,208,0.02)" }}
                >
                  <div className="rounded-[calc(1.5rem-1px)] bg-[#040D18] p-6 sm:p-7 flex flex-col sm:flex-row gap-5">
                    <div
                      className={`shrink-0 w-10 h-10 rounded-xl border ${card.border} ${card.iconBg} flex items-center justify-center ${card.accent}`}
                    >
                      <Icon size={20} weight="duotone" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 mb-2">
                        <span className={`font-mono text-[10px] font-bold ${card.accent}`}>
                          {card.step}
                        </span>
                        <span className="text-[#1A3040] font-mono text-[10px]">·</span>
                        <span className={`font-mono text-[10px] uppercase tracking-widest ${card.accent} opacity-70`}>
                          {card.verb}
                        </span>
                      </div>
                      <h4 className="text-[16px] font-semibold text-white mb-2 tracking-tight">
                        {card.title}
                      </h4>
                      <p className="text-[13px] text-[#3A6A7A] leading-relaxed">
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
            <Link href="/energy" className="group block bezel-core p-7 sm:p-9 h-full flex flex-col justify-between min-h-[260px]">
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl border border-[#D49020]/25 bg-[#D49020]/[0.07] flex items-center justify-center text-[#D49020]">
                    <Lightning size={24} weight="duotone" />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#1E3A48]">
                    SYS-01
                  </span>
                </div>
                <h3 className="text-[1.5rem] sm:text-[1.85rem] font-semibold text-white mb-3 tracking-tight leading-tight">
                  Microgrid &amp; Power Distribution
                </h3>
                <p className="text-[14px] text-[#3A6A7A] leading-relaxed max-w-lg">
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
              <Link href="/infrastructure" className="group block bezel-core p-6 sm:p-7 h-full flex flex-col justify-between min-h-[120px]">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="w-9 h-9 rounded-xl border border-[#0DB9D0]/25 bg-[#0DB9D0]/[0.06] flex items-center justify-center text-[#0DB9D0] mb-3">
                      <Waves size={18} weight="duotone" />
                    </div>
                    <h3 className="text-[1.1rem] font-semibold text-[#EBF5FC] mb-1 tracking-tight">
                      Water &amp; Habitat Life Support
                    </h3>
                    <p className="text-[13px] text-[#3A6A7A]">
                      2.5 km trace-heated conduit · Lake Priyadarshini · 4-zone climate
                    </p>
                  </div>
                  <div className="shrink-0 w-8 h-8 rounded-full border border-[#0DB9D0]/20 bg-[#0DB9D0]/[0.04] group-hover:bg-[#0DB9D0] flex items-center justify-center transition-all duration-300">
                    <ArrowRight
                      size={12}
                      className="text-[#3A6A7A] group-hover:text-[#03060E]"
                    />
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
              <Link href="/simulations" className="group block bezel-core p-6 sm:p-7 h-full flex flex-col justify-between min-h-[120px]">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="w-9 h-9 rounded-xl border border-[#7B5EC8]/25 bg-[#7B5EC8]/[0.06] flex items-center justify-center text-[#7B5EC8] mb-3">
                      <SlidersHorizontal size={18} weight="duotone" />
                    </div>
                    <h3 className="text-[1.1rem] font-semibold text-[#EBF5FC] mb-1 tracking-tight">
                      Physics Simulator &amp; What-If Engine
                    </h3>
                    <p className="text-[13px] text-[#3A6A7A]">
                      Monte Carlo crisis sandbox · Blizzard + power trip scenarios
                    </p>
                  </div>
                  <div className="shrink-0 w-8 h-8 rounded-full border border-[#7B5EC8]/20 bg-[#7B5EC8]/[0.04] group-hover:bg-[#7B5EC8] flex items-center justify-center transition-all duration-300">
                    <ArrowRight
                      size={12}
                      className="text-[#3A6A7A] group-hover:text-[#EBF5FC]"
                    />
                  </div>
                </div>
              </Link>
            </motion.div>

          </div>

          {/* Dashboard — full width bottom */}
          <motion.div
            variants={fadeUp}
            custom={0.3}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="md:col-span-12 bezel-shell p-1"
          >
            <Link href="/dashboard" className="group block bezel-core p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl border border-[#00D4A0]/25 bg-[#00D4A0]/[0.06] flex items-center justify-center text-[#00D4A0] shrink-0">
                    <Cpu size={24} weight="duotone" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-[#1E3A48] uppercase tracking-widest block mb-1">
                      SYS-00 · CENTRAL COMMAND
                    </span>
                    <h3 className="text-[1.2rem] font-semibold text-[#EBF5FC] tracking-tight">
                      Twin Cockpit — Unified Mission HUD
                    </h3>
                    <p className="text-[13px] text-[#3A6A7A] mt-1 max-w-2xl">
                      All domains fused in one live view: microgrid, water,
                      habitat, logistics, environment, network. SCADA forensic
                      logs. 1 Hz synchronized stream.
                    </p>
                  </div>
                </div>
                <div className="shrink-0 inline-flex items-center gap-0 pl-5 pr-2 py-2 rounded-full bg-[#0DB9D0]/[0.08] group-hover:bg-[#0DB9D0] border border-[#0DB9D0]/25 group-hover:border-[#0DB9D0] transition-all duration-300">
                  <span className="mr-4 font-mono text-[11px] text-[#4A9AAE] group-hover:text-[#03060E] uppercase tracking-wider transition-colors">
                    Open Cockpit
                  </span>
                  <span className="w-7 h-7 rounded-full bg-[#0DB9D0]/10 group-hover:bg-[#03060E]/10 flex items-center justify-center transition-all">
                    <ArrowUpRight
                      size={13}
                      weight="bold"
                      className="text-[#4A9AAE] group-hover:text-[#03060E] transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
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
