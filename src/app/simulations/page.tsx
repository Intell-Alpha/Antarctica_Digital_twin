"use client";
import { DoubleBezel } from "@/components/DoubleBezel";
import { motion } from "framer-motion";
import { Graph } from "@phosphor-icons/react";

export default function SimulationsPage() {
  return (
    <main className="min-h-[100dvh] w-full px-4 py-8 pt-28 md:px-8 md:py-32">
      <div className="max-w-7xl mx-auto flex flex-col gap-8 md:gap-12">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-sans tracking-tight font-medium text-white flex items-center gap-4">
            <div className="p-3 rounded-full bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">
              <Graph size={32} weight="light" />
            </div>
            Simulations
          </h1>
          <p className="text-[#a1a1aa] mt-4 max-w-lg leading-relaxed">
            What-if scenario testing and counterfactual modeling.
          </p>
        </motion.header>
        <motion.div 
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
          className="grid grid-cols-1 gap-6"
        >
          <DoubleBezel className="h-[500px]" innerClassName="flex flex-col p-8">
             <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
               <h3 className="text-xl font-medium text-white">Scenario Engine</h3>
               <button className="px-4 py-2 bg-white text-black text-sm font-medium rounded-full">Run Simulation</button>
             </div>
             <div className="flex-1 flex flex-col md:flex-row gap-8">
                <div className="flex-1 border border-white/5 rounded-2xl bg-white/5 flex items-center justify-center">
                   <span className="text-zinc-500 font-mono text-sm tracking-widest">[ BASELINE STATE ]</span>
                </div>
                <div className="flex-1 border border-fuchsia-500/20 rounded-2xl bg-fuchsia-500/5 flex items-center justify-center">
                   <span className="text-fuchsia-500/50 font-mono text-sm tracking-widest">[ PROJECTED IMPACT ]</span>
                </div>
             </div>
          </DoubleBezel>
        </motion.div>
      </div>
    </main>
  );
}
