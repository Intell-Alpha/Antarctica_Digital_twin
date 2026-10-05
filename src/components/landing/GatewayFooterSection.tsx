"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "@phosphor-icons/react";
import { fadeUp, fadeIn } from "./LandingShared";

export function GatewayFooterSection() {
  return (
    <section className="relative z-10 pb-32 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto border-t border-[#0D3040]/60 pt-32">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 100%, rgba(13,185,208,0.06) 0%, transparent 60%)",
          }}
        />
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
              Connect to real-time 1 Hz telemetry from Maitri. Inspect every subsystem. Run a blizzard simulation. The cockpit is operational.
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
              href="/dashboard/simulations"
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
  );
}
