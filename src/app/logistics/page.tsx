"use client";
import { DoubleBezel } from "@/components/DoubleBezel";
import { motion } from "framer-motion";
import { Factory } from "@phosphor-icons/react";

export default function LogisticsPage() {
  return (
    <main className="min-h-[100dvh] w-full px-4 py-8 pt-28 md:px-8 md:py-32">
      <div className="max-w-7xl mx-auto flex flex-col gap-8 md:gap-12">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-sans tracking-tight font-medium text-white flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Factory size={32} weight="light" />
            </div>
            Logistics
          </h1>
          <p className="text-[#a1a1aa] mt-4 max-w-lg leading-relaxed">
            Resource autonomy, inventory levels (food, medical, parts), and resupply management.
          </p>
        </motion.header>
        <motion.div 
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
          className="grid grid-cols-1 gap-6"
        >
          <DoubleBezel className="h-[400px]" innerClassName="flex flex-col p-8">
             <h3 className="text-xl font-medium text-white">Estimated Autonomy Timeline</h3>
             <div className="flex-1 flex items-center justify-center"><span className="text-zinc-600 font-mono">[ LIFESPAN & RESUPPLY GANTT CHART ]</span></div>
          </DoubleBezel>
        </motion.div>
      </div>
    </main>
  );
}
