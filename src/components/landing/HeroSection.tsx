"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Flask } from "@phosphor-icons/react";
import { TelemetryTicker } from "@/components/TelemetryTicker";
import { fadeUp } from "./LandingShared";

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroDrift = useTransform(scrollYProgress, [0, 0.6], [0, -60]);

  return (
    <>
      {/* Hero Photographic Background (Fades into black) */}
      <div className="absolute top-0 left-0 w-full h-[100vh] z-0 pointer-events-none select-none overflow-hidden">
        <img
          src="/backgrounds/antarctic-bg.jpg"
          alt=""
          className="w-full h-full object-cover object-[center_75%] opacity-[0.85] mix-blend-screen"
          style={{
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 85%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 85%, transparent 100%)",
          }}
        />
        <div className="absolute inset-0 bg-[#0DB9D0]/5 mix-blend-color-dodge" />
      </div>

      <section
        ref={heroRef}
        className="relative z-10 min-h-[100dvh] flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-24 max-w-7xl mx-auto"
      >
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="polar-snow opacity-40" aria-hidden="true" />
        </div>

        <motion.div
          style={{ opacity: heroOpacity, y: heroDrift }}
          className="flex flex-col"
        >
          {/* Eyebrow */}
          <motion.div
            variants={fadeUp}
            custom={0}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center gap-3 sm:gap-4 mb-10 font-mono text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-[#7ABBD4]"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-[#0DB9D0] shadow-[0_0_8px_rgba(13,185,208,0.6)] animate-pulse" />
              <span className="font-semibold text-[#EBF5FC]">NCPOR · MoES</span>
            </div>
            <div className="hidden sm:block w-8 h-px bg-[#0DB9D0]/30" />
            <span className="text-[#3A7A8A]">44th ISEA Mission</span>
          </motion.div>

          {/* Cinematic staggered headline */}
          <div className="overflow-hidden mb-2">
            <motion.h1
              variants={fadeUp}
              custom={0.5}
              initial="hidden"
              animate="visible"
              className="text-[clamp(2.8rem,7.5vw,6.8rem)] font-semibold tracking-[-0.04em] leading-[1.04] text-[#EBF5FC]"
            >
              India&apos;s Antarctic
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-2">
            <motion.h1
              variants={fadeUp}
              custom={0.65}
              initial="hidden"
              animate="visible"
              className="text-[clamp(2.8rem,7.5vw,6.8rem)] font-semibold tracking-[-0.04em] leading-[1.04] text-[#EBF5FC]"
            >
              research stations —
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-10">
            <motion.h1
              variants={fadeUp}
              custom={0.8}
              initial="hidden"
              animate="visible"
              className="text-[clamp(2.8rem,7.5vw,6.8rem)] font-semibold tracking-[-0.04em] leading-[1.04] text-[#EBF5FC] opacity-90"
            >
              now virtualized.
            </motion.h1>
          </div>

          {/* Sub-copy */}
          <motion.p
            variants={fadeUp}
            custom={1.1}
            initial="hidden"
            animate="visible"
            className="text-[15px] sm:text-[17px] text-[#7ABBD4] font-light leading-relaxed max-w-2xl mb-12 opacity-80"
          >
            A real-time Digital Twin of{" "}
            <strong className="text-[#EBF5FC] font-medium">Maitri</strong> and{" "}
            <strong className="text-[#EBF5FC] font-medium">Bharati</strong>{" "}
            research stations. Predict microgrid failures, freeze cascades, and
            fuel runways — from 11,000 km away.
          </motion.p>

          {/* CTA Row */}
          <motion.div
            variants={fadeUp}
            custom={1.3}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-0 pl-6 pr-2 py-2 rounded-full bg-[#0DB9D0]/15 backdrop-blur-md border border-[#0DB9D0]/30 text-white font-mono text-xs uppercase tracking-widest hover:bg-[#0DB9D0]/25 hover:border-[#0DB9D0]/50 transition-all duration-300 active:scale-[0.97] shadow-[0_0_20px_rgba(13,185,208,0.15)] hover:shadow-[0_0_30px_rgba(13,185,208,0.3)]"
            >
              <span className="mr-5 font-semibold">Enter the Cockpit</span>
              <span className="w-8 h-8 rounded-full bg-[#0DB9D0]/20 group-hover:bg-[#0DB9D0]/40 flex items-center justify-center transition-all text-white">
                <ArrowUpRight
                  size={14}
                  weight="bold"
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
            </Link>

            <Link
              href="/dashboard/simulations"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#0DB9D0]/20 bg-[#0DB9D0]/5 hover:bg-[#0DB9D0]/15 hover:border-[#0DB9D0]/40 text-[#7ABBD4] hover:text-white font-mono text-xs uppercase tracking-widest transition-all duration-300 backdrop-blur-sm shadow-[0_0_15px_rgba(13,185,208,0.0)] hover:shadow-[0_0_20px_rgba(13,185,208,0.1)]"
            >
              <Flask size={13} weight="duotone" />
              <span className="font-semibold">Simulate a Crisis</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="absolute bottom-16 left-6 sm:left-10 lg:left-16 flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-[#1E3A48]"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            className="w-px h-8 bg-gradient-to-b from-transparent via-[#0DB9D0]/40 to-transparent"
          />
          Scroll to explore
        </motion.div>

        <TelemetryTicker />
      </section>
    </>
  );
}
