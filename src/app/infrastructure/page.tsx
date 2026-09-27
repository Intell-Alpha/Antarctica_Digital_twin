"use client";
import { DoubleBezel } from "@/components/DoubleBezel";
import { motion } from "framer-motion";
import { MapTrifold } from "@phosphor-icons/react";

export default function InfrastructurePage() {
  return (
    <main className="min-h-[100dvh] w-full px-4 py-8 pt-28 md:px-8 md:py-32">
      <div className="max-w-7xl mx-auto flex flex-col gap-8 md:gap-12">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-sans tracking-tight font-medium text-white flex items-center gap-4">
            <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <MapTrifold size={32} weight="light" />
            </div>
            Infrastructure
          </h1>
          <p className="text-[#a1a1aa] mt-4 max-w-lg leading-relaxed">
            Spatial representation, physical spaces, and structural asset health.
          </p>
        </motion.header>
        <motion.div 
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
        >
          <DoubleBezel className="h-[500px] w-full" innerClassName="flex items-center justify-center bg-black/40">
             <span className="text-zinc-500 font-mono tracking-widest">[ 3D ASSET VIEWER MODULE ]</span>
          </DoubleBezel>
        </motion.div>
      </div>
    </main>
  );
}
