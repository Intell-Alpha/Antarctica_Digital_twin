"use client";

import React from "react";
import { motion } from "framer-motion";
import { fadeUp, SectionLabel, StatBlock } from "./LandingShared";

export function StakesSection() {
  return (
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
  );
}
