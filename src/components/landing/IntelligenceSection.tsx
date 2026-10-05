"use client";

import React from "react";
import { motion } from "framer-motion";
import { Cpu, Database, Globe, Flask } from "@phosphor-icons/react";
import { fadeUp, SectionLabel } from "./LandingShared";

export function IntelligenceSection() {
  const steps = [
    {
      step: "01",
      verb: "OBSERVE",
      title: "Live Telemetry Fusion",
      body: "Aggregates thousands of raw sensor streams—from alternator voltages to trace-heat thermal signatures—into a single, unified view of the station at 1 Hz resolution.",
      accent: "text-[#0DB9D0]",
      border: "border-[#0DB9D0]/20",
      iconBg: "bg-[#0DB9D0]/[0.06]",
      icon: Database,
      delay: 0,
    },
    {
      step: "02",
      verb: "PREDICT",
      title: "Predictive Horizon Modeling",
      body: "Moves beyond static dashboards to compute exact depletion curves. It predicts exactly when fuel reserves, battery buffers, or pipeline temperatures will breach critical thresholds.",
      accent: "text-[#00D4A0]",
      border: "border-[#00D4A0]/20",
      iconBg: "bg-[#00D4A0]/[0.06]",
      icon: Globe,
      delay: 0.1,
    },
    {
      step: "03",
      verb: "SIMULATE",
      title: "Crisis Sandbox",
      body: "Rehearse catastrophes in software before they happen on the ice. The engine simulates 95-knot blizzards and multi-generator failures to generate optimal response strategies.",
      accent: "text-[#7B5EC8]",
      border: "border-[#7B5EC8]/20",
      iconBg: "bg-[#7B5EC8]/[0.06]",
      icon: Flask,
      delay: 0.2,
    },
  ];

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
              "radial-gradient(circle at 50% 50%, rgba(13,185,208,0.08) 0%, transparent 60%)",
          }}
        />
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
                <span className="font-mono text-[10px] text-[#0DB9D0] uppercase tracking-widest">
                  System Architecture
                </span>
              </div>
              <p className="text-[14px] sm:text-[15px] text-[#7ABBD4] leading-relaxed font-light">
                A real-time intelligence engine that mirrors every physical subsystem. It continuously analyzes high-frequency telemetry to{" "}
                <strong className="text-white font-medium">
                  catch and preempt cascading failures before they happen.
                </strong>
              </p>
            </div>

            <div className="bg-[#03060E]/60 border border-[#00D4A0]/15 p-6 rounded-xl max-w-lg shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <Cpu size={14} className="text-[#00D4A0]" weight="duotone" />
                <span className="font-mono text-[10px] text-[#00D4A0] uppercase tracking-widest">
                  Deployment Topology
                </span>
              </div>
              <p className="text-[14px] sm:text-[15px] text-[#7ABBD4] leading-relaxed font-light">
                Built for extreme isolation. The twin runs autonomously on local edge-compute nodes to survive communication blackouts,{" "}
                <strong className="text-[#00D4A0] font-medium">
                  seamlessly synchronizing with the mainland whenever satellite uplinks are restored.
                </strong>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right: 3-step cards */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {steps.map((card) => {
            const IconComponent = card.icon;
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
                <div
                  className={`absolute inset-0 rounded-2xl blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-700 bg-current ${card.accent}`}
                />

                <div
                  className={`relative overflow-hidden p-7 sm:p-8 rounded-2xl border ${card.border} bg-[#03060E]/60 backdrop-blur-xl flex flex-col sm:flex-row gap-6 hover:bg-[#05101C] transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:shadow-[0_15px_50px_rgba(0,0,0,0.6)]`}
                >
                  {/* Background Data Line Animation (ambient HUD scanning) */}
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div
                      className="absolute top-0 bottom-0 w-[200%] bg-gradient-to-r from-transparent via-current to-transparent opacity-[0.03] animate-[pulse_3s_linear_infinite]"
                      style={{ color: "inherit" }}
                    />
                    <div
                      className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-[0.3] transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 delay-150"
                      style={{ color: "inherit" }}
                    />
                  </div>

                  <div
                    className={`relative z-10 shrink-0 w-14 h-14 rounded-xl border ${card.border} ${card.iconBg} flex items-center justify-center ${card.accent} shadow-[inset_0_2px_8px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-500 group-hover:shadow-[0_0_20px_currentColor]`}
                  >
                    <IconComponent size={28} weight="duotone" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`font-mono text-[11px] font-bold ${card.accent}`}>
                        {card.step}
                      </span>
                      <span className="w-4 h-[1px] bg-[#1A3040]" />
                      <span
                        className={`font-mono text-[11px] uppercase tracking-[0.2em] ${card.accent} opacity-80`}
                      >
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
  );
}
