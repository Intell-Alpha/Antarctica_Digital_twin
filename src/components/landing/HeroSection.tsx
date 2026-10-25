"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Flask, Compass, Radio } from "@phosphor-icons/react";
import { TelemetryTicker } from "@/components/TelemetryTicker";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Precision cubic-bezier for cinematic reveals (snappy entry, luxurious settle)
const EASE_CINEMATIC = [0.16, 1, 0.3, 1] as const;

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroDrift = useTransform(
    scrollYProgress,
    [0, 0.6],
    prefersReducedMotion ? [0, 0] : [0, -50]
  );

  // Motion variants with strict adherence to prefers-reduced-motion
  const eyebrowVariants = {
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 18,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.15 : 0.45,
        delay: prefersReducedMotion ? 0 : 0.1,
        ease: EASE_CINEMATIC,
      },
    },
  };

  const headlineItemVariants = {
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 42,
    },
    visible: (customIndex: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.15 : 0.6,
        delay: prefersReducedMotion ? 0 : 0.22 + customIndex * 0.12,
        ease: EASE_CINEMATIC,
      },
    }),
  };

  const subCopyVariants = {
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 20,
    },
    visible: {
      opacity: 0.85,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.15 : 0.5,
        delay: prefersReducedMotion ? 0 : 0.58,
        ease: EASE_CINEMATIC,
      },
    },
  };

  const ctaVariants = {
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 22,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.15 : 0.48,
        delay: prefersReducedMotion ? 0 : 0.7,
        ease: EASE_CINEMATIC,
      },
    },
  };

  const scrollHintVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: prefersReducedMotion ? 0.15 : 0.4,
        delay: prefersReducedMotion ? 0 : 0.85,
      },
    },
  };

  return (
    <>
      {/* ── 1. Hero Photographic Background with Cinematic Zoom In ── */}
      <motion.div
        initial={{
          opacity: 0,
          scale: prefersReducedMotion ? 1 : 1.05,
        }}
        animate={{
          opacity: 0.85,
          scale: 1,
        }}
        transition={{
          duration: prefersReducedMotion ? 0.2 : 1.1,
          ease: EASE_CINEMATIC,
        }}
        className="absolute top-0 left-0 w-full h-[100vh] z-0 pointer-events-none select-none overflow-hidden"
      >
        <Image
          src="/backgrounds/antarctic-bg.jpg"
          alt="Antarctic Research Station Terrain"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_75%] opacity-[0.85] mix-blend-screen"
          style={{
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 85%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 85%, transparent 100%)",
          }}
        />
        <div className="absolute inset-0 bg-[#0DB9D0]/5 mix-blend-color-dodge" />
      </motion.div>

      {/* ── 2. Tactical Polar Radar Rings & Topographic Contour Layer ── */}
      <motion.div
        initial={{
          opacity: 0,
          scale: prefersReducedMotion ? 1 : 0.95,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          duration: prefersReducedMotion ? 0.2 : 0.9,
          delay: prefersReducedMotion ? 0 : 0.05,
          ease: EASE_CINEMATIC,
        }}
        className="absolute top-0 left-0 w-full h-[100vh] z-0 pointer-events-none select-none overflow-hidden flex items-center justify-end pr-0 lg:pr-12"
        aria-hidden="true"
      >
        <div className="relative w-[340px] h-[340px] sm:w-[540px] sm:h-[540px] md:w-[680px] md:h-[680px] lg:w-[840px] lg:h-[840px] translate-x-12 sm:translate-x-16 lg:translate-x-4 opacity-40">
          
          {/* Breathing Radar Rings SVG */}
          <svg
            className={`w-full h-full ${prefersReducedMotion ? "" : "hero-radar-pulse"}`}
            viewBox="0 0 800 800"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Concentric Polar Range Rings */}
            <circle cx="400" cy="400" r="100" stroke="#0DB9D0" strokeWidth="0.8" strokeDasharray="3 6" opacity="0.3" />
            <circle cx="400" cy="400" r="180" stroke="#0DB9D0" strokeWidth="1" opacity="0.25" />
            <circle cx="400" cy="400" r="260" stroke="#7ABBD4" strokeWidth="0.8" strokeDasharray="6 6" opacity="0.2" />
            <circle cx="400" cy="400" r="340" stroke="#0DB9D0" strokeWidth="1.2" opacity="0.18" />
            <circle cx="400" cy="400" r="390" stroke="#00D4A0" strokeWidth="0.6" strokeDasharray="2 4" opacity="0.15" />

            {/* Latitude Range Labels */}
            <text x="408" y="295" fill="#0DB9D0" opacity="0.45" fontSize="9" fontFamily="var(--font-mono)" letterSpacing="0.18em">85°S POLAR</text>
            <text x="408" y="215" fill="#0DB9D0" opacity="0.4" fontSize="9" fontFamily="var(--font-mono)" letterSpacing="0.18em">80°S SHELF</text>
            <text x="408" y="135" fill="#7ABBD4" opacity="0.35" fontSize="9" fontFamily="var(--font-mono)" letterSpacing="0.18em">75°S PLATEAU</text>
            <text x="408" y="55" fill="#0DB9D0" opacity="0.3" fontSize="9" fontFamily="var(--font-mono)" letterSpacing="0.18em">70°S COASTAL</text>

            {/* Radial Azimuth Bearing Lines */}
            <line x1="400" y1="20" x2="400" y2="780" stroke="#0DB9D0" strokeWidth="0.75" strokeDasharray="4 8" opacity="0.2" />
            <line x1="20" y1="400" x2="780" y2="400" stroke="#0DB9D0" strokeWidth="0.75" strokeDasharray="4 8" opacity="0.2" />
            <line x1="131" y1="131" x2="669" y2="669" stroke="#0DB9D0" strokeWidth="0.5" opacity="0.12" />
            <line x1="131" y1="669" x2="669" y2="131" stroke="#0DB9D0" strokeWidth="0.5" opacity="0.12" />

            {/* Center South Pole Crosshair */}
            <circle cx="400" cy="400" r="4" fill="#0DB9D0" opacity="0.8" />
            <circle cx="400" cy="400" r="14" stroke="#0DB9D0" strokeWidth="1" opacity="0.5" />
            <line x1="390" y1="400" x2="410" y2="400" stroke="#EBF5FC" strokeWidth="1.5" />
            <line x1="400" y1="390" x2="400" y2="410" stroke="#EBF5FC" strokeWidth="1.5" />

            {/* Floating Topographic Elevation Contours */}
            <g className={prefersReducedMotion ? "" : "hero-topo-float"}>
              <path
                d="M 120,440 Q 240,360 360,420 T 600,380 T 740,460"
                stroke="#0DB9D0"
                strokeWidth="1.2"
                fill="none"
                opacity="0.28"
              />
              <path
                d="M 160,490 Q 280,410 400,470 T 640,430 T 780,510"
                stroke="#7ABBD4"
                strokeWidth="0.9"
                fill="none"
                opacity="0.22"
              />
              <path
                d="M 100,390 Q 220,310 340,370 T 580,330 T 720,410"
                stroke="#00D4A0"
                strokeWidth="0.8"
                strokeDasharray="4 4"
                fill="none"
                opacity="0.2"
              />
              <path
                d="M 200,550 Q 320,470 440,530 T 680,490 T 760,570"
                stroke="#0DB9D0"
                strokeWidth="0.75"
                fill="none"
                opacity="0.16"
              />
            </g>

            {/* Maitri Station Tactical Radar Reticle */}
            <g transform="translate(290, 240)">
              <circle cx="0" cy="0" r="12" stroke="#0DB9D0" strokeWidth="1" className={prefersReducedMotion ? "" : "hero-ping-ring"} opacity="0.6" />
              <circle cx="0" cy="0" r="3.5" fill="#00D4A0" />
              <text x="14" y="4" fill="#EBF5FC" fontSize="10" fontFamily="var(--font-mono)" letterSpacing="0.1em" fontWeight="600">MAITRI</text>
              <text x="14" y="16" fill="#7ABBD4" fontSize="8" fontFamily="var(--font-mono)" letterSpacing="0.08em" opacity="0.7">70°45&apos;S 11°44&apos;E</text>
            </g>

            {/* Bharati Station Tactical Radar Reticle */}
            <g transform="translate(560, 260)">
              <circle cx="0" cy="0" r="12" stroke="#0DB9D0" strokeWidth="1" className={prefersReducedMotion ? "" : "hero-ping-ring"} opacity="0.6" />
              <circle cx="0" cy="0" r="3.5" fill="#00D4A0" />
              <text x="14" y="4" fill="#EBF5FC" fontSize="10" fontFamily="var(--font-mono)" letterSpacing="0.1em" fontWeight="600">BHARATI</text>
              <text x="14" y="16" fill="#7ABBD4" fontSize="8" fontFamily="var(--font-mono)" letterSpacing="0.08em" opacity="0.7">69°24&apos;S 76°11&apos;E</text>
            </g>
          </svg>

          {/* Rotating Radar Sweep Conic Beam */}
          {!prefersReducedMotion && (
            <div
              className="hero-radar-sweep absolute inset-0 rounded-full pointer-events-none"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 75%, rgba(13, 185, 208, 0.04) 90%, rgba(13, 185, 208, 0.16) 100%)",
              }}
            />
          )}
        </div>
      </motion.div>

      {/* ── 3. Main Hero Interactive Content ── */}
      <section
        ref={heroRef}
        className="relative z-10 min-h-[100dvh] flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-24 max-w-7xl mx-auto"
      >
        {/* Antarctic Snowfall Ambience */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="polar-snow opacity-40" aria-hidden="true" />
        </div>

        <motion.div
          style={{ opacity: heroOpacity, y: heroDrift }}
          className="flex flex-col relative z-10"
        >
          {/* Eyebrow Mission Badge */}
          <motion.div
            variants={eyebrowVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center gap-3 sm:gap-4 mb-9 font-mono text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-[#7ABBD4]"
          >
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#0DB9D0]/10 border border-[#0DB9D0]/30 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D4A0] shadow-[0_0_8px_#00D4A0] animate-pulse" />
              <span className="font-semibold text-[#EBF5FC]">NCPOR · MoES</span>
            </div>
            <div className="hidden sm:block w-8 h-px bg-[#0DB9D0]/30" />
            <span className="text-[#3A7A8A]">44th ISEA Mission</span>
            <div className="hidden md:flex items-center gap-2 text-[9px] text-[#4A7A8E] pl-2 border-l border-[#0DB9D0]/20">
              <Radio size={12} className="text-[#0DB9D0] animate-pulse" />
              <span>POLAR TWIN TELEMETRY LIVE</span>
            </div>
          </motion.div>

          {/* Semantic Single H1 with Staggered Masked Reveal Lines */}
          <h1
            aria-label="India's Antarctic research stations — now virtualized."
            className="flex flex-col text-[clamp(2.75rem,7.2vw,6.6rem)] font-semibold tracking-[-0.04em] leading-[1.04] text-[#EBF5FC] mb-9 select-text"
          >
            <span className="overflow-hidden block">
              <motion.span
                variants={headlineItemVariants}
                custom={0}
                initial="hidden"
                animate="visible"
                className="block"
              >
                India&apos;s Antarctic
              </motion.span>
            </span>
            <span className="overflow-hidden block">
              <motion.span
                variants={headlineItemVariants}
                custom={1}
                initial="hidden"
                animate="visible"
                className="block"
              >
                research stations —
              </motion.span>
            </span>
            <span className="overflow-hidden block">
              <motion.span
                variants={headlineItemVariants}
                custom={2}
                initial="hidden"
                animate="visible"
                className="block bg-gradient-to-r from-[#EBF5FC] via-[#A8E8F5] to-[#0DB9D0] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(13,185,208,0.3)]"
              >
                now virtualized.
              </motion.span>
            </span>
          </h1>

          {/* Sub-copy with Crisp Delayed Entry */}
          <motion.p
            variants={subCopyVariants}
            initial="hidden"
            animate="visible"
            className="text-[15px] sm:text-[17px] text-[#7ABBD4] font-light leading-relaxed max-w-2xl mb-12 opacity-85"
          >
            A real-time Digital Twin of{" "}
            <strong className="text-[#EBF5FC] font-medium">Maitri</strong> and{" "}
            <strong className="text-[#EBF5FC] font-medium">Bharati</strong>{" "}
            research stations. Predict microgrid failures, freeze cascades, and
            fuel runways — from 11,000 km away.
          </motion.p>

          {/* CTA Row with Tactical Cockpit Accent & Staggered Reveal */}
          <motion.div
            variants={ctaVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center gap-0 pl-6 pr-2 py-2.5 rounded-full bg-[#0DB9D0]/15 backdrop-blur-md border border-[#0DB9D0]/40 text-white font-mono text-xs uppercase tracking-widest hover:bg-[#0DB9D0]/25 hover:border-[#0DB9D0]/70 transition-all duration-300 active:scale-[0.97] shadow-[0_0_24px_rgba(13,185,208,0.2)] hover:shadow-[0_0_36px_rgba(13,185,208,0.4)] overflow-hidden"
            >
              {/* Subtle top edge shimmer */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
                <div className="hero-cta-shimmer absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
              </div>

              <span className="mr-5 font-semibold text-[#EBF5FC] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D4A0] shadow-[0_0_6px_#00D4A0]" />
                Enter the Cockpit
              </span>
              <span className="w-8 h-8 rounded-full bg-[#0DB9D0]/20 group-hover:bg-[#0DB9D0]/40 flex items-center justify-center transition-all text-white border border-[#0DB9D0]/30">
                <ArrowUpRight
                  size={14}
                  weight="bold"
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
            </Link>

            <Link
              href="/dashboard/simulations"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full border border-[#0DB9D0]/25 bg-[#0DB9D0]/5 hover:bg-[#0DB9D0]/15 hover:border-[#0DB9D0]/50 text-[#7ABBD4] hover:text-[#EBF5FC] font-mono text-xs uppercase tracking-widest transition-all duration-300 backdrop-blur-sm shadow-[0_0_15px_rgba(13,185,208,0.0)] hover:shadow-[0_0_20px_rgba(13,185,208,0.15)] active:scale-[0.97]"
            >
              <Flask size={14} weight="duotone" className="text-[#0DB9D0]" />
              <span className="font-semibold">Simulate a Crisis</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Hint */}
        <motion.div
          variants={scrollHintVariants}
          initial="hidden"
          animate="visible"
          className="absolute bottom-16 left-6 sm:left-10 lg:left-16 flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-[#4A7A8E]"
        >
          <div className="w-px h-8 bg-gradient-to-b from-transparent via-[#0DB9D0]/50 to-transparent animate-pulse" />
          <span>Scroll to explore</span>
        </motion.div>

        {/* Live Station Telemetry Bar */}
        <TelemetryTicker delay={0.9} duration={0.4} />
      </section>
    </>
  );
}

