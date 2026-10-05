"use client";

import React from "react";
import { motion } from "framer-motion";

export const EASE = [0.32, 0.72, 0, 1] as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.12, ease: EASE },
  }),
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: { duration: 0.9, delay: i * 0.1, ease: EASE },
  }),
};

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="h-px w-8 bg-[#0DB9D0]/40" />
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#3A6A7A]">
        {children}
      </span>
    </div>
  );
}

export interface StatBlockProps {
  value: string;
  unit?: string;
  label: string;
  accent: string;
  delay?: number;
}

export function StatBlock({ value, unit, label, accent, delay }: StatBlockProps) {
  return (
    <motion.div
      variants={fadeUp}
      custom={delay ?? 0}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className="relative group overflow-hidden flex flex-col gap-2 p-6 rounded-2xl bg-[#03060E]/40 backdrop-blur-xl border border-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.1)] hover:bg-[#03060E]/70 hover:border-white/[0.15] transition-all duration-500 hover:-translate-y-1"
    >
      {/* Ambient background glow */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 blur-[60px] opacity-20 group-hover:opacity-50 transition-opacity duration-700 bg-current ${accent}`} />

      <div className="relative z-10">
        <div className={`font-mono text-4xl sm:text-5xl font-bold tracking-tight drop-shadow-[0_0_12px_currentColor] ${accent}`}>
          {value}
          {unit && (
            <span className="text-2xl sm:text-3xl ml-1 opacity-60">{unit}</span>
          )}
        </div>
        <p className="text-[13px] text-[#7ABBD4] font-sans leading-relaxed mt-1 font-medium">
          {label}
        </p>
      </div>
    </motion.div>
  );
}
