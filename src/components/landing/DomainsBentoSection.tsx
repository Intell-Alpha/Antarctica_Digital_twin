"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lightning, Waves, GasPump, Broadcast, ArrowRight } from "@phosphor-icons/react";
import { fadeUp, SectionLabel } from "./LandingShared";

export function DomainsBentoSection() {
  return (
    <section className="relative z-10 py-32 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto border-t border-[#0D3040]/60">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="polar-snow opacity-40" aria-hidden="true" />
      </div>
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at 100% 0%, rgba(0,212,160,0.05) 0%, transparent 50%)",
          }}
        />
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
          Each subsystem is modeled independently, but the twin tracks cross-domain dependencies — a microgrid fault triggers water freeze risk, which cascades to habitat survivability.
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
          <Link
            href="/dashboard/energy"
            className="group relative block bezel-core p-7 sm:p-9 h-full flex flex-col justify-between min-h-[260px] overflow-hidden bg-[#03060E]/80 backdrop-blur-md"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#D49020]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-40 transition-opacity duration-700 flex items-center justify-center overflow-hidden">
              <div
                className="w-[200%] h-[200%] bg-[linear-gradient(rgba(212,144,32,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(212,144,32,0.1)_1px,transparent_1px)] bg-[size:40px_40px] animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite]"
                style={{
                  transform: "perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)",
                }}
              />
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
                    <span className="font-mono text-[9px] uppercase tracking-widest text-[#00D4A0]">
                      Live Feed
                    </span>
                  </div>
                </div>
              </div>
              <h3 className="text-[1.5rem] sm:text-[1.85rem] font-semibold text-white mb-3 tracking-tight leading-tight group-hover:text-[#F3D599] transition-colors">
                Microgrid &amp; Power Distribution
              </h3>
              <p className="text-[14px] text-[#3A6A7A] leading-relaxed max-w-lg group-hover:text-[#4A7A8E] transition-colors">
                Three 62.5 kVA Kirloskar HA694 alternators, 4-tier PLC load shedding, BESS battery backup, and real-time electrical harmonic tracking.
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
            <Link
              href="/dashboard/infrastructure"
              className="group relative block bezel-core p-6 sm:p-7 h-full flex flex-col justify-between min-h-[120px] overflow-hidden bg-[#03060E]/80 backdrop-blur-md"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#0DB9D0]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-30 transition-opacity duration-700 overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 w-[200%] bg-[repeating-linear-gradient(90deg,transparent,transparent_20px,rgba(13,185,208,0.1)_20px,rgba(13,185,208,0.1)_40px)] animate-[pulse_3s_linear_infinite]"
                  style={{ transform: "skewX(-20deg)" }}
                />
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
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#0DB9D0] opacity-80 mb-2">
                    SYS-02
                  </span>
                  <div className="shrink-0 w-8 h-8 rounded-full border border-[#0DB9D0]/20 bg-[#0DB9D0]/[0.04] group-hover:bg-[#0DB9D0] flex items-center justify-center transition-all duration-300">
                    <ArrowRight size={12} className="text-[#3A6A7A] group-hover:text-[#03060E]" />
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
            <Link
              href="/dashboard/logistics"
              className="group relative block bezel-core p-6 sm:p-7 h-full flex flex-col justify-between min-h-[120px] overflow-hidden bg-[#03060E]/80 backdrop-blur-md"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#00D4A0]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity duration-700">
                <div
                  className="w-full h-[200%] bg-[repeating-linear-gradient(0deg,transparent,transparent_4px,rgba(0,212,160,0.4)_4px,rgba(0,212,160,0.4)_6px)]"
                  style={{ WebkitMaskImage: "linear-gradient(to left, black, transparent)" }}
                />
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
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#00D4A0] opacity-80 mb-2">
                    SYS-03
                  </span>
                  <div className="shrink-0 w-8 h-8 rounded-full border border-[#00D4A0]/20 bg-[#00D4A0]/[0.04] group-hover:bg-[#00D4A0] flex items-center justify-center transition-all duration-300">
                    <ArrowRight size={12} className="text-[#3A6A7A] group-hover:text-[#03060E]" />
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
          <Link
            href="/dashboard/communications"
            className="group relative block bezel-core p-6 sm:p-8 overflow-hidden bg-[#03060E]/80 backdrop-blur-md"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#7B5EC8]/10 via-transparent to-[#0DB9D0]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
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
                      <span className="font-mono text-[9px] uppercase tracking-widest text-[#0DB9D0]">
                        Uplink Nominal
                      </span>
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
  );
}
