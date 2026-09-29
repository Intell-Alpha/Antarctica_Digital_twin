"use client";

import { motion, Variants } from "framer-motion";
import { Broadcast, Waves, Cpu } from "@phosphor-icons/react";

const fadeLeft: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, delay: 1.5 + i * 0.15, ease: [0.32, 0.72, 0, 1] as const },
  }),
};

export function HeroHUDModules() {
  return (
    <div className="flex flex-col gap-4 w-full max-w-[320px] pointer-events-none select-none">
      
      {/* Module 1: SATCOM */}
      <motion.div
        variants={fadeLeft}
        custom={0}
        initial="hidden"
        animate="visible"
        className="relative group p-5 rounded-2xl bg-[#03060E]/20 backdrop-blur-2xl border border-[#0DB9D0]/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#0DB9D0]/10 blur-[40px]" />
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[#0DB9D0] font-mono text-[10px] uppercase tracking-widest">
            <Broadcast size={14} weight="bold" className="animate-pulse" />
            Satcom Uplink
          </div>
          <span className="text-[10px] text-[#0DB9D0] font-mono border border-[#0DB9D0]/30 bg-[#0DB9D0]/10 px-2 py-0.5 rounded-full">SECURE</span>
        </div>
        <div className="space-y-2 font-mono text-[11px] text-[#7ABBD4]">
          <div className="flex justify-between items-center">
            <span>SATELLITE</span>
            <span className="text-[#EBF5FC]">ISRO GSAT-04</span>
          </div>
          <div className="flex justify-between items-center">
            <span>BANDWIDTH</span>
            <span className="text-[#EBF5FC]">45.2 MBPS</span>
          </div>
          <div className="flex justify-between items-center">
            <span>NEXT PASS</span>
            <span className="text-[#EBF5FC]">T-14:02:00</span>
          </div>
        </div>
      </motion.div>

      {/* Module 2: AURORAL ACTIVITY */}
      <motion.div
        variants={fadeLeft}
        custom={1}
        initial="hidden"
        animate="visible"
        className="relative p-5 rounded-2xl bg-[#03060E]/20 backdrop-blur-2xl border border-[#0DB9D0]/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden -ml-6"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#0DB9D0]/10 blur-[40px]" />
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-[#EBF5FC] font-mono text-[10px] uppercase tracking-widest font-bold">
            <Waves size={14} weight="bold" />
            Auroral Electrojet
          </div>
        </div>
        <div className="text-[11px] font-mono text-[#7ABBD4] leading-relaxed mb-3">
          <span className="text-[#0DB9D0] font-bold">MONITORING:</span> High altitude geomagnetic interference detected. Local telemetry unaffected.
        </div>
        <div className="flex items-center gap-2 text-[#0DB9D0] font-mono text-[9px] tracking-widest">
          <span className="w-1.5 h-1.5 bg-[#0DB9D0] rounded-full animate-pulse shadow-[0_0_8px_#0DB9D0]" />
          ACTIVE SCAN ALIGNMENT
        </div>
      </motion.div>

      {/* Module 3: MICROGRID CORE */}
      <motion.div
        variants={fadeLeft}
        custom={2}
        initial="hidden"
        animate="visible"
        className="relative p-5 rounded-2xl bg-[#03060E]/20 backdrop-blur-2xl border border-[#0DB9D0]/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden"
      >
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#0DB9D0]/10 blur-[40px]" />
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[#EBF5FC] font-mono text-[10px] uppercase tracking-widest">
            <Cpu size={14} weight="bold" />
            Microgrid Core
          </div>
          <span className="text-[10px] text-[#0DB9D0] font-mono border border-[#0DB9D0]/30 px-2 py-0.5 rounded-full bg-[#0DB9D0]/10">NOMINAL</span>
        </div>
        <div className="h-1.5 w-full bg-[#0DB9D0]/20 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-[#0DB9D0] w-[74%] rounded-full shadow-[0_0_10px_#0DB9D0]" />
        </div>
        <div className="flex justify-between font-mono text-[10px] text-[#7ABBD4]">
          <span>LOAD: 74%</span>
          <span>RESERVE: 48H</span>
        </div>
      </motion.div>

    </div>
  );
}
