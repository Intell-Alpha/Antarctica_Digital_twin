"use client";
import { DoubleBezel } from "@/components/DoubleBezel";
import { motion } from "framer-motion";
import { BatteryCharging } from "@phosphor-icons/react";

export default function EnergyPage() {
  return (
    <main className="min-h-[100dvh] w-full px-4 py-8 pt-28 md:px-8 md:py-32">
      <div className="max-w-7xl mx-auto flex flex-col gap-8 md:gap-12">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-sans tracking-tight font-medium text-white flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BatteryCharging size={32} weight="light" />
            </div>
            Energy & Fuel
          </h1>
          <p className="text-[#a1a1aa] mt-4 max-w-lg leading-relaxed">
            Power generation, generator loads, fuel consumption, and battery systems.
          </p>
        </motion.header>
        <motion.div 
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <DoubleBezel className="h-[300px]" innerClassName="flex flex-col p-8">
             <h3 className="text-xl font-medium text-white">Generator Array (Ravi, Surya, Aditya)</h3>
             <div className="flex-1 flex items-center justify-center"><span className="text-zinc-600 font-mono">[ LOAD DISTRIBUTION CHART ]</span></div>
          </DoubleBezel>
          <DoubleBezel className="h-[300px]" innerClassName="flex flex-col p-8">
             <h3 className="text-xl font-medium text-white">Fuel Consumption Rate</h3>
             <div className="flex-1 flex items-center justify-center"><span className="text-zinc-600 font-mono">[ CONSUMPTION TRENDS ]</span></div>
          </DoubleBezel>
        </motion.div>
      </div>
    </main>
  );
}
